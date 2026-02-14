const User = require('../models/User');
const PendingRegistration = require('../models/PendingRegistration');
const AuthLog = require('../models/AuthLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { verifyRecaptchaToken } = require('../services/recaptchaService');

// Generate OTP code (6 digits)
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter with robust error handling
const createTransporter = () => {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) {
        return null;
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
    });
};

// Send OTP email
const sendOTPEmail = async (email, firstName, otpCode) => {
    const transporter = createTransporter();

    if (!transporter) {
        throw new Error('SMTP not configured. Set SMTP_USER and SMTP_PASS environment variables.');
    }

    const mailOptions = {
        from: `"Project Workspace" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify Your Email - Registration OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Welcome to Project Workspace!</h2>
                <p>Hello ${firstName},</p>
                <p>Thank you for registering. Please use the following OTP code to verify your email address:</p>
                <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">${otpCode}</span>
                </div>
                <p style="color: #6B7280; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
                <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                <p style="color: #9CA3AF; font-size: 12px;">Project Workspace - Capstone Management System</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user (Step 1 - Send OTP)
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, department } = req.body;

        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Delete any existing pending registration for this email
        await PendingRegistration.deleteMany({ email });

        // Create pending registration
        await PendingRegistration.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            department: department || 'IT',
            otpCode,
            otpExpiresAt,
        });

        // Send OTP email
        try {
            await sendOTPEmail(email, firstName, otpCode);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            await PendingRegistration.deleteMany({ email });
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }

        res.status(200).json({
            message: 'OTP sent to your email. Please verify to complete registration.',
            email,
            requiresOTP: true,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({ message: 'Email and OTP code are required' });
        }

        // Find pending registration
        const pendingRegistration = await PendingRegistration.findOne({ email });
        
        if (!pendingRegistration) {
            return res.status(400).json({ message: 'No pending registration found. Please register again.' });
        }

        // Check if OTP expired
        if (new Date() > pendingRegistration.otpExpiresAt) {
            await PendingRegistration.deleteMany({ email });
            return res.status(400).json({ message: 'OTP has expired. Please register again.' });
        }

        // Verify OTP
        if (pendingRegistration.otpCode !== otpCode) {
            return res.status(400).json({ message: 'Invalid OTP code' });
        }

        // Check if user was created in the meantime
        const userExists = await User.findOne({ email });
        if (userExists) {
            await PendingRegistration.deleteMany({ email });
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create the actual user
        const user = await User.create({
            firstName: pendingRegistration.firstName,
            lastName: pendingRegistration.lastName,
            email: pendingRegistration.email,
            password: pendingRegistration.password, // Already hashed
            role: pendingRegistration.role,
            department: pendingRegistration.department,
        });

        // Delete pending registration
        await PendingRegistration.deleteMany({ email });

        if (user) {
            res.status(201).json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Failed to create user' });
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Find pending registration
        const pendingRegistration = await PendingRegistration.findOne({ email });
        
        if (!pendingRegistration) {
            return res.status(400).json({ message: 'No pending registration found. Please register again.' });
        }

        // Generate new OTP
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update pending registration
        pendingRegistration.otpCode = otpCode;
        pendingRegistration.otpExpiresAt = otpExpiresAt;
        await pendingRegistration.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, pendingRegistration.firstName, otpCode);
        } catch (emailError) {
            console.error('Failed to resend OTP email:', emailError);
            return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
        }

        res.status(200).json({
            message: 'New OTP sent to your email.',
            email,
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password, recaptchaToken } = req.body;

        // Skip reCAPTCHA in development mode
        const isDev = process.env.NODE_ENV !== 'production';
        
        if (!isDev) {
            if (!process.env.RECAPTCHA_SECRET_KEY) {
                return res.status(500).json({ message: 'reCAPTCHA is not configured' });
            }

            if (!String(recaptchaToken || '').trim()) {
                return res.status(400).json({ message: 'reCAPTCHA required' });
            }

            const recaptchaResult = await verifyRecaptchaToken({ token: recaptchaToken, remoteIp: req.ip });
            if (!recaptchaResult.success) {
                return res.status(403).json({ message: 'reCAPTCHA verification failed' });
            }
        }

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const normalizeEmail = (email) => {
    return String(email || '').trim().toLowerCase();
};

const getResetSecret = () => {
    return process.env.RESET_CODE_SECRET || process.env.JWT_SECRET || 'dev_reset_secret';
};

const hashResetCode = (code) => {
    return crypto.createHmac('sha256', getResetSecret()).update(String(code)).digest('hex');
};

const resetRequestTracker = new Map();
const resetVerifyTracker = new Map();

const checkRateLimit = (tracker, key, options) => {
    const now = Date.now();
    const { windowMs, maxInWindow, minIntervalMs } = options;

    const existing = tracker.get(key);
    if (!existing) {
        tracker.set(key, { windowStartMs: now, count: 1, lastRequestMs: now });
        return { limited: false };
    }

    const windowStartMs = existing.windowStartMs || now;
    const count = typeof existing.count === 'number' ? existing.count : 0;
    const lastRequestMs = existing.lastRequestMs || 0;

    const inSameWindow = now - windowStartMs <= windowMs;
    const nextWindowStart = inSameWindow ? windowStartMs : now;
    const nextCount = inSameWindow ? count + 1 : 1;

    const intervalHit = typeof minIntervalMs === 'number' && minIntervalMs > 0 && (now - lastRequestMs < minIntervalMs);
    const windowHit = typeof maxInWindow === 'number' && maxInWindow > 0 && nextCount > maxInWindow;

    tracker.set(key, { windowStartMs: nextWindowStart, count: nextCount, lastRequestMs: now });

    if (intervalHit || windowHit) {
        return { limited: true };
    }

    return { limited: false };
};

const createAuthLog = async ({ userId, email, eventType, req }) => {
    try {
        await AuthLog.create({
            user: userId || null,
            email: email || null,
            eventType,
            ip: req?.ip || null,
            userAgent: req?.get?.('user-agent') || null
        });
    } catch (error) {
        // Do not fail the request due to audit log write.
        console.error('AuthLog write failed:', error.message);
    }
};

// @desc    Request password reset via email code
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const limiterKey = `reset-request:${email}`;
        const limiter = checkRateLimit(resetRequestTracker, limiterKey, {
            windowMs: 60 * 60 * 1000,
            maxInWindow: 5,
            minIntervalMs: 60 * 1000
        });

        if (limiter.limited) {
            await createAuthLog({ email, eventType: 'PASSWORD_RESET_RATE_LIMITED', req });
            return res.status(429).json({ message: 'Too many reset requests. Please try again later.' });
        }

        const transporter = createTransporter();
        const user = await User.findOne({ email });
        await createAuthLog({ userId: user?._id, email, eventType: 'PASSWORD_RESET_REQUESTED', req });

        if (user) {
            if (!transporter) {
                console.warn('SMTP not configured; skipping password reset email delivery.');
            } else {
                const code = crypto.randomInt(100000, 1000000).toString();
                const codeHash = hashResetCode(code);

                user.resetPasswordCodeHash = codeHash;
                user.resetPasswordCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
                user.resetPasswordRequestedAt = new Date();
                user.resetPasswordFailedAttempts = 0;
                user.resetPasswordBlockedUntil = null;

                await user.save();

                const from = process.env.SMTP_FROM || process.env.SMTP_USER;
                const appName = process.env.APP_NAME || 'Project Workspace';

                await transporter.sendMail({
                    from,
                    to: email,
                    subject: `${appName} password reset code`,
                    text: `Your password reset code is: ${code}\n\nThis code expires in 15 minutes. If you did not request this, you can ignore this email.`
                });

                await createAuthLog({ userId: user?._id, email, eventType: 'PASSWORD_RESET_EMAIL_SENT', req });
            }
        }

        // Anti-enumeration: same response regardless of user existence.
        return res.status(200).json({
            message: 'If an account exists for that email, a reset code will be sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Failed to process password reset request' });
    }
};

// @desc    Verify reset code and set new password
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body?.email);
        const code = String(req.body?.code || '').trim();
        const newPassword = String(req.body?.newPassword || '');

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: 'Email, code, and newPassword are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const limiterKey = `reset-verify:${email}`;
        const limiter = checkRateLimit(resetVerifyTracker, limiterKey, {
            windowMs: 15 * 60 * 1000,
            maxInWindow: 10,
            minIntervalMs: 0
        });

        if (limiter.limited) {
            await createAuthLog({ email, eventType: 'PASSWORD_RESET_RATE_LIMITED', req });
            return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            await createAuthLog({ email, eventType: 'PASSWORD_RESET_FAILED', req });
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        if (user.resetPasswordBlockedUntil && user.resetPasswordBlockedUntil.getTime() > Date.now()) {
            return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
        }

        const expiresAt = user.resetPasswordCodeExpiresAt ? user.resetPasswordCodeExpiresAt.getTime() : 0;
        if (!user.resetPasswordCodeHash || !expiresAt || expiresAt < Date.now()) {
            user.resetPasswordFailedAttempts = (user.resetPasswordFailedAttempts || 0) + 1;
            await user.save();

            await createAuthLog({ userId: user._id, email, eventType: 'PASSWORD_RESET_FAILED', req });
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const submittedHash = hashResetCode(code);
        if (submittedHash !== user.resetPasswordCodeHash) {
            user.resetPasswordFailedAttempts = (user.resetPasswordFailedAttempts || 0) + 1;

            if (user.resetPasswordFailedAttempts >= 5) {
                user.resetPasswordBlockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            }

            await user.save();

            await createAuthLog({ userId: user._id, email, eventType: 'PASSWORD_RESET_FAILED', req });

            if (user.resetPasswordBlockedUntil && user.resetPasswordBlockedUntil.getTime() > Date.now()) {
                return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
            }

            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordCodeHash = null;
        user.resetPasswordCodeExpiresAt = null;
        user.resetPasswordRequestedAt = null;
        user.resetPasswordFailedAttempts = 0;
        user.resetPasswordBlockedUntil = null;

        await user.save();

        await createAuthLog({ userId: user._id, email, eventType: 'PASSWORD_RESET_SUCCEEDED', req });
        return res.status(200).json({ message: 'Password reset successful. Please log in.' });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Failed to reset password' });
    }
};

// @desc    Get user data
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { firstName, lastName, gender, contactEmail, avatar, skills, yearLevel } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update allowed fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (gender !== undefined) user.gender = gender;
        if (contactEmail !== undefined) user.contactEmail = contactEmail;
        if (avatar !== undefined) user.avatar = avatar;
        if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
        if (yearLevel !== undefined) user.yearLevel = yearLevel;

        await user.save();

        // Return updated user (without password)
        const updatedUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            department: user.department,
            gender: user.gender,
            contactEmail: user.contactEmail,
            avatar: user.avatar,
            skills: user.skills,
            yearLevel: user.yearLevel,
        };

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// List users (Coordinator only)
exports.listUsers = async (req, res) => {
    try {
        const { role, department } = req.query;
        const query = {};

        if (role) query.role = role;
        if (department) query.department = department;

        const users = await User.find(query)
            .select('firstName lastName email role department yearLevel createdAt')
            .sort({ createdAt: -1 });

        return res.status(200).json({ users });
    } catch (error) {
        console.error('List users error:', error);
        return res.status(500).json({ message: 'Failed to load users' });
    }
};

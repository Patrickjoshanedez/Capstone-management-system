const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
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

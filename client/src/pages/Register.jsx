import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student',
        department: 'IT'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // OTP State
    const [showOTP, setShowOTP] = useState(false);
    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const [otpEmail, setOtpEmail] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const otpInputRefs = useRef([]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        setLoading(true);

        try {
            const response = await api.post('/auth/register', formData);

            if (response.data.requiresOTP) {
                setOtpEmail(response.data.email);
                setShowOTP(true);
                setResendTimer(60);
                setSuccess('OTP sent to your email. Please check your inbox.');
            } else {
                login(response.data);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            // Handle paste
            const pastedCode = value.slice(0, 6).split('');
            const newOtp = [...otpCode];
            pastedCode.forEach((char, i) => {
                if (index + i < 6) {
                    newOtp[index + i] = char;
                }
            });
            setOtpCode(newOtp);
            const nextIndex = Math.min(index + pastedCode.length, 5);
            otpInputRefs.current[nextIndex]?.focus();
            return;
        }

        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = async () => {
        const code = otpCode.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', {
                email: otpEmail,
                otpCode: code,
            });

            login(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/auth/resend-otp', { email: otpEmail });
            setResendTimer(60);
            setOtpCode(['', '', '', '', '', '']);
            setSuccess('New OTP sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToRegister = () => {
        setShowOTP(false);
        setOtpCode(['', '', '', '', '', '']);
        setOtpEmail('');
        setError('');
        setSuccess('');
    };

    // OTP Verification Screen
    if (showOTP) {
        return (
            <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-background tw-py-12">
                <Card className="tw-w-full tw-max-w-md">
                    <CardHeader>
                        <CardTitle className="tw-text-2xl tw-text-center">Verify Your Email</CardTitle>
                        <p className="tw-text-sm tw-text-muted-foreground tw-text-center tw-mt-2">
                            We've sent a 6-digit code to <span className="tw-font-medium tw-text-foreground">{otpEmail}</span>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="tw-space-y-6">
                            {error && (
                                <div className="tw-bg-red-500/10 dark:tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-text-red-700 dark:tw-text-red-300 tw-px-4 tw-py-3 tw-rounded">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border tw-border-emerald-500/30 tw-text-emerald-700 dark:tw-text-emerald-300 tw-px-4 tw-py-3 tw-rounded">
                                    {success}
                                </div>
                            )}

                            {/* OTP Input */}
                            <div className="tw-flex tw-justify-center tw-gap-2">
                                {otpCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpInputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="tw-w-12 tw-h-14 tw-text-center tw-text-2xl tw-font-bold tw-border tw-border-border tw-bg-background tw-text-foreground tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-indigo-500"
                                    />
                                ))}
                            </div>

                            <Button
                                onClick={handleVerifyOTP}
                                className="tw-w-full"
                                disabled={loading || otpCode.join('').length !== 6}
                            >
                                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                            </Button>

                            <div className="tw-text-center tw-space-y-2">
                                <p className="tw-text-sm tw-text-muted-foreground">
                                    Didn't receive the code?{' '}
                                    {resendTimer > 0 ? (
                                        <span className="tw-text-muted-foreground">Resend in {resendTimer}s</span>
                                    ) : (
                                        <button
                                            onClick={handleResendOTP}
                                            className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline tw-font-medium"
                                            disabled={loading}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </p>
                                <button
                                    onClick={handleBackToRegister}
                                    className="tw-text-sm tw-text-muted-foreground hover:tw-text-foreground hover:tw-underline"
                                >
                                    ← Back to registration
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Registration Form
    return (
        <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-background tw-py-12">
            <Card className="tw-w-full tw-max-w-md">
                <CardHeader>
                    <CardTitle className="tw-text-2xl tw-text-center">Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="tw-space-y-4">
                        {error && (
                            <div className="tw-bg-red-500/10 dark:tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-text-red-700 dark:tw-text-red-300 tw-px-4 tw-py-3 tw-rounded tw-relative">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border tw-border-emerald-500/30 tw-text-emerald-700 dark:tw-text-emerald-300 tw-px-4 tw-py-3 tw-rounded tw-relative">
                                {success}
                            </div>
                        )}
                        <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                            <div className="tw-space-y-2">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">First Name</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="tw-space-y-2">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="student@buksu.edu.ph"
                                value={formData.email}
                                onChange={handleChange}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-indigo-500"
                            >
                                <option value="student">Student</option>
                                <option value="adviser">Adviser</option>
                                <option value="coordinator">Coordinator</option>
                            </select>
                        </div>

                        <Button type="submit" className="tw-w-full" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Register'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="tw-justify-center">
                    <p className="tw-text-sm tw-text-muted-foreground">
                        Already have an account? <Link to="/login" className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;

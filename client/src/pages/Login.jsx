import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import api from '../services/api';
import ReCAPTCHA from 'react-google-recaptcha';

// Icons as inline SVGs for a cleaner look
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
    </svg>
);

const LoaderIcon = () => (
    <svg className="tw-animate-spin tw-h-5 tw-w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { darkMode, toggleDarkMode } = useTheme();

    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    const [recaptchaToken, setRecaptchaToken] = useState('');

    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordStatus, setForgotPasswordStatus] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    const [resetStep, setResetStep] = useState(1); // 1 = email, 2 = code + new password
    const [resetCode, setResetCode] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
    const [resetStatus, setResetStatus] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Mount animation
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!recaptchaSiteKey) {
            setError('reCAPTCHA is not configured');
            return;
        }

        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                recaptchaToken
            });

            login(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const openForgotPassword = () => {
        setForgotPasswordStatus('');
        setForgotPasswordError('');
        setResetStatus('');
        setResetError('');
        setResetStep(1);
        setForgotPasswordOpen(true);

        if (!forgotPasswordEmail && email) {
            setForgotPasswordEmail(email);
        }
    };

    const closeForgotPassword = () => {
        setForgotPasswordStatus('');
        setForgotPasswordError('');
        setForgotPasswordLoading(false);
        setResetCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setResetStatus('');
        setResetError('');
        setResetLoading(false);
        setResetStep(1);
        setForgotPasswordOpen(false);
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setForgotPasswordStatus('');
        setForgotPasswordError('');
        setForgotPasswordLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', {
                email: forgotPasswordEmail.trim(),
            });

            setForgotPasswordStatus(
                response?.data?.message || 'If an account exists for that email, a reset code will be sent.'
            );
            setResetStep(2);
        } catch (err) {
            setForgotPasswordError(err.response?.data?.message || 'Request failed');
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();

        setResetStatus('');
        setResetError('');

        const normalizedEmail = forgotPasswordEmail.trim();
        if (!normalizedEmail) {
            setResetError('Email is required');
            return;
        }

        if (!resetCode.trim()) {
            setResetError('Reset code is required');
            return;
        }

        if (!resetNewPassword || resetNewPassword.length < 8) {
            setResetError('New password must be at least 8 characters');
            return;
        }

        if (resetNewPassword !== resetConfirmPassword) {
            setResetError('Passwords do not match');
            return;
        }

        setResetLoading(true);

        try {
            const response = await api.post('/auth/reset-password', {
                email: normalizedEmail,
                code: resetCode.trim(),
                newPassword: resetNewPassword
            });

            setResetStatus(response?.data?.message || 'Password reset successful. Please log in.');
            setTimeout(() => {
                closeForgotPassword();
            }, 2000);
        } catch (err) {
            setResetError(err.response?.data?.message || 'Reset failed');
        } finally {
            setResetLoading(false);
        }
    };

    // Floating particles for background effect
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
    }));

    return (
        <div className={`tw-min-h-screen tw-relative tw-overflow-hidden tw-transition-all tw-duration-500 ${darkMode ? 'tw-bg-gradient-to-br tw-from-gray-900 tw-via-slate-900 tw-to-indigo-950' : 'tw-bg-gradient-to-br tw-from-indigo-50 tw-via-white tw-to-purple-50'}`}>
            {/* Animated background particles */}
            <div className="tw-absolute tw-inset-0 tw-overflow-hidden tw-pointer-events-none">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className={`tw-absolute tw-rounded-full ${darkMode ? 'tw-bg-indigo-500/20' : 'tw-bg-indigo-400/30'}`}
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Gradient orbs */}
            <div className={`tw-absolute tw-top-0 tw-left-0 tw-w-96 tw-h-96 tw-rounded-full tw-blur-3xl tw-opacity-30 tw-animate-pulse ${darkMode ? 'tw-bg-indigo-600' : 'tw-bg-indigo-300'}`} style={{ animation: 'pulse 4s ease-in-out infinite' }} />
            <div className={`tw-absolute tw-bottom-0 tw-right-0 tw-w-96 tw-h-96 tw-rounded-full tw-blur-3xl tw-opacity-30 tw-animate-pulse ${darkMode ? 'tw-bg-purple-600' : 'tw-bg-purple-300'}`} style={{ animation: 'pulse 4s ease-in-out infinite 2s' }} />

            {/* Dark mode toggle */}
            <button
                onClick={toggleDarkMode}
                className={`tw-absolute tw-top-6 tw-right-6 tw-z-50 tw-p-3 tw-rounded-full tw-shadow-lg tw-transition-colors tw-duration-300 hover:tw-scale-105 active:tw-scale-95 ${darkMode ? 'tw-bg-slate-800 tw-text-yellow-400 hover:tw-bg-slate-700' : 'tw-bg-white tw-text-slate-700 hover:tw-bg-gray-100'}`}
                aria-label="Toggle dark mode"
            >
                <div className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-transition-transform tw-duration-300 tw-ease-out" style={{ transform: darkMode ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    {darkMode ? <SunIcon /> : <MoonIcon />}
                </div>
            </button>

            {/* Main content */}
            <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-px-4 tw-py-12 tw-relative tw-z-10">
                <div className={`tw-w-full tw-max-w-md tw-transform tw-transition-all tw-duration-700 ${mounted ? 'tw-translate-y-0 tw-opacity-100' : 'tw-translate-y-8 tw-opacity-0'}`}>
                    {/* Logo/Brand */}
                    <div className="tw-text-center tw-mb-8">
                        <div className={`tw-inline-flex tw-items-center tw-justify-center tw-w-16 tw-h-16 tw-rounded-2xl tw-mb-4 tw-shadow-lg tw-transform tw-transition-transform hover:tw-scale-105 ${darkMode ? 'tw-bg-gradient-to-br tw-from-indigo-500 tw-to-purple-600' : 'tw-bg-gradient-to-br tw-from-indigo-500 tw-to-purple-600'}`}>
                            <span className="tw-text-2xl tw-font-bold tw-text-white">PW</span>
                        </div>
                        <h1 className={`tw-text-2xl tw-font-bold tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-white' : 'tw-text-gray-900'}`}>
                            Project Workspace
                        </h1>
                        <p className={`tw-mt-2 tw-text-sm tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-400' : 'tw-text-gray-600'}`}>
                            Capstone Management System
                        </p>
                    </div>

                    {/* Login Card */}
                    {!forgotPasswordOpen ? (
                        <Card className={`tw-backdrop-blur-xl tw-border tw-shadow-2xl tw-transition-all tw-duration-300 ${darkMode ? 'tw-bg-slate-900/80 tw-border-slate-700/50' : 'tw-bg-white/80 tw-border-gray-200/50'}`}>
                            <CardHeader className="tw-space-y-1 tw-pb-4">
                                <CardTitle className={`tw-text-2xl tw-font-bold tw-text-center tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-white' : 'tw-text-gray-900'}`}>
                                    Welcome back
                                </CardTitle>
                                <p className={`tw-text-center tw-text-sm tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-400' : 'tw-text-gray-600'}`}>
                                    Sign in to continue to your account
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="tw-space-y-5">
                                    {/* Error Alert */}
                                    {error && (
                                        <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-rounded-xl tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-animate-shake">
                                            <XCircleIcon className="tw-text-red-500 tw-flex-shrink-0" />
                                            <span className="tw-text-sm tw-text-red-500">{error}</span>
                                        </div>
                                    )}

                                    {/* Email Input */}
                                    <div className="tw-space-y-2">
                                        <label htmlFor="email" className={`tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-300' : 'tw-text-gray-700'}`}>
                                            Email Address
                                        </label>
                                        <div className="tw-relative tw-group">
                                            <div className={`tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 group-focus-within:tw-text-indigo-400' : 'tw-text-gray-400 group-focus-within:tw-text-indigo-500'}`}>
                                                <MailIcon />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="student@buksu.edu.ph"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`tw-w-full tw-h-12 tw-pl-11 tw-pr-4 tw-rounded-xl tw-border tw-transition-all tw-duration-300 tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-0 ${darkMode ? 'tw-bg-slate-800/50 tw-border-slate-600/50 tw-text-white placeholder:tw-text-gray-500 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20' : 'tw-bg-gray-50 tw-border-gray-200 tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20'}`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="tw-space-y-2">
                                        <div className="tw-flex tw-items-center tw-justify-between">
                                            <label htmlFor="password" className={`tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-300' : 'tw-text-gray-700'}`}>
                                                Password
                                            </label>
                                            <button
                                                type="button"
                                                onClick={openForgotPassword}
                                                className={`tw-text-xs tw-font-medium tw-transition-colors tw-duration-300 hover:tw-underline ${darkMode ? 'tw-text-indigo-400 hover:tw-text-indigo-300' : 'tw-text-indigo-600 hover:tw-text-indigo-700'}`}
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="tw-relative tw-group">
                                            <div className={`tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 group-focus-within:tw-text-indigo-400' : 'tw-text-gray-400 group-focus-within:tw-text-indigo-500'}`}>
                                                <LockIcon />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`tw-w-full tw-h-12 tw-pl-11 tw-pr-12 tw-rounded-xl tw-border tw-transition-all tw-duration-300 tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-0 ${darkMode ? 'tw-bg-slate-800/50 tw-border-slate-600/50 tw-text-white placeholder:tw-text-gray-500 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20' : 'tw-bg-gray-50 tw-border-gray-200 tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20'}`}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className={`tw-absolute tw-right-3 tw-top-1/2 tw--translate-y-1/2 tw-p-1 tw-rounded-lg tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 hover:tw-text-gray-300 hover:tw-bg-slate-700' : 'tw-text-gray-400 hover:tw-text-gray-600 hover:tw-bg-gray-100'}`}
                                            >
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* reCAPTCHA */}
                                    <div className="tw-flex tw-justify-center tw-py-2">
                                        {recaptchaSiteKey ? (
                                            <div className="tw-transform tw-transition-transform hover:tw-scale-[1.02]">
                                                <ReCAPTCHA
                                                    sitekey={recaptchaSiteKey}
                                                    onChange={(token) => setRecaptchaToken(token || '')}
                                                    onExpired={() => setRecaptchaToken('')}
                                                    theme={darkMode ? 'dark' : 'light'}
                                                />
                                            </div>
                                        ) : (
                                            <div className="tw-flex tw-items-center tw-gap-2 tw-text-amber-500 tw-text-xs tw-p-3 tw-rounded-lg tw-bg-amber-500/10">
                                                <XCircleIcon className="tw-w-4 tw-h-4" />
                                                reCAPTCHA is not configured
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="tw-w-full tw-h-12 tw-rounded-xl tw-font-semibold tw-text-white tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-600 hover:tw-from-indigo-600 hover:tw-to-purple-700 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-[1.02] active:tw-scale-[0.98] tw-shadow-lg hover:tw-shadow-indigo-500/25 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100"
                                    >
                                        {loading ? (
                                            <span className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                                <LoaderIcon />
                                                Signing in...
                                            </span>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="tw-flex tw-flex-col tw-gap-4 tw-pt-4">
                                <div className="tw-relative tw-w-full">
                                    <div className="tw-absolute tw-inset-0 tw-flex tw-items-center">
                                        <div className={`tw-w-full tw-border-t tw-transition-colors tw-duration-300 ${darkMode ? 'tw-border-slate-700' : 'tw-border-gray-200'}`} />
                                    </div>
                                    <div className="tw-relative tw-flex tw-justify-center tw-text-xs tw-uppercase">
                                        <span className={`tw-px-2 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-bg-slate-900/80 tw-text-gray-500' : 'tw-bg-white/80 tw-text-gray-500'}`}>
                                            New to Project Workspace?
                                        </span>
                                    </div>
                                </div>
                                <Link 
                                    to="/register" 
                                    className={`tw-w-full tw-h-12 tw-flex tw-items-center tw-justify-center tw-rounded-xl tw-border tw-font-medium tw-transition-all tw-duration-300 tw-transform hover:tw-scale-[1.02] active:tw-scale-[0.98] ${darkMode ? 'tw-border-slate-600 tw-text-white hover:tw-bg-slate-800' : 'tw-border-gray-300 tw-text-gray-700 hover:tw-bg-gray-50'}`}
                                >
                                    Create an account
                                </Link>
                            </CardFooter>
                        </Card>
                    ) : (
                        /* Forgot Password Modal Card */
                        <Card className={`tw-backdrop-blur-xl tw-border tw-shadow-2xl tw-transition-all tw-duration-300 tw-animate-fadeIn ${darkMode ? 'tw-bg-slate-900/80 tw-border-slate-700/50' : 'tw-bg-white/80 tw-border-gray-200/50'}`}>
                            <CardHeader className="tw-space-y-1 tw-pb-4">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <button
                                        onClick={closeForgotPassword}
                                        className={`tw-p-2 tw-rounded-lg tw-transition-colors tw-duration-300 ${darkMode ? 'hover:tw-bg-slate-800 tw-text-gray-400' : 'hover:tw-bg-gray-100 tw-text-gray-600'}`}
                                    >
                                        <ArrowLeftIcon />
                                    </button>
                                    <div>
                                        <CardTitle className={`tw-text-xl tw-font-bold tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-white' : 'tw-text-gray-900'}`}>
                                            {resetStep === 1 ? 'Reset Password' : 'Enter Reset Code'}
                                        </CardTitle>
                                        <p className={`tw-text-sm tw-mt-1 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-400' : 'tw-text-gray-600'}`}>
                                            {resetStep === 1 ? "We'll send you a reset code" : 'Check your email for the code'}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="tw-space-y-4">
                                {/* Status Messages */}
                                {forgotPasswordStatus && (
                                    <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-rounded-xl tw-bg-green-500/10 tw-border tw-border-green-500/20 tw-animate-fadeIn">
                                        <CheckCircleIcon className="tw-text-green-500 tw-flex-shrink-0" />
                                        <span className="tw-text-sm tw-text-green-500">{forgotPasswordStatus}</span>
                                    </div>
                                )}

                                {forgotPasswordError && (
                                    <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-rounded-xl tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-animate-shake">
                                        <XCircleIcon className="tw-text-red-500 tw-flex-shrink-0" />
                                        <span className="tw-text-sm tw-text-red-500">{forgotPasswordError}</span>
                                    </div>
                                )}

                                {resetStatus && (
                                    <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-rounded-xl tw-bg-green-500/10 tw-border tw-border-green-500/20 tw-animate-fadeIn">
                                        <CheckCircleIcon className="tw-text-green-500 tw-flex-shrink-0" />
                                        <span className="tw-text-sm tw-text-green-500">{resetStatus}</span>
                                    </div>
                                )}

                                {resetError && (
                                    <div className="tw-flex tw-items-center tw-gap-3 tw-p-4 tw-rounded-xl tw-bg-red-500/10 tw-border tw-border-red-500/20 tw-animate-shake">
                                        <XCircleIcon className="tw-text-red-500 tw-flex-shrink-0" />
                                        <span className="tw-text-sm tw-text-red-500">{resetError}</span>
                                    </div>
                                )}

                                {resetStep === 1 ? (
                                    /* Step 1: Email Input */
                                    <form onSubmit={handleForgotPasswordSubmit} className="tw-space-y-4">
                                        <div className="tw-space-y-2">
                                            <label htmlFor="forgotPasswordEmail" className={`tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-300' : 'tw-text-gray-700'}`}>
                                                Email Address
                                            </label>
                                            <div className="tw-relative tw-group">
                                                <div className={`tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 group-focus-within:tw-text-indigo-400' : 'tw-text-gray-400 group-focus-within:tw-text-indigo-500'}`}>
                                                    <MailIcon />
                                                </div>
                                                <input
                                                    id="forgotPasswordEmail"
                                                    type="email"
                                                    placeholder="student@buksu.edu.ph"
                                                    value={forgotPasswordEmail}
                                                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                                    className={`tw-w-full tw-h-12 tw-pl-11 tw-pr-4 tw-rounded-xl tw-border tw-transition-all tw-duration-300 tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-0 ${darkMode ? 'tw-bg-slate-800/50 tw-border-slate-600/50 tw-text-white placeholder:tw-text-gray-500 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20' : 'tw-bg-gray-50 tw-border-gray-200 tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20'}`}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            disabled={forgotPasswordLoading}
                                            className="tw-w-full tw-h-12 tw-rounded-xl tw-font-semibold tw-text-white tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-600 hover:tw-from-indigo-600 hover:tw-to-purple-700 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-[1.02] active:tw-scale-[0.98] tw-shadow-lg hover:tw-shadow-indigo-500/25 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100"
                                        >
                                            {forgotPasswordLoading ? (
                                                <span className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                                    <LoaderIcon />
                                                    Sending...
                                                </span>
                                            ) : (
                                                'Send Reset Code'
                                            )}
                                        </Button>
                                    </form>
                                ) : (
                                    /* Step 2: Code + New Password */
                                    <form onSubmit={handleResetPasswordSubmit} className="tw-space-y-4">
                                        {/* Reset Code */}
                                        <div className="tw-space-y-2">
                                            <label htmlFor="resetCode" className={`tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-300' : 'tw-text-gray-700'}`}>
                                                Reset Code
                                            </label>
                                            <div className="tw-relative tw-group">
                                                <div className={`tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 group-focus-within:tw-text-indigo-400' : 'tw-text-gray-400 group-focus-within:tw-text-indigo-500'}`}>
                                                    <KeyIcon />
                                                </div>
                                                <input
                                                    id="resetCode"
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="6-digit code"
                                                    value={resetCode}
                                                    onChange={(e) => setResetCode(e.target.value)}
                                                    className={`tw-w-full tw-h-12 tw-pl-11 tw-pr-4 tw-rounded-xl tw-border tw-transition-all tw-duration-300 tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-0 tw-tracking-widest tw-font-mono tw-text-lg ${darkMode ? 'tw-bg-slate-800/50 tw-border-slate-600/50 tw-text-white placeholder:tw-text-gray-500 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20' : 'tw-bg-gray-50 tw-border-gray-200 tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20'}`}
                                                    maxLength={6}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="tw-space-y-2">
                                            <label htmlFor="resetNewPassword" className={`tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-300' : 'tw-text-gray-700'}`}>
                                                New Password
                                            </label>
                                            <div className="tw-relative tw-group">
                                                <div className={`tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 group-focus-within:tw-text-indigo-400' : 'tw-text-gray-400 group-focus-within:tw-text-indigo-500'}`}>
                                                    <LockIcon />
                                                </div>
                                                <input
                                                    id="resetNewPassword"
                                                    type={showResetPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={resetNewPassword}
                                                    onChange={(e) => setResetNewPassword(e.target.value)}
                                                    className={`tw-w-full tw-h-12 tw-pl-11 tw-pr-12 tw-rounded-xl tw-border tw-transition-all tw-duration-300 tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-0 ${darkMode ? 'tw-bg-slate-800/50 tw-border-slate-600/50 tw-text-white placeholder:tw-text-gray-500 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20' : 'tw-bg-gray-50 tw-border-gray-200 tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20'}`}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowResetPassword(!showResetPassword)}
                                                    className={`tw-absolute tw-right-3 tw-top-1/2 tw--translate-y-1/2 tw-p-1 tw-rounded-lg tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 hover:tw-text-gray-300 hover:tw-bg-slate-700' : 'tw-text-gray-400 hover:tw-text-gray-600 hover:tw-bg-gray-100'}`}
                                                >
                                                    {showResetPassword ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                            <p className={`tw-text-xs tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500' : 'tw-text-gray-500'}`}>
                                                Must be at least 8 characters
                                            </p>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="tw-space-y-2">
                                            <label htmlFor="resetConfirmPassword" className={`tw-text-sm tw-font-medium tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-300' : 'tw-text-gray-700'}`}>
                                                Confirm Password
                                            </label>
                                            <div className="tw-relative tw-group">
                                                <div className={`tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 group-focus-within:tw-text-indigo-400' : 'tw-text-gray-400 group-focus-within:tw-text-indigo-500'}`}>
                                                    <LockIcon />
                                                </div>
                                                <input
                                                    id="resetConfirmPassword"
                                                    type={showResetConfirmPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={resetConfirmPassword}
                                                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                                                    className={`tw-w-full tw-h-12 tw-pl-11 tw-pr-12 tw-rounded-xl tw-border tw-transition-all tw-duration-300 tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-0 ${darkMode ? 'tw-bg-slate-800/50 tw-border-slate-600/50 tw-text-white placeholder:tw-text-gray-500 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20' : 'tw-bg-gray-50 tw-border-gray-200 tw-text-gray-900 placeholder:tw-text-gray-400 focus:tw-border-indigo-500 focus:tw-ring-indigo-500/20'}`}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                                                    className={`tw-absolute tw-right-3 tw-top-1/2 tw--translate-y-1/2 tw-p-1 tw-rounded-lg tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500 hover:tw-text-gray-300 hover:tw-bg-slate-700' : 'tw-text-gray-400 hover:tw-text-gray-600 hover:tw-bg-gray-100'}`}
                                                >
                                                    {showResetConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="tw-flex tw-gap-3">
                                            <Button 
                                                type="button"
                                                onClick={() => setResetStep(1)}
                                                className={`tw-flex-1 tw-h-12 tw-rounded-xl tw-font-semibold tw-transition-all tw-duration-300 tw-transform hover:tw-scale-[1.02] active:tw-scale-[0.98] ${darkMode ? 'tw-bg-slate-700 tw-text-white hover:tw-bg-slate-600' : 'tw-bg-gray-200 tw-text-gray-700 hover:tw-bg-gray-300'}`}
                                            >
                                                Back
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={resetLoading}
                                                className="tw-flex-[2] tw-h-12 tw-rounded-xl tw-font-semibold tw-text-white tw-bg-gradient-to-r tw-from-indigo-500 tw-to-purple-600 hover:tw-from-indigo-600 hover:tw-to-purple-700 tw-transition-all tw-duration-300 tw-transform hover:tw-scale-[1.02] active:tw-scale-[0.98] tw-shadow-lg hover:tw-shadow-indigo-500/25 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100"
                                            >
                                                {resetLoading ? (
                                                    <span className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                                                        <LoaderIcon />
                                                        Resetting...
                                                    </span>
                                                ) : (
                                                    'Reset Password'
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer */}
                    <p className={`tw-text-center tw-text-xs tw-mt-6 tw-transition-colors tw-duration-300 ${darkMode ? 'tw-text-gray-500' : 'tw-text-gray-500'}`}>
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>

            {/* Custom styles for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    25% {
                        transform: translateY(-20px) translateX(10px);
                    }
                    50% {
                        transform: translateY(0) translateX(20px);
                    }
                    75% {
                        transform: translateY(20px) translateX(10px);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: scale(1.1);
                    }
                }
                
                .tw-animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                .tw-animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;

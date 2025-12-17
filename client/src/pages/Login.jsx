import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [forgotPasswordStatus, setForgotPasswordStatus] = useState('');
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

    const [resetCode, setResetCode] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [resetStatus, setResetStatus] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email,
                password
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
        } catch (err) {
            setResetError(err.response?.data?.message || 'Reset failed');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-gray-100">
            <Card className="tw-w-full tw-max-w-md">
                <CardHeader>
                    <CardTitle className="tw-text-2xl tw-text-center">Login to Project Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="tw-space-y-4">
                        {error && (
                            <div className="tw-bg-red-100 tw-border tw-border-red-400 tw-text-red-700 tw-px-4 tw-py-3 tw-rounded tw-relative">
                                {error}
                            </div>
                        )}
                        <div className="tw-space-y-2">
                            <label htmlFor="email" className="tw-text-sm tw-font-medium tw-leading-none peer-disabled:tw-cursor-not-allowed peer-disabled:tw-opacity-70">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="student@buksu.edu.ph"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                                required
                            />
                        </div>
                        <div className="tw-space-y-2">
                            <label htmlFor="password" className="tw-text-sm tw-font-medium tw-leading-none peer-disabled:tw-cursor-not-allowed peer-disabled:tw-opacity-70">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                                required
                            />
                        </div>

                        <div className="tw-flex tw-justify-end">
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="tw-h-auto tw-p-0"
                                onClick={openForgotPassword}
                            >
                                Forgot password?
                            </Button>
                        </div>
                        <Button type="submit" className="tw-w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    {forgotPasswordOpen && (
                        <div className="tw-mt-4 tw-rounded-md tw-border tw-border-input tw-bg-background tw-p-4 tw-space-y-3">
                            <div className="tw-text-sm tw-font-medium">Reset password</div>

                            {forgotPasswordStatus && (
                                <div className="tw-rounded tw-border tw-border-green-200 tw-bg-green-50 tw-px-3 tw-py-2 tw-text-sm tw-text-green-800">
                                    {forgotPasswordStatus}
                                </div>
                            )}

                            {forgotPasswordError && (
                                <div className="tw-rounded tw-border tw-border-red-200 tw-bg-red-50 tw-px-3 tw-py-2 tw-text-sm tw-text-red-800">
                                    {forgotPasswordError}
                                </div>
                            )}

                            {resetStatus && (
                                <div className="tw-rounded tw-border tw-border-green-200 tw-bg-green-50 tw-px-3 tw-py-2 tw-text-sm tw-text-green-800">
                                    {resetStatus}
                                </div>
                            )}

                            {resetError && (
                                <div className="tw-rounded tw-border tw-border-red-200 tw-bg-red-50 tw-px-3 tw-py-2 tw-text-sm tw-text-red-800">
                                    {resetError}
                                </div>
                            )}

                            <form onSubmit={handleForgotPasswordSubmit} className="tw-space-y-3">
                                <div className="tw-space-y-2">
                                    <label
                                        htmlFor="forgotPasswordEmail"
                                        className="tw-text-sm tw-font-medium tw-leading-none peer-disabled:tw-cursor-not-allowed peer-disabled:tw-opacity-70"
                                    >
                                        Email
                                    </label>
                                    <input
                                        id="forgotPasswordEmail"
                                        type="email"
                                        placeholder="student@buksu.edu.ph"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                                        required
                                    />
                                </div>

                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <Button type="submit" disabled={forgotPasswordLoading}>
                                        {forgotPasswordLoading ? 'Sending...' : 'Send reset code'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={closeForgotPassword}>
                                        Close
                                    </Button>
                                </div>
                            </form>

                            <div className="tw-border-t tw-border-gray-200 tw-pt-3 tw-space-y-2">
                                <div className="tw-text-sm tw-font-medium">Enter code + new password</div>

                                <form onSubmit={handleResetPasswordSubmit} className="tw-space-y-3">
                                    <div className="tw-space-y-2">
                                        <label
                                            htmlFor="resetCode"
                                            className="tw-text-sm tw-font-medium tw-leading-none peer-disabled:tw-cursor-not-allowed peer-disabled:tw-opacity-70"
                                        >
                                            Reset code
                                        </label>
                                        <input
                                            id="resetCode"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="6-digit code"
                                            value={resetCode}
                                            onChange={(e) => setResetCode(e.target.value)}
                                            className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                                            required
                                        />
                                    </div>

                                    <div className="tw-space-y-2">
                                        <label
                                            htmlFor="resetNewPassword"
                                            className="tw-text-sm tw-font-medium tw-leading-none peer-disabled:tw-cursor-not-allowed peer-disabled:tw-opacity-70"
                                        >
                                            New password
                                        </label>
                                        <input
                                            id="resetNewPassword"
                                            type="password"
                                            value={resetNewPassword}
                                            onChange={(e) => setResetNewPassword(e.target.value)}
                                            className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                                            required
                                        />
                                    </div>

                                    <div className="tw-space-y-2">
                                        <label
                                            htmlFor="resetConfirmPassword"
                                            className="tw-text-sm tw-font-medium tw-leading-none peer-disabled:tw-cursor-not-allowed peer-disabled:tw-opacity-70"
                                        >
                                            Confirm new password
                                        </label>
                                        <input
                                            id="resetConfirmPassword"
                                            type="password"
                                            value={resetConfirmPassword}
                                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                                            className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50"
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="tw-w-full" disabled={resetLoading}>
                                        {resetLoading ? 'Resetting...' : 'Reset password'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="tw-justify-center">
                    <p className="tw-text-sm tw-text-gray-600">
                        Don't have an account? <Link to="/register" className="tw-text-blue-600 hover:tw-underline">Register</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;

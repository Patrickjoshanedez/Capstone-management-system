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
                        <Button type="submit" className="tw-w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
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

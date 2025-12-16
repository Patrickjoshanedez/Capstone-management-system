import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: 'IT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/register', formData);
            login(response.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-gray-100 tw-py-12">
            <Card className="tw-w-full tw-max-w-md">
                <CardHeader>
                    <CardTitle className="tw-text-2xl tw-text-center">Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="tw-space-y-4">
                        {error && (
                            <div className="tw-bg-red-100 tw-border tw-border-red-400 tw-text-red-700 tw-px-4 tw-py-3 tw-rounded tw-relative">
                                {error}
                            </div>
                        )}
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500"
                                required
                            />
                        </div>
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium">Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="student@buksu.edu.ph"
                                value={formData.email}
                                onChange={handleChange}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500"
                                required
                            />
                        </div>
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500"
                                required
                            />
                        </div>
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-blue-500"
                            >
                                <option value="student">Student</option>
                                <option value="adviser">Adviser</option>
                                <option value="coordinator">Coordinator</option>
                            </select>
                        </div>
                        <Button type="submit" className="tw-w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="tw-justify-center">
                    <p className="tw-text-sm tw-text-gray-600">
                        Already have an account? <Link to="/login" className="tw-text-blue-600 hover:tw-underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Register;

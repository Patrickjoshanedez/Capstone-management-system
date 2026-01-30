import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ProfileSection = ({ user, showToast }) => {
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        gender: user?.gender || '',
        contactEmail: user?.contactEmail || '',
        avatar: user?.avatar || '',
        skills: user?.skills?.join(', ') || '',
        yearLevel: user?.yearLevel || '',
    });

    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');

    useEffect(() => {
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            gender: user?.gender || '',
            contactEmail: user?.contactEmail || '',
            avatar: user?.avatar || '',
            skills: user?.skills?.join(', ') || '',
            yearLevel: user?.yearLevel || '',
        });
        setAvatarPreview(user?.avatar || '');
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                contactEmail: formData.contactEmail,
                avatar: formData.avatar,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                yearLevel: formData.yearLevel,
            };

            const response = await api.put('/auth/profile', payload);
            
            // Update auth context
            if (response.data?.user) {
                login({ ...user, ...response.data.user, token: user.token });
            }

            showToast('success', 'Profile updated successfully');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="tw-max-w-2xl tw-mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="tw-space-y-6">
                        {/* Avatar */}
                        <div className="tw-flex tw-items-center tw-gap-6">
                            <div className="tw-relative">
                                <div className="tw-w-24 tw-h-24 tw-rounded-full tw-bg-muted tw-overflow-hidden tw-border-4 tw-border-card tw-shadow">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="tw-w-full tw-h-full tw-object-cover"
                                        />
                                    ) : (
                                        <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-3xl tw-text-muted-foreground">
                                            {formData.firstName?.charAt(0)?.toUpperCase() || '👤'}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="tw-block">
                                    <span className="tw-text-sm tw-font-medium tw-text-foreground">Change Avatar</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="tw-mt-1 tw-block tw-w-full tw-text-sm tw-text-muted-foreground
                                            file:tw-mr-4 file:tw-py-2 file:tw-px-4
                                            file:tw-rounded file:tw-border-0
                                            file:tw-text-sm file:tw-font-medium
                                            file:tw-bg-indigo-500/10 file:tw-text-indigo-700 dark:file:tw-text-indigo-300
                                            hover:file:tw-bg-indigo-500/20"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Name Fields */}
                        <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-4 tw-py-2 focus:tw-ring-2 focus:tw-ring-indigo-500/50 focus:tw-border-indigo-500 tw-transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-4 tw-py-2 focus:tw-ring-2 focus:tw-ring-indigo-500/50 focus:tw-border-indigo-500 tw-transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Email (Cannot be changed)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-muted tw-px-4 tw-py-2 tw-text-muted-foreground"
                                disabled
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="Alternative contact email"
                                className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-background tw-text-foreground placeholder:tw-text-muted-foreground tw-px-4 tw-py-2 focus:tw-ring-2 focus:tw-ring-indigo-500/50 focus:tw-border-indigo-500 tw-transition-colors"
                            />
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-4 tw-py-2 focus:tw-ring-2 focus:tw-ring-indigo-500/50 focus:tw-border-indigo-500 tw-transition-colors"
                            >
                                <option value="">Prefer not to say</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Year Level (for students) */}
                        {user?.role === 'student' && (
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                    Year Level
                                </label>
                                <select
                                    name="yearLevel"
                                    value={formData.yearLevel}
                                    onChange={handleChange}
                                    className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-4 tw-py-2 focus:tw-ring-2 focus:tw-ring-indigo-500/50 focus:tw-border-indigo-500 tw-transition-colors"
                                >
                                    <option value="">Select Year Level</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="5th Year">5th Year</option>
                                </select>
                            </div>
                        )}

                        {/* Skills */}
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Skills (comma-separated)
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                placeholder="e.g., React, Node.js, Python"
                                className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-background tw-text-foreground placeholder:tw-text-muted-foreground tw-px-4 tw-py-2 focus:tw-ring-2 focus:tw-ring-indigo-500/50 focus:tw-border-indigo-500 tw-transition-colors"
                            />
                            <p className="tw-text-xs tw-text-muted-foreground tw-mt-1">
                                List your technical skills separated by commas
                            </p>
                        </div>

                        {/* Role (Read-only) */}
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Role
                            </label>
                            <input
                                type="text"
                                value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                                className="tw-w-full tw-rounded-lg tw-border tw-border-border tw-bg-muted tw-px-4 tw-py-2 tw-text-muted-foreground tw-capitalize"
                                disabled
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="tw-pt-4">
                            <Button type="submit" disabled={saving} className="tw-w-full">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfileSection;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusBadgeVariant = (status) => {
    if (status === 'PROPOSED') return 'PROPOSED';
    if (status === 'REVISION_REQUIRED') return 'REVISION';
    if (status === 'APPROVED_FOR_DEFENSE') return 'APPROVED';

    return 'secondary';
};

const Dashboard = () => {
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newTitle, setNewTitle] = useState('');
    const [newAdviserId, setNewAdviserId] = useState('');
    const [creating, setCreating] = useState(false);

    const canCreateProject = user?.role === 'student';

    const loadProjects = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/projects');
            setProjects(response.data?.projects || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        setCreating(true);
        setError('');

        try {
            const payload = { title: newTitle.trim() };
            if (newAdviserId.trim()) {
                payload.adviser = newAdviserId.trim();
            }

            await api.post('/projects', payload);
            setNewTitle('');
            setNewAdviserId('');
            await loadProjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const transitionButtons = useMemo(() => {
        return {
            student: (project) => {
                const canSubmit = ['PROPOSED', 'REVISION_REQUIRED'].includes(project.status);
                if (!canSubmit) return null;

                return (
                    <Button
                        onClick={async () => {
                            await api.patch(`/projects/${project._id}/status`, { status: 'ADVISER_REVIEW' });
                            await loadProjects();
                        }}
                        className="tw-w-full"
                    >
                        Submit for Adviser Review
                    </Button>
                );
            },
            adviser: (project) => {
                if (project.status !== 'ADVISER_REVIEW') return null;

                return (
                    <div className="tw-flex tw-gap-2">
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                await api.patch(`/projects/${project._id}/status`, { status: 'REVISION_REQUIRED' });
                                await loadProjects();
                            }}
                        >
                            Request Revision
                        </Button>
                        <Button
                            onClick={async () => {
                                await api.patch(`/projects/${project._id}/status`, { status: 'APPROVED_FOR_DEFENSE' });
                                await loadProjects();
                            }}
                        >
                            Approve
                        </Button>
                    </div>
                );
            },
            coordinator: (project) => {
                if (project.status !== 'APPROVED_FOR_DEFENSE') return null;

                return (
                    <Button
                        onClick={async () => {
                            await api.patch(`/projects/${project._id}/status`, { status: 'ARCHIVED' });
                            await loadProjects();
                        }}
                    >
                        Archive
                    </Button>
                );
            },
        };
    }, [loadProjects]);

    const renderTransition = (project) => {
        if (!user?.role) return null;

        const handler = transitionButtons[user.role];
        return handler ? handler(project) : null;
    };

    return (
        <div className="tw-min-h-screen tw-bg-gray-100 tw-p-6">
            <div className="tw-max-w-4xl tw-mx-auto tw-space-y-6">
                <div className="tw-flex tw-items-center tw-justify-between">
                    <div>
                        <h1 className="tw-text-2xl tw-font-bold">Dashboard</h1>
                        <p className="tw-text-sm tw-text-gray-600">Logged in as {user?.name} ({user?.role})</p>
                    </div>
                    <Button variant="outline" onClick={logout}>Logout</Button>
                </div>

                {error && (
                    <div className="tw-bg-red-100 tw-border tw-border-red-300 tw-text-red-700 tw-rounded tw-p-3">
                        {error}
                    </div>
                )}

                {canCreateProject && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Project Proposal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateProject} className="tw-space-y-3">
                                <div className="tw-space-y-1">
                                    <label className="tw-text-sm tw-font-medium">Title</label>
                                    <input
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="tw-w-full tw-rounded tw-border tw-border-gray-300 tw-px-3 tw-py-2"
                                        placeholder="My Capstone Project"
                                        required
                                    />
                                </div>
                                <div className="tw-space-y-1">
                                    <label className="tw-text-sm tw-font-medium">Adviser ID (optional)</label>
                                    <input
                                        value={newAdviserId}
                                        onChange={(e) => setNewAdviserId(e.target.value)}
                                        className="tw-w-full tw-rounded tw-border tw-border-gray-300 tw-px-3 tw-py-2"
                                        placeholder="Paste Adviser MongoDB ObjectId"
                                    />
                                </div>
                                <Button type="submit" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="tw-text-sm tw-text-gray-600">Loading projects...</div>
                        ) : projects.length === 0 ? (
                            <div className="tw-text-sm tw-text-gray-600">No projects found.</div>
                        ) : (
                            <div className="tw-space-y-3">
                                {projects.map((project) => (
                                    <div key={project._id} className="tw-bg-white tw-border tw-border-gray-200 tw-rounded tw-p-4 tw-space-y-2">
                                        <div className="tw-flex tw-items-center tw-justify-between">
                                            <div>
                                                <div className="tw-font-semibold">{project.title}</div>
                                                <div className="tw-text-xs tw-text-gray-600">ID: {project._id}</div>
                                            </div>
                                            <Badge variant={statusBadgeVariant(project.status)}>{project.status}</Badge>
                                        </div>

                                        {project.document?.webViewLink && (
                                            <a
                                                className="tw-text-sm tw-text-blue-600 hover:tw-underline"
                                                href={project.document.webViewLink}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View Document
                                            </a>
                                        )}

                                        {renderTransition(project)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusBadgeVariant = (status) => {
    if (status === 'PROPOSED') return 'PROPOSED';
    if (status === 'REVISION_REQUIRED') return 'REVISION';
    if (status === 'APPROVED_FOR_DEFENSE') return 'APPROVED';
    if (status === 'FINAL_SUBMITTED') return 'APPROVED';

    return 'secondary';
};

const getPlagiarismBadge = (plagiarismReport) => {
    if (!plagiarismReport) return null;

    const rawStatus = String(plagiarismReport.status || '').trim();
    const isPending = rawStatus.startsWith('pending');

    const statusLabel = isPending ? 'Pending' : (rawStatus || 'Unknown');
    const scoreValue = typeof plagiarismReport.score === 'number' ? plagiarismReport.score : null;

    const label = scoreValue === null
        ? `Plagiarism: ${statusLabel}`
        : `Plagiarism: ${statusLabel} (${scoreValue})`;

    return {
        label,
        variant: isPending ? 'secondary' : 'outline',
        reportUrl: plagiarismReport.reportUrl,
    };
};

const Dashboard = () => {
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAdviserEmail, setNewAdviserEmail] = useState('');
    const [newMemberEmails, setNewMemberEmails] = useState('');
    const [creating, setCreating] = useState(false);

    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedProjectLogs, setSelectedProjectLogs] = useState([]);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');

    const [toast, setToast] = useState(null);

    const canCreateProject = user?.role === 'student';

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
    }, []);

    useEffect(() => {
        if (!toast) return undefined;

        const timeoutId = setTimeout(() => {
            setToast(null);
        }, 3500);

        return () => clearTimeout(timeoutId);
    }, [toast]);

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
            const parsedMemberEmails = newMemberEmails
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean);

            const payload = { title: newTitle.trim() };
            if (parsedMemberEmails.length > 0) {
                payload.memberEmails = parsedMemberEmails;
            }
            if (newAdviserEmail.trim()) {
                payload.adviserEmail = newAdviserEmail.trim();
            }

            await api.post('/projects', payload);
            setNewTitle('');
            setNewAdviserEmail('');
            setNewMemberEmails('');
            setIsCreateOpen(false);
            await loadProjects();
            showToast('success', 'Project created');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create project';
            setError(message);
            showToast('error', message);
        } finally {
            setCreating(false);
        }
    };

    const loadProjectDetails = useCallback(
        async (projectId) => {
            setDetailsLoading(true);
            setDetailsError('');

            try {
                const [projectResponse, logsResponse] = await Promise.all([
                    api.get(`/projects/${projectId}`),
                    api.get(`/projects/${projectId}/logs`),
                ]);

                setSelectedProject(projectResponse.data?.project || null);
                setSelectedProjectLogs(logsResponse.data?.logs || []);
            } catch (err) {
                setDetailsError(err.response?.data?.message || 'Failed to load project details');
                setSelectedProject(null);
                setSelectedProjectLogs([]);
            } finally {
                setDetailsLoading(false);
            }
        },
        []
    );

    const openDetails = async (projectId) => {
        setSelectedProjectId(projectId);
        setDetailsOpen(true);
        setUploadFile(null);
        setUploadMessage('');
        await loadProjectDetails(projectId);
    };

    const canUploadToSelectedProject = useMemo(() => {
        if (user?.role !== 'student') return false;
        if (!selectedProject) return false;

        return ['PROPOSED', 'REVISION_REQUIRED'].includes(selectedProject.status);
    }, [selectedProject, user?.role]);

    const handleUpload = useCallback(async () => {
        if (!selectedProjectId) return;
        if (!uploadFile) return;
        if (!canUploadToSelectedProject) return;

        setUploading(true);
        setUploadMessage('');
        setError('');
        setDetailsError('');

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);

            const response = await api.post(`/projects/${selectedProjectId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadMessage(response.data?.message || 'Upload successful');
            showToast('success', response.data?.message || 'Upload successful');
            setUploadFile(null);

            await loadProjects();
            await loadProjectDetails(selectedProjectId);
        } catch (err) {
            const message = err.response?.data?.message || 'Upload failed';
            setDetailsError(message);
            showToast('error', message);
        } finally {
            setUploading(false);
        }
    }, [canUploadToSelectedProject, loadProjectDetails, loadProjects, selectedProjectId, showToast, uploadFile]);

    const applyOptimisticStatus = useCallback((projectId, nextStatus) => {
        setProjects((prev) => prev.map((p) => (p._id === projectId ? { ...p, status: nextStatus } : p)));

        setSelectedProject((prev) => {
            if (!prev || prev._id !== projectId) return prev;
            return { ...prev, status: nextStatus };
        });
    }, []);

    const handleStatusChange = useCallback(
        async (projectId, nextStatus) => {
            setError('');
            setDetailsError('');

            applyOptimisticStatus(projectId, nextStatus);

            try {
                await api.patch(`/projects/${projectId}/status`, { status: nextStatus });
                await loadProjects();
                if (detailsOpen && selectedProjectId === projectId) {
                    await loadProjectDetails(projectId);
                }

                showToast('success', 'Status updated');
            } catch (err) {
                const message = err.response?.data?.message || 'Failed to update project status';
                setError(message);
                showToast('error', message);
                await loadProjects();
                if (detailsOpen && selectedProjectId === projectId) {
                    await loadProjectDetails(projectId);
                }
            }
        },
        [applyOptimisticStatus, detailsOpen, loadProjectDetails, loadProjects, selectedProjectId, showToast]
    );

    const transitionButtons = useMemo(() => {
        return {
            student: (project) => {
                const canSubmit = ['PROPOSED', 'REVISION_REQUIRED'].includes(project.status);
                const hasDocument = Boolean(project.document?.fileId || project.document?.webViewLink);
                if (!canSubmit) return null;

                return (
                    <div className="tw-space-y-2">
                        <Button
                            disabled={!hasDocument}
                            onClick={async () => {
                                await handleStatusChange(project._id, 'ADVISER_REVIEW');
                            }}
                            className="tw-w-full"
                        >
                            Submit for Adviser Review
                        </Button>
                        {!hasDocument && (
                            <div className="tw-text-xs tw-text-muted-foreground">
                                Upload a proposal document to enable submission.
                            </div>
                        )}
                    </div>
                );
            },
            adviser: (project) => {
                if (project.status === 'ADVISER_REVIEW') {
                    return (
                        <div className="tw-flex tw-gap-2">
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    await handleStatusChange(project._id, 'REVISION_REQUIRED');
                                }}
                            >
                                Request Revision
                            </Button>
                            <Button
                                onClick={async () => {
                                    await handleStatusChange(project._id, 'APPROVED_FOR_DEFENSE');
                                }}
                            >
                                Approve for Defense
                            </Button>
                        </div>
                    );
                }

                if (project.status === 'APPROVED_FOR_DEFENSE') {
                    return (
                        <Button
                            onClick={async () => {
                                await handleStatusChange(project._id, 'FINAL_SUBMITTED');
                            }}
                        >
                            Mark Final Submitted
                        </Button>
                    );
                }

                return null;
            },
            coordinator: (project) => {
                if (project.status !== 'FINAL_SUBMITTED') return null;

                return (
                    <Button
                        onClick={async () => {
                            await handleStatusChange(project._id, 'ARCHIVED');
                        }}
                    >
                        Archive
                    </Button>
                );
            },
        };
    }, [handleStatusChange]);

    const renderTransition = (project) => {
        if (!user?.role) return null;

        const handler = transitionButtons[user.role];
        return handler ? handler(project) : null;
    };

    return (
        <div className="tw-min-h-screen tw-bg-background tw-p-6">
            <div className="tw-max-w-4xl tw-mx-auto tw-space-y-6">
                <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-3 sm:tw-justify-between">
                    <div>
                        <h1 className="tw-text-2xl tw-font-bold tw-text-foreground">Dashboard</h1>
                        <p className="tw-text-sm tw-text-muted-foreground">Logged in as {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'} ({user?.role})</p>
                    </div>
                    <div className="tw-flex tw-items-center tw-gap-2">
                        {canCreateProject && (
                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button>New Project</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Project Proposal</DialogTitle>
                                        <DialogDescription>
                                            Enter your project title and optional members/adviser.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form onSubmit={handleCreateProject} className="tw-space-y-3">
                                        <div className="tw-space-y-1">
                                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Title</label>
                                            <input
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500/50"
                                                placeholder="My Capstone Project"
                                                required
                                            />
                                        </div>
                                        <div className="tw-space-y-1">
                                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Member Emails (comma-separated, optional)</label>
                                            <input
                                                value={newMemberEmails}
                                                onChange={(e) => setNewMemberEmails(e.target.value)}
                                                className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500/50"
                                                placeholder="student1@buksu.edu.ph, student2@buksu.edu.ph"
                                            />
                                        </div>
                                        <div className="tw-space-y-1">
                                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Adviser Email (optional)</label>
                                            <input
                                                value={newAdviserEmail}
                                                onChange={(e) => setNewAdviserEmail(e.target.value)}
                                                className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500/50"
                                                placeholder="adviser@buksu.edu.ph"
                                            />
                                        </div>

                                        <DialogFooter className="tw-gap-2">
                                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={creating}>
                                                {creating ? 'Creating...' : 'Create'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>
                </div>

                {toast && (
                    <div className="tw-fixed tw-bottom-4 tw-right-4 tw-z-50 tw-max-w-sm tw-w-[calc(100vw-2rem)]">
                        <div
                            className={
                                toast.type === 'success'
                                    ? 'tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border tw-border-emerald-500/30 tw-text-emerald-800 dark:tw-text-emerald-300 tw-rounded tw-p-3'
                                    : toast.type === 'error'
                                        ? 'tw-bg-red-500/10 dark:tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-text-red-800 dark:tw-text-red-300 tw-rounded tw-p-3'
                                        : 'tw-bg-muted tw-border tw-border-border tw-text-foreground tw-rounded tw-p-3'
                            }
                            role="status"
                        >
                            <div className="tw-text-sm tw-font-medium">{toast.message}</div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="tw-bg-red-500/10 dark:tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-text-red-700 dark:tw-text-red-300 tw-rounded tw-p-3">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="tw-space-y-2">
                                <div className="tw-h-16 tw-rounded tw-bg-muted tw-animate-pulse" />
                                <div className="tw-h-16 tw-rounded tw-bg-muted tw-animate-pulse" />
                                <div className="tw-h-16 tw-rounded tw-bg-muted tw-animate-pulse" />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="tw-text-sm tw-text-muted-foreground">No projects found.</div>
                        ) : (
                            <div className="tw-space-y-3">
                                {projects.map((project) => (
                                    <div key={project._id} className="tw-bg-card tw-border tw-border-border tw-rounded tw-p-4 tw-space-y-2">
                                        <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-2">
                                            <div>
                                                <div className="tw-font-semibold tw-text-foreground">{project.title}</div>
                                                <div className="tw-text-xs tw-text-muted-foreground">ID: {project._id}</div>
                                            </div>
                                            <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
                                                <Badge variant={statusBadgeVariant(project.status)}>{project.status}</Badge>
                                                {getPlagiarismBadge(project.plagiarismReport) && (
                                                    <Badge
                                                        variant={getPlagiarismBadge(project.plagiarismReport).variant}
                                                    >
                                                        {getPlagiarismBadge(project.plagiarismReport).label}
                                                    </Badge>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDetails(project._id)}
                                                >
                                                    Details
                                                </Button>
                                            </div>
                                        </div>

                                        {project.document?.webViewLink && (
                                            <a
                                                className="tw-text-sm tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline"
                                                href={project.document.webViewLink}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                View Proposal Document
                                            </a>
                                        )}

                                        {renderTransition(project)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog
                    open={detailsOpen}
                    onOpenChange={(open) => {
                        setDetailsOpen(open);
                        if (!open) {
                            setSelectedProjectId(null);
                            setSelectedProject(null);
                            setSelectedProjectLogs([]);
                            setDetailsError('');
                            setUploadFile(null);
                            setUploading(false);
                            setUploadMessage('');
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Project Details</DialogTitle>
                            <DialogDescription>Review proposal, status, and workflow history.</DialogDescription>
                        </DialogHeader>

                        {detailsError && (
                            <div className="tw-bg-red-500/10 dark:tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-text-red-700 dark:tw-text-red-300 tw-rounded tw-p-3">
                                {detailsError}
                            </div>
                        )}

                        {detailsLoading ? (
                            <div className="tw-text-sm tw-text-muted-foreground">Loading details...</div>
                        ) : !selectedProject ? (
                            <div className="tw-text-sm tw-text-muted-foreground">No project selected.</div>
                        ) : (
                            <div className="tw-space-y-4">
                                <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                                    <div>
                                        <div className="tw-text-lg tw-font-semibold tw-text-foreground">{selectedProject.title}</div>
                                        <div className="tw-text-xs tw-text-muted-foreground">ID: {selectedProject._id}</div>
                                        {selectedProject.adviser?.firstName && (
                                            <div className="tw-text-sm tw-text-muted-foreground">Adviser: {selectedProject.adviser.firstName} {selectedProject.adviser.lastName || ''}</div>
                                        )}
                                    </div>
                                    <div className="tw-flex tw-flex-col tw-items-end tw-gap-2">
                                        <Badge variant={statusBadgeVariant(selectedProject.status)}>{selectedProject.status}</Badge>
                                        {getPlagiarismBadge(selectedProject.plagiarismReport) && (
                                            <div className="tw-flex tw-items-center tw-gap-2">
                                                <Badge variant={getPlagiarismBadge(selectedProject.plagiarismReport).variant}>
                                                    {getPlagiarismBadge(selectedProject.plagiarismReport).label}
                                                </Badge>
                                                {getPlagiarismBadge(selectedProject.plagiarismReport).reportUrl && (
                                                    <a
                                                        className="tw-text-xs tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline"
                                                        href={getPlagiarismBadge(selectedProject.plagiarismReport).reportUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        View Report
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="tw-space-y-1">
                                    <div className="tw-text-sm tw-font-medium tw-text-foreground">Members</div>
                                    {Array.isArray(selectedProject.members) && selectedProject.members.length > 0 ? (
                                        <ul className="tw-text-sm tw-text-muted-foreground tw-list-disc tw-pl-5">
                                            {selectedProject.members.map((member) => (
                                                <li key={member?._id || member}>
                                                    {member?.firstName ? `${member.firstName} ${member.lastName || ''} (${member.role})` : String(member)}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="tw-text-sm tw-text-muted-foreground">No members listed.</div>
                                    )}
                                </div>

                                <div className="tw-space-y-2">
                                    <div className="tw-text-sm tw-font-medium tw-text-foreground">Actions</div>
                                    {renderTransition(selectedProject)}
                                </div>

                                <div className="tw-space-y-2">
                                    <div className="tw-text-sm tw-font-medium tw-text-foreground">Document</div>

                                    {selectedProject.document?.webViewLink ? (
                                        <a
                                            className="tw-text-sm tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline"
                                            href={selectedProject.document.webViewLink}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Proposal Document
                                        </a>
                                    ) : (
                                        <div className="tw-text-sm tw-text-muted-foreground">No document uploaded yet.</div>
                                    )}

                                    {user?.role === 'student' && (
                                        <div className="tw-space-y-2">
                                            <div className="tw-text-xs tw-text-muted-foreground">
                                                Upload allowed only when status is PROPOSED or REVISION_REQUIRED.
                                                {selectedProject.status === 'ARCHIVED' && ' This project is archived (read-only).'}
                                            </div>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                disabled={!canUploadToSelectedProject || uploading}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    setUploadFile(file);
                                                    setUploadMessage('');
                                                }}
                                                className="tw-block tw-w-full tw-text-sm"
                                            />
                                            <div className="tw-flex tw-items-center tw-gap-2">
                                                <Button
                                                    type="button"
                                                    disabled={!canUploadToSelectedProject || uploading || !uploadFile}
                                                    onClick={handleUpload}
                                                >
                                                    {uploading ? 'Uploading...' : 'Upload'}
                                                </Button>
                                                {uploadMessage && (
                                                    <div className="tw-text-sm tw-text-emerald-700 dark:tw-text-emerald-400">{uploadMessage}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="tw-space-y-2">
                                    <div className="tw-text-sm tw-font-medium tw-text-foreground">Workflow History</div>
                                    {selectedProjectLogs.length === 0 ? (
                                        <div className="tw-text-sm tw-text-muted-foreground">No workflow logs yet.</div>
                                    ) : (
                                        <div className="tw-space-y-2">
                                            {selectedProjectLogs.map((log) => (
                                                <div
                                                    key={log._id}
                                                    className="tw-border tw-border-border tw-rounded tw-p-3 tw-bg-muted"
                                                >
                                                    <div className="tw-text-sm tw-font-medium tw-text-foreground">
                                                        From {log.fromStatus || 'N/A'} To {log.toStatus || 'N/A'}
                                                    </div>
                                                    <div className="tw-text-xs tw-text-muted-foreground">
                                                        By {log.user?.firstName ? `${log.user.firstName} ${log.user.lastName || ''}`.trim() : 'Unknown'} • {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setDetailsOpen(false);
                                    setSelectedProjectId(null);
                                    setSelectedProject(null);
                                    setSelectedProjectLogs([]);
                                    setDetailsError('');
                                    setUploadFile(null);
                                    setUploading(false);
                                    setUploadMessage('');
                                }}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Dashboard;

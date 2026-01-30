import React, { useCallback, useEffect, useState } from 'react';
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
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProfileSection from '../components/profile/ProfileSection';
import NotificationPanel from '../components/notifications/NotificationPanel';
import Sidebar from '../components/layout/Sidebar';

const AdviserDashboard = () => {
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [toast, setToast] = useState(null);

    const [selectedProject, setSelectedProject] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [projectLogs, setProjectLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
    }, []);

    useEffect(() => {
        if (!toast) return undefined;
        const timeoutId = setTimeout(() => setToast(null), 3500);
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

    const loadProjectLogs = useCallback(async (projectId) => {
        setLogsLoading(true);
        try {
            const response = await api.get(`/projects/${projectId}/logs`);
            setProjectLogs(response.data?.logs || []);
        } catch (err) {
            console.error('Failed to load logs:', err);
            setProjectLogs([]);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    const openProjectDetails = async (project) => {
        setSelectedProject(project);
        setDetailsOpen(true);
        await loadProjectLogs(project._id);
    };

    const handleStatusChange = async (projectId, newStatus) => {
        try {
            await api.patch(`/projects/${projectId}/status`, { status: newStatus });
            showToast('success', 'Status updated successfully');
            await loadProjects();
            if (selectedProject?._id === projectId) {
                const response = await api.get(`/projects/${projectId}`);
                setSelectedProject(response.data?.project);
                await loadProjectLogs(projectId);
            }
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to update status');
        }
    };

    // Calculate statistics
    const statistics = {
        total: projects.length,
        inProposal: projects.filter(p => p.status === 'PROPOSED').length,
        waitingReview: projects.filter(p => p.status === 'ADVISER_REVIEW').length,
        needsRevision: projects.filter(p => p.status === 'REVISION_REQUIRED').length,
        approved: projects.filter(p => p.status === 'APPROVED_FOR_DEFENSE').length,
        finalSubmitted: projects.filter(p => p.status === 'FINAL_SUBMITTED').length,
        archived: projects.filter(p => p.status === 'ARCHIVED').length,
    };

    // Calculate chapter progress (mock - in real app, this would come from actual chapter data)
    const getProjectProgress = (project) => {
        const statusProgress = {
            PROPOSED: 10,
            ADVISER_REVIEW: 30,
            REVISION_REQUIRED: 40,
            APPROVED_FOR_DEFENSE: 70,
            FINAL_SUBMITTED: 90,
            ARCHIVED: 100,
        };
        return statusProgress[project.status] || 0;
    };

    const adviserNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'workspace', label: "Adviser's Workspace", icon: '💼' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSection user={user} showToast={showToast} />;
            case 'notifications':
                return <NotificationPanel user={user} />;
            case 'workspace':
                return renderWorkspace();
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="tw-space-y-6">
            {/* Overall Statistics */}
            <div>
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-foreground">Overall Statistics</h2>
                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 lg:tw-grid-cols-7 tw-gap-4">
                    <Card className="tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-border-indigo-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400">{statistics.total}</div>
                            <div className="tw-text-sm tw-text-indigo-700 dark:tw-text-indigo-300">Total Teams</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-slate-500/10 dark:tw-bg-slate-500/20 tw-border-slate-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-slate-600 dark:tw-text-slate-400">{statistics.inProposal}</div>
                            <div className="tw-text-sm tw-text-slate-700 dark:tw-text-slate-300">In Proposal</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border-amber-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-amber-600 dark:tw-text-amber-400">{statistics.waitingReview}</div>
                            <div className="tw-text-sm tw-text-amber-700 dark:tw-text-amber-300">Waiting Review</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-orange-500/10 dark:tw-bg-orange-500/20 tw-border-orange-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-orange-600 dark:tw-text-orange-400">{statistics.needsRevision}</div>
                            <div className="tw-text-sm tw-text-orange-700 dark:tw-text-orange-300">Needs Revision</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border-emerald-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-emerald-600 dark:tw-text-emerald-400">{statistics.approved}</div>
                            <div className="tw-text-sm tw-text-emerald-700 dark:tw-text-emerald-300">Approved</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-purple-500/10 dark:tw-bg-purple-500/20 tw-border-purple-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-purple-600 dark:tw-text-purple-400">{statistics.finalSubmitted}</div>
                            <div className="tw-text-sm tw-text-purple-700 dark:tw-text-purple-300">Final Submitted</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-cyan-500/10 dark:tw-bg-cyan-500/20 tw-border-cyan-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-cyan-600 dark:tw-text-cyan-400">{statistics.archived}</div>
                            <div className="tw-text-sm tw-text-cyan-700 dark:tw-text-cyan-300">Archived</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Teams Requiring Action */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <span className="tw-text-amber-500">⚡</span>
                        Teams Awaiting Your Review
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="tw-space-y-2">
                            {[1, 2].map(i => (
                                <div key={i} className="tw-h-16 tw-rounded tw-bg-muted tw-animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="tw-space-y-3">
                            {projects.filter(p => p.status === 'ADVISER_REVIEW').length === 0 ? (
                                <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                                    No teams awaiting review at the moment.
                                </div>
                            ) : (
                                projects
                                    .filter(p => p.status === 'ADVISER_REVIEW')
                                    .map((project) => (
                                        <div
                                            key={project._id}
                                            className="tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border tw-border-amber-500/30 tw-rounded-lg tw-p-4"
                                        >
                                            <div className="tw-flex tw-justify-between tw-items-start">
                                                <div>
                                                    <h3 className="tw-font-semibold tw-text-foreground">{project.title}</h3>
                                                    <p className="tw-text-sm tw-text-muted-foreground">
                                                        Members: {project.members?.map(m => m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : m).join(', ') || 'None'}
                                                    </p>
                                                </div>
                                                <div className="tw-flex tw-gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openProjectDetails(project)}
                                                    >
                                                        Review
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-text-foreground">Team Progress Overview (Chapters 1-5)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-space-y-4">
                        {projects.slice(0, 5).map((project) => {
                            const progress = getProjectProgress(project);
                            return (
                                <div key={project._id} className="tw-space-y-1">
                                    <div className="tw-flex tw-justify-between tw-text-sm">
                                        <span className="tw-font-medium tw-truncate tw-max-w-[60%] tw-text-foreground">
                                            {project.title}
                                        </span>
                                        <span className="tw-text-muted-foreground">{progress}%</span>
                                    </div>
                                    <div className="tw-w-full tw-bg-muted tw-rounded-full tw-h-2.5">
                                        <div
                                            className="tw-bg-indigo-600 dark:tw-bg-indigo-500 tw-h-2.5 tw-rounded-full tw-transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderWorkspace = () => (
        <div className="tw-space-y-6">
            <div className="tw-flex tw-justify-between tw-items-center">
                <h2 className="tw-text-xl tw-font-semibold tw-text-foreground">Assigned Capstone Teams</h2>
                <div className="tw-text-sm tw-text-muted-foreground">
                    {projects.length} team{projects.length !== 1 ? 's' : ''} assigned to you
                </div>
            </div>

            {loading ? (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="tw-h-48 tw-rounded tw-bg-muted tw-animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <Card className="tw-bg-card tw-border-border">
                    <CardContent className="tw-py-12 tw-text-center">
                        <div className="tw-text-4xl tw-mb-4">📋</div>
                        <p className="tw-text-muted-foreground">No teams assigned to you yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                    {projects.map((project) => {
                        const progress = getProjectProgress(project);
                        return (
                            <Card key={project._id} className="tw-bg-card tw-border-border hover:tw-shadow-lg tw-transition-all tw-duration-300">
                                <CardHeader className="tw-pb-2">
                                    <div className="tw-flex tw-justify-between tw-items-start">
                                        <CardTitle className="tw-text-base tw-line-clamp-2 tw-text-foreground">
                                            {project.title}
                                        </CardTitle>
                                        <Badge variant={getStatusVariant(project.status)}>
                                            {formatStatus(project.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="tw-space-y-3">
                                    {/* Team Members */}
                                    <div>
                                        <div className="tw-text-xs tw-text-muted-foreground tw-mb-1">Team Members</div>
                                        <div className="tw-flex tw-flex-wrap tw-gap-1">
                                            {project.members?.slice(0, 3).map((member, idx) => (
                                                <Badge key={idx} variant="secondary" className="tw-text-xs">
                                                    {member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : member}
                                                </Badge>
                                            ))}
                                            {project.members?.length > 3 && (
                                                <Badge variant="outline" className="tw-text-xs">
                                                    +{project.members.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="tw-flex tw-justify-between tw-text-xs tw-mb-1">
                                            <span className="tw-text-muted-foreground">Completion</span>
                                            <span className="tw-font-medium tw-text-foreground">{progress}%</span>
                                        </div>
                                        <div className="tw-w-full tw-bg-muted tw-rounded-full tw-h-2">
                                            <div
                                                className={`tw-h-2 tw-rounded-full tw-transition-all ${
                                                    progress < 30 ? 'tw-bg-red-500' :
                                                    progress < 70 ? 'tw-bg-amber-500' :
                                                    'tw-bg-emerald-500'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="tw-pt-2 tw-border-t tw-border-border">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="tw-w-full"
                                            onClick={() => openProjectDetails(project)}
                                        >
                                            {project.status === 'ADVISER_REVIEW' ? 'Review Now' : 'View Details'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="tw-min-h-screen tw-bg-background tw-flex tw-transition-colors tw-duration-300">
            <Sidebar
                navItems={adviserNavItems}
                activeSection={activeSection}
                onNavigate={setActiveSection}
                user={user}
                onLogout={logout}
            />

            <div className="tw-flex-1 tw-ml-64">
                <header className="tw-bg-card tw-shadow-sm tw-border-b tw-border-border tw-px-6 tw-py-4 tw-transition-colors tw-duration-300">
                    <div className="tw-flex tw-justify-between tw-items-center">
                        <div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-foreground">
                                {adviserNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                            </h1>
                            <p className="tw-text-sm tw-text-muted-foreground">
                                Welcome back, {user?.firstName || 'Adviser'}
                            </p>
                        </div>
                    </div>
                </header>

                <main className="tw-p-6">
                    {error && (
                        <div className="tw-bg-destructive/10 tw-border tw-border-destructive/30 tw-text-destructive tw-rounded-lg tw-p-4 tw-mb-6">
                            {error}
                        </div>
                    )}
                    {renderContent()}
                </main>
            </div>

            {/* Toast */}
            {toast && (
                <div className="tw-fixed tw-bottom-4 tw-right-4 tw-z-50">
                    <div
                        className={`tw-rounded-lg tw-px-4 tw-py-3 tw-shadow-lg tw-transition-all tw-duration-300 ${
                            toast.type === 'success' ? 'tw-bg-green-500 tw-text-white' : 'tw-bg-red-500 tw-text-white'
                        }`}
                    >
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Project Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="tw-max-w-2xl tw-max-h-[80vh] tw-overflow-y-auto tw-bg-card tw-border-border">
                    <DialogHeader>
                        <DialogTitle className="tw-text-foreground">{selectedProject?.title}</DialogTitle>
                        <DialogDescription className="tw-text-muted-foreground">Review and manage this project</DialogDescription>
                    </DialogHeader>

                    {selectedProject && (
                        <div className="tw-space-y-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <Badge variant={getStatusVariant(selectedProject.status)}>
                                    {formatStatus(selectedProject.status)}
                                </Badge>
                                {selectedProject.plagiarismReport?.score !== undefined && (
                                    <Badge variant="outline">
                                        Similarity: {selectedProject.plagiarismReport.score}%
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <h4 className="tw-font-medium tw-mb-2 tw-text-foreground">Team Members</h4>
                                <div className="tw-flex tw-flex-wrap tw-gap-2">
                                    {selectedProject.members?.map((member, idx) => (
                                        <Badge key={idx} variant="secondary">
                                            {member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : member}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {selectedProject.document?.webViewLink && (
                                <div>
                                    <h4 className="tw-font-medium tw-mb-2 tw-text-foreground">Document</h4>
                                    <a
                                        href={selectedProject.document.webViewLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline"
                                    >
                                        View Proposal Document →
                                    </a>
                                </div>
                            )}

                            {/* Adviser Actions */}
                            {selectedProject.status === 'ADVISER_REVIEW' && (
                                <div className="tw-bg-muted tw-rounded-lg tw-p-4">
                                    <h4 className="tw-font-medium tw-mb-3 tw-text-foreground">Review Actions</h4>
                                    <div className="tw-flex tw-gap-2">
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleStatusChange(selectedProject._id, 'REVISION_REQUIRED')}
                                        >
                                            Request Revision
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusChange(selectedProject._id, 'APPROVED_FOR_DEFENSE')}
                                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                        >
                                            Approve for Defense
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {selectedProject.status === 'APPROVED_FOR_DEFENSE' && (
                                <div className="tw-bg-muted tw-rounded-lg tw-p-4">
                                    <h4 className="tw-font-medium tw-mb-3 tw-text-foreground">Final Review</h4>
                                    <Button
                                        onClick={() => handleStatusChange(selectedProject._id, 'FINAL_SUBMITTED')}
                                        className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                    >
                                        Mark Final Submitted
                                    </Button>
                                </div>
                            )}

                            {/* Workflow History */}
                            <div>
                                <h4 className="tw-font-medium tw-mb-2 tw-text-foreground">Workflow History</h4>
                                {logsLoading ? (
                                    <div className="tw-text-sm tw-text-muted-foreground">Loading...</div>
                                ) : projectLogs.length === 0 ? (
                                    <div className="tw-text-sm tw-text-muted-foreground">No workflow history yet.</div>
                                ) : (
                                    <div className="tw-space-y-2 tw-max-h-48 tw-overflow-y-auto">
                                        {projectLogs.map((log) => (
                                            <div
                                                key={log._id}
                                                className="tw-text-sm tw-bg-muted tw-rounded tw-p-2"
                                            >
                                                <div className="tw-font-medium tw-text-foreground">
                                                    {log.fromStatus} → {log.toStatus}
                                                </div>
                                                <div className="tw-text-muted-foreground">
                                                    {log.user?.firstName ? `${log.user.firstName} ${log.user.lastName || ''}`.trim() : 'Unknown'} • {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const getStatusVariant = (status) => {
    const variants = {
        PROPOSED: 'secondary',
        ADVISER_REVIEW: 'default',
        REVISION_REQUIRED: 'destructive',
        APPROVED_FOR_DEFENSE: 'default',
        FINAL_SUBMITTED: 'default',
        ARCHIVED: 'outline',
    };
    return variants[status] || 'secondary';
};

const formatStatus = (status) => {
    const labels = {
        PROPOSED: 'Proposed',
        ADVISER_REVIEW: 'Under Review',
        REVISION_REQUIRED: 'Needs Revision',
        APPROVED_FOR_DEFENSE: 'Approved',
        FINAL_SUBMITTED: 'Final Submitted',
        ARCHIVED: 'Archived',
    };
    return labels[status] || status;
};

export default AdviserDashboard;

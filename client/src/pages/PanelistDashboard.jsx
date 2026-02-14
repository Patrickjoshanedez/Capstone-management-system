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
import ProposalDetails from '../components/proposal/ProposalDetails';
import Sidebar from '../components/layout/Sidebar';
import { LayoutDashboard, User, Bell, ClipboardList, MessageSquare, Loader2, Lightbulb, Columns } from 'lucide-react';
import TopicCreator from '../components/topics/TopicCreator';
import SplitScreenViewer from '../components/viewer/SplitScreenViewer';

const PanelistDashboard = () => {
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [toast, setToast] = useState(null);

    const [selectedProject, setSelectedProject] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [proposalOpen, setProposalOpen] = useState(false);
    const [projectLogs, setProjectLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Comment/Feedback dialog state
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);

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

    const handleStatusChange = async (projectId, newStatus, comment = '') => {
        try {
            await api.patch(`/projects/${projectId}/status`, { status: newStatus, comment });
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

    // Open feedback dialog for adding comments
    const openFeedbackDialog = () => {
        setFeedbackComment('');
        setFeedbackOpen(true);
    };

    // Handle feedback submission
    const submitFeedback = async () => {
        if (!selectedProject || !feedbackComment.trim()) return;

        try {
            setFeedbackLoading(true);
            await api.patch(`/projects/${selectedProject._id}/status`, {
                status: selectedProject.status,
                comment: feedbackComment,
            });
            showToast('success', 'Feedback submitted successfully');
            setFeedbackOpen(false);
            setFeedbackComment('');
            await loadProjectLogs(selectedProject._id);
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setFeedbackLoading(false);
        }
    };

    // Calculate statistics
    const statistics = {
        total: projects.length,
        awaitingDefense: projects.filter(p => p.status === 'APPROVED_FOR_DEFENSE').length,
        completed: projects.filter(p => p.status === 'FINAL_SUBMITTED' || p.status === 'ARCHIVED').length,
    };

    // Calculate project progress
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

    const panelistNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="tw-w-5 tw-h-5" /> },
        { id: 'projects', label: 'Assigned Projects', icon: <ClipboardList className="tw-w-5 tw-h-5" /> },
        { id: 'createTopics', label: 'Create Topics', icon: <Lightbulb className="tw-w-5 tw-h-5" /> },
        { id: 'splitViewer', label: 'Document Viewer', icon: <Columns className="tw-w-5 tw-h-5" /> },
        { id: 'profile', label: 'Profile', icon: <User className="tw-w-5 tw-h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="tw-w-5 tw-h-5" /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSection user={user} showToast={showToast} />;
            case 'notifications':
                return <NotificationPanel user={user} />;
            case 'projects':
                return renderProjects();
            case 'createTopics':
                return <TopicCreator showToast={showToast} />;
            case 'splitViewer':
                return projects.length > 0 ? (
                    <SplitScreenViewer project={projects[0]} />
                ) : (
                    <div className="tw-text-center tw-py-12 tw-text-muted-foreground">
                        No assigned projects to view documents for.
                    </div>
                );
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="tw-space-y-6">
            {/* Overall Statistics */}
            <div>
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-foreground">Overall Statistics</h2>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                    <Card className="tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-border-indigo-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400">{statistics.total}</div>
                            <div className="tw-text-sm tw-text-indigo-700 dark:tw-text-indigo-300">Total Assigned</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border-amber-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-amber-600 dark:tw-text-amber-400">{statistics.awaitingDefense}</div>
                            <div className="tw-text-sm tw-text-amber-700 dark:tw-text-amber-300">Awaiting Defense</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border-emerald-500/30">
                        <CardContent className="tw-p-4 tw-text-center">
                            <div className="tw-text-3xl tw-font-bold tw-text-emerald-600 dark:tw-text-emerald-400">{statistics.completed}</div>
                            <div className="tw-text-sm tw-text-emerald-700 dark:tw-text-emerald-300">Completed</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Projects Awaiting Defense */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <span className="tw-text-amber-500">⚡</span>
                        Projects Awaiting Defense
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
                            {projects.filter(p => p.status === 'APPROVED_FOR_DEFENSE').length === 0 ? (
                                <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                                    No projects awaiting defense at the moment.
                                </div>
                            ) : (
                                projects
                                    .filter(p => p.status === 'APPROVED_FOR_DEFENSE')
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
                                                        View Details
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
                    <CardTitle className="tw-text-foreground">Project Progress Overview</CardTitle>
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

    const renderProjects = () => (
        <div className="tw-space-y-6">
            <div className="tw-flex tw-justify-between tw-items-center">
                <h2 className="tw-text-xl tw-font-semibold tw-text-foreground">Assigned Projects</h2>
                <div className="tw-text-sm tw-text-muted-foreground">
                    {projects.length} project{projects.length !== 1 ? 's' : ''} assigned to you
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
                        <div className="tw-text-indigo-500 tw-mb-4 tw-flex tw-justify-center"><ClipboardList className="tw-w-10 tw-h-10" /></div>
                        <p className="tw-text-muted-foreground">No projects assigned to you yet.</p>
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
                                            View Details
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
                navItems={panelistNavItems}
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
                                {panelistNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                            </h1>
                            <p className="tw-text-sm tw-text-muted-foreground">
                                Panelist View &mdash; Welcome back, {user?.firstName || 'Panelist'}
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
                        <DialogDescription className="tw-text-muted-foreground">View project details and provide feedback</DialogDescription>
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
                                            {member.email && <span className="tw-ml-1 tw-text-xs tw-opacity-70">({member.email})</span>}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* View Full Proposal Button */}
                            <div className="tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-border tw-border-indigo-500/30 tw-rounded-lg tw-p-4">
                                <h4 className="tw-font-medium tw-mb-2 tw-text-foreground">Proposal Details</h4>
                                <p className="tw-text-sm tw-text-muted-foreground tw-mb-3">
                                    View the complete proposal including background, objectives, methodology, and more.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        setProposalOpen(true);
                                    }}
                                    className="tw-border-indigo-500/50 hover:tw-bg-indigo-500/10"
                                >
                                    View Full Proposal
                                </Button>
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

                            {/* Panelist Feedback Action */}
                            <div className="tw-bg-muted tw-rounded-lg tw-p-4">
                                <h4 className="tw-font-medium tw-mb-3 tw-text-foreground">Panelist Actions</h4>
                                <div className="tw-flex tw-gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={openFeedbackDialog}
                                    >
                                        <MessageSquare className="tw-w-4 tw-h-4 tw-mr-2" />
                                        Add Comment
                                    </Button>
                                    {selectedProject.status === 'APPROVED_FOR_DEFENSE' && (
                                        <Button
                                            onClick={() => handleStatusChange(selectedProject._id, 'FINAL_SUBMITTED')}
                                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                        >
                                            Mark Final Submitted
                                        </Button>
                                    )}
                                </div>
                            </div>

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
                                                {log.comment && (
                                                    <div className="tw-mt-1 tw-text-xs tw-text-muted-foreground tw-italic">
                                                        "{log.comment}"
                                                    </div>
                                                )}
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

            {/* Full Proposal Details Modal (read-only) */}
            {selectedProject && (
                <ProposalDetails
                    project={selectedProject}
                    isOpen={proposalOpen}
                    onClose={() => setProposalOpen(false)}
                    onUpdate={(updatedProject) => {
                        setSelectedProject(updatedProject);
                        loadProjects();
                    }}
                    canEdit={false}
                    showToast={showToast}
                />
            )}

            {/* Feedback/Comment Dialog */}
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
                <DialogContent className="tw-bg-card tw-border-border sm:tw-max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                            <MessageSquare className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                            Add Feedback
                        </DialogTitle>
                        <DialogDescription>
                            Provide feedback or comments for this project. This will be recorded in the workflow history.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="tw-py-4">
                        <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-2">
                            Feedback <span className="tw-text-red-500">*</span>
                        </label>
                        <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Enter your feedback or comments about this project..."
                            className="tw-w-full tw-min-h-[120px] tw-px-3 tw-py-2 tw-bg-background tw-border tw-border-border tw-rounded-md tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent tw-resize-none"
                            disabled={feedbackLoading}
                        />
                        <p className="tw-text-xs tw-text-muted-foreground tw-mt-1">
                            This feedback will be recorded in the project workflow history.
                        </p>
                    </div>

                    <DialogFooter className="tw-gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setFeedbackOpen(false)}
                            disabled={feedbackLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitFeedback}
                            disabled={!feedbackComment.trim() || feedbackLoading}
                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                        >
                            {feedbackLoading ? (
                                <>
                                    <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Feedback'
                            )}
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
        TOPIC_SELECTION: 'secondary',
        CHAPTER_1_DRAFT: 'secondary', CHAPTER_1_REVIEW: 'default', CHAPTER_1_APPROVED: 'default',
        CHAPTER_2_DRAFT: 'secondary', CHAPTER_2_REVIEW: 'default', CHAPTER_2_APPROVED: 'default',
        CHAPTER_3_DRAFT: 'secondary', CHAPTER_3_REVIEW: 'default', CHAPTER_3_APPROVED: 'default',
        PROPOSAL_CONSOLIDATION: 'default', PROPOSAL_DEFENSE: 'default', PROPOSAL_DEFENDED: 'default',
        CAPSTONE2_IN_PROGRESS: 'secondary', CAPSTONE2_REVIEW: 'default', CAPSTONE2_APPROVED: 'default',
        CAPSTONE3_IN_PROGRESS: 'secondary', CAPSTONE3_REVIEW: 'default', CAPSTONE3_APPROVED: 'default',
        FINAL_COMPILATION: 'default', PLAGIARISM_CHECK: 'default', FINAL_DEFENSE: 'default',
        FINAL_APPROVED: 'default', CREDENTIAL_UPLOAD: 'default',
        PROJECT_RESET: 'destructive',
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
        TOPIC_SELECTION: 'Topic Selection',
        CHAPTER_1_DRAFT: 'Ch.1 Draft', CHAPTER_1_REVIEW: 'Ch.1 Review', CHAPTER_1_APPROVED: 'Ch.1 Approved',
        CHAPTER_2_DRAFT: 'Ch.2 Draft', CHAPTER_2_REVIEW: 'Ch.2 Review', CHAPTER_2_APPROVED: 'Ch.2 Approved',
        CHAPTER_3_DRAFT: 'Ch.3 Draft', CHAPTER_3_REVIEW: 'Ch.3 Review', CHAPTER_3_APPROVED: 'Ch.3 Approved',
        PROPOSAL_CONSOLIDATION: 'Consolidation', PROPOSAL_DEFENSE: 'Proposal Defense', PROPOSAL_DEFENDED: 'Proposal Defended',
        CAPSTONE2_IN_PROGRESS: 'Capstone 2 In Progress', CAPSTONE2_REVIEW: 'Capstone 2 Review', CAPSTONE2_APPROVED: 'Capstone 2 Approved',
        CAPSTONE3_IN_PROGRESS: 'Capstone 3 In Progress', CAPSTONE3_REVIEW: 'Capstone 3 Review', CAPSTONE3_APPROVED: 'Capstone 3 Approved',
        FINAL_COMPILATION: 'Final Compilation', PLAGIARISM_CHECK: 'Plagiarism Check', FINAL_DEFENSE: 'Final Defense',
        FINAL_APPROVED: 'Final Approved', CREDENTIAL_UPLOAD: 'Credential Upload',
        PROJECT_RESET: 'Project Reset',
    };
    return labels[status] || status?.replace(/_/g, ' ') || status;
};

export default PanelistDashboard;

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
import ProfileSection from '../components/profile/ProfileSection';
import NotificationPanel from '../components/notifications/NotificationPanel';
import ProgressTracker from '../components/progress/ProgressTracker';
import SimilarityReport from '../components/similarity/SimilarityReport';
import SubmissionPortal from '../components/submission/SubmissionPortal';
import Sidebar from '../components/layout/Sidebar';

const StudentDashboard = () => {
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAdviserEmail, setNewAdviserEmail] = useState('');
    const [newMemberEmails, setNewMemberEmails] = useState('');
    const [creating, setCreating] = useState(false);

    // Title similarity check state
    const [titleSimilarity, setTitleSimilarity] = useState(null);
    const [checkingTitle, setCheckingTitle] = useState(false);

    const [selectedProject, setSelectedProject] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const [activeSection, setActiveSection] = useState('dashboard');
    const [toast, setToast] = useState(null);

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

    // Check title similarity when title changes
    const checkTitleSimilarity = useCallback(async (title) => {
        if (!title || title.trim().length < 5) {
            setTitleSimilarity(null);
            return;
        }

        setCheckingTitle(true);
        try {
            const response = await api.post('/projects/check-title', { title: title.trim() });
            setTitleSimilarity(response.data);
        } catch (err) {
            console.error('Title check failed:', err);
            setTitleSimilarity(null);
        } finally {
            setCheckingTitle(false);
        }
    }, []);

    // Debounced title check
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (newTitle.trim().length >= 5) {
                checkTitleSimilarity(newTitle);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [newTitle, checkTitleSimilarity]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        // Prevent creation if title is in development
        if (titleSimilarity?.status === 'in_development') {
            showToast('error', 'This title is currently being developed. Please choose a different title.');
            return;
        }

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
            setTitleSimilarity(null);
            setIsCreateOpen(false);
            await loadProjects();
            showToast('success', 'Project created successfully');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to create project';
            setError(message);
            showToast('error', message);
        } finally {
            setCreating(false);
        }
    };

    const renderTitleSimilarityFeedback = () => {
        if (!titleSimilarity) return null;

        const { status, similarProjects, message } = titleSimilarity;

        if (status === 'unique') {
            return (
                <div className="tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border tw-border-emerald-500/30 tw-rounded tw-p-3 tw-mt-2">
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <span className="tw-text-emerald-600 dark:tw-text-emerald-400 tw-text-lg">✓</span>
                        <span className="tw-text-emerald-700 dark:tw-text-emerald-300 tw-font-medium">Unique Title</span>
                    </div>
                    <p className="tw-text-sm tw-text-emerald-600 dark:tw-text-emerald-400 tw-mt-1">
                        This capstone title has not yet existed. You can proceed with this title.
                    </p>
                </div>
            );
        }

        if (status === 'similar') {
            return (
                <div className="tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border tw-border-amber-500/30 tw-rounded tw-p-3 tw-mt-2">
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <span className="tw-text-amber-600 dark:tw-text-amber-400 tw-text-lg">⚠</span>
                        <span className="tw-text-amber-700 dark:tw-text-amber-300 tw-font-medium">Similar Titles Found</span>
                    </div>
                    <p className="tw-text-sm tw-text-amber-600 dark:tw-text-amber-400 tw-mt-1">
                        {message || 'This title has similarity but is not entirely the same. You may proceed with caution.'}
                    </p>
                    {similarProjects && similarProjects.length > 0 && (
                        <div className="tw-mt-2 tw-space-y-1">
                            <p className="tw-text-xs tw-font-medium tw-text-amber-700 dark:tw-text-amber-300">Similar projects:</p>
                            {similarProjects.map((project, index) => (
                                <div key={index} className="tw-text-xs tw-text-amber-600 dark:tw-text-amber-400 tw-bg-amber-500/10 tw-rounded tw-px-2 tw-py-1">
                                    "{project.title}" - {project.similarity}% similar
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (status === 'in_development') {
            return (
                <div className="tw-bg-red-500/10 dark:tw-bg-red-500/20 tw-border tw-border-red-500/30 tw-rounded tw-p-3 tw-mt-2">
                    <div className="tw-flex tw-items-center tw-gap-2">
                        <span className="tw-text-red-600 dark:tw-text-red-400 tw-text-lg">✕</span>
                        <span className="tw-text-red-700 dark:tw-text-red-300 tw-font-medium">Title In Development</span>
                    </div>
                    <p className="tw-text-sm tw-text-red-600 dark:tw-text-red-400 tw-mt-1">
                        {message || 'This capstone is currently being developed by your seniors. Please choose a different title.'}
                    </p>
                    {similarProjects && similarProjects.length > 0 && (
                        <div className="tw-mt-2 tw-space-y-1">
                            <p className="tw-text-xs tw-font-medium tw-text-red-700 dark:tw-text-red-300">Active projects:</p>
                            {similarProjects.map((project, index) => (
                                <div key={index} className="tw-text-xs tw-text-red-600 dark:tw-text-red-400 tw-bg-red-500/10 tw-rounded tw-px-2 tw-py-1">
                                    "{project.title}" - Status: {project.status}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    const studentNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'submission', label: 'Submission Portal', icon: '📤' },
        { id: 'progress', label: 'Progress Tracking', icon: '📊' },
        { id: 'similarity', label: 'Similarity Report', icon: '📋' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSection user={user} showToast={showToast} />;
            case 'notifications':
                return <NotificationPanel user={user} />;
            case 'submission':
                return (
                    <SubmissionPortal
                        projects={projects}
                        onProjectSelect={setSelectedProject}
                        onUploadComplete={loadProjects}
                        showToast={showToast}
                    />
                );
            case 'progress':
                return <ProgressTracker projects={projects} />;
            case 'similarity':
                return <SimilarityReport projects={projects} />;
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="tw-space-y-6">
            {/* Quick Stats */}
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
                <Card className="tw-bg-card tw-border-border tw-transition-colors tw-duration-300">
                    <CardContent className="tw-p-4">
                        <div className="tw-text-2xl tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400">{projects.length}</div>
                        <div className="tw-text-sm tw-text-muted-foreground">Total Projects</div>
                    </CardContent>
                </Card>
                <Card className="tw-bg-card tw-border-border tw-transition-colors tw-duration-300">
                    <CardContent className="tw-p-4">
                        <div className="tw-text-2xl tw-font-bold tw-text-amber-600 dark:tw-text-amber-400">
                            {projects.filter(p => p.status === 'PROPOSED' || p.status === 'REVISION_REQUIRED').length}
                        </div>
                        <div className="tw-text-sm tw-text-muted-foreground">In Progress</div>
                    </CardContent>
                </Card>
                <Card className="tw-bg-card tw-border-border tw-transition-colors tw-duration-300">
                    <CardContent className="tw-p-4">
                        <div className="tw-text-2xl tw-font-bold tw-text-purple-600 dark:tw-text-purple-400">
                            {projects.filter(p => p.status === 'ADVISER_REVIEW').length}
                        </div>
                        <div className="tw-text-sm tw-text-muted-foreground">Under Review</div>
                    </CardContent>
                </Card>
                <Card className="tw-bg-card tw-border-border tw-transition-colors tw-duration-300">
                    <CardContent className="tw-p-4">
                        <div className="tw-text-2xl tw-font-bold tw-text-emerald-600 dark:tw-text-emerald-400">
                            {projects.filter(p => p.status === 'APPROVED_FOR_DEFENSE' || p.status === 'FINAL_SUBMITTED').length}
                        </div>
                        <div className="tw-text-sm tw-text-muted-foreground">Approved</div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Project Button */}
            <div className="tw-flex tw-justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white">+ New Project Proposal</Button>
                    </DialogTrigger>
                    <DialogContent className="tw-max-w-lg tw-bg-card tw-border-border">
                        <DialogHeader>
                            <DialogTitle className="tw-text-foreground">Create Project Proposal</DialogTitle>
                            <DialogDescription className="tw-text-muted-foreground">
                                Enter your project title. The system will check for similar existing projects.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateProject} className="tw-space-y-4">
                            <div className="tw-space-y-1">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">Project Title</label>
                                <input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 tw-transition-colors"
                                    placeholder="Enter your capstone project title"
                                    required
                                />
                                {checkingTitle && (
                                    <div className="tw-text-sm tw-text-muted-foreground tw-flex tw-items-center tw-gap-2 tw-mt-1">
                                        <span className="tw-animate-spin">⏳</span> Checking for similar titles...
                                    </div>
                                )}
                                {renderTitleSimilarityFeedback()}
                            </div>

                            <div className="tw-space-y-1">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">Member Emails (comma-separated)</label>
                                <input
                                    value={newMemberEmails}
                                    onChange={(e) => setNewMemberEmails(e.target.value)}
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 tw-transition-colors"
                                    placeholder="student1@buksu.edu.ph, student2@buksu.edu.ph"
                                />
                            </div>

                            <div className="tw-space-y-1">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">Adviser Email</label>
                                <input
                                    value={newAdviserEmail}
                                    onChange={(e) => setNewAdviserEmail(e.target.value)}
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 tw-transition-colors"
                                    placeholder="adviser@buksu.edu.ph"
                                />
                            </div>

                            <DialogFooter className="tw-gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={creating || checkingTitle || titleSimilarity?.status === 'in_development'}
                                    className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                >
                                    {creating ? 'Creating...' : 'Create Proposal'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Projects List */}
            <Card className="tw-bg-card tw-border-border tw-transition-colors tw-duration-300">
                <CardHeader>
                    <CardTitle className="tw-text-foreground">My Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="tw-space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="tw-h-20 tw-rounded tw-bg-muted tw-animate-pulse" />
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="tw-text-center tw-py-8">
                            <div className="tw-text-4xl tw-mb-4">📝</div>
                            <p className="tw-text-muted-foreground">No projects yet. Create your first proposal!</p>
                        </div>
                    ) : (
                        <div className="tw-space-y-3">
                            {projects.map((project) => (
                                <div
                                    key={project._id}
                                    className="tw-bg-background tw-border tw-border-border tw-rounded-lg tw-p-4 hover:tw-shadow-md tw-transition-all tw-duration-300"
                                >
                                    <div className="tw-flex tw-justify-between tw-items-start tw-gap-4">
                                        <div className="tw-flex-1">
                                            <h3 className="tw-font-semibold tw-text-lg tw-text-foreground">{project.title}</h3>
                                            <div className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                                {project.adviser?.firstName ? `Adviser: ${project.adviser.firstName} ${project.adviser.lastName || ''}`.trim() : 'No adviser assigned'}
                                            </div>
                                            {project.members && project.members.length > 0 && (
                                                <div className="tw-text-sm tw-text-muted-foreground">
                                                    Members: {project.members.map(m => m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : m).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="tw-flex tw-flex-col tw-items-end tw-gap-2">
                                            <Badge variant={getStatusVariant(project.status)}>
                                                {formatStatus(project.status)}
                                            </Badge>
                                            {project.plagiarismReport?.score !== undefined && (
                                                <Badge variant="outline">
                                                    Similarity: {project.plagiarismReport.score}%
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="tw-mt-3 tw-flex tw-gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedProject(project);
                                                setDetailsOpen(true);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                        {project.document?.webViewLink && (
                                            <a
                                                href={project.document.webViewLink}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Button variant="outline" size="sm">
                                                    View Document
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="tw-min-h-screen tw-bg-background tw-flex tw-transition-colors tw-duration-300">
            {/* Sidebar */}
            <Sidebar
                navItems={studentNavItems}
                activeSection={activeSection}
                onNavigate={setActiveSection}
                user={user}
                onLogout={logout}
            />

            {/* Main Content */}
            <div className="tw-flex-1 tw-ml-64">
                <header className="tw-bg-card tw-shadow-sm tw-border-b tw-border-border tw-px-6 tw-py-4 tw-transition-colors tw-duration-300">
                    <div className="tw-flex tw-justify-between tw-items-center">
                        <div>
                            <h1 className="tw-text-2xl tw-font-bold tw-text-foreground">
                                {studentNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                            </h1>
                            <p className="tw-text-sm tw-text-muted-foreground">
                                Welcome back, {user?.firstName || 'Student'}
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

            {/* Toast Notification */}
            {toast && (
                <div className="tw-fixed tw-bottom-4 tw-right-4 tw-z-50">
                    <div
                        className={`tw-rounded-lg tw-px-4 tw-py-3 tw-shadow-lg tw-transition-all tw-duration-300 ${
                            toast.type === 'success'
                                ? 'tw-bg-green-500 tw-text-white'
                                : 'tw-bg-red-500 tw-text-white'
                        }`}
                    >
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Project Details Dialog */}
            {selectedProject && (
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="tw-max-w-2xl tw-bg-card tw-border-border">
                        <DialogHeader>
                            <DialogTitle className="tw-text-foreground">{selectedProject.title}</DialogTitle>
                            <DialogDescription className="tw-text-muted-foreground">Project Details and Progress</DialogDescription>
                        </DialogHeader>
                        <div className="tw-space-y-4">
                            <div className="tw-flex tw-gap-2">
                                <Badge variant={getStatusVariant(selectedProject.status)}>
                                    {formatStatus(selectedProject.status)}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="tw-font-medium tw-mb-1 tw-text-foreground">Adviser</h4>
                                <p className="tw-text-muted-foreground">
                                    {selectedProject.adviser?.firstName ? `${selectedProject.adviser.firstName} ${selectedProject.adviser.lastName || ''}`.trim() : 'Not assigned'}
                                </p>
                            </div>
                            <div>
                                <h4 className="tw-font-medium tw-mb-1 tw-text-foreground">Team Members</h4>
                                <div className="tw-flex tw-flex-wrap tw-gap-2">
                                    {selectedProject.members?.map((member, idx) => (
                                        <Badge key={idx} variant="secondary">
                                            {member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : member}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            {selectedProject.plagiarismReport && (
                                <div>
                                    <h4 className="tw-font-medium tw-mb-1 tw-text-foreground">Similarity Report</h4>
                                    <div className="tw-bg-muted tw-rounded tw-p-3">
                                        <p className="tw-text-foreground">Status: {selectedProject.plagiarismReport.status}</p>
                                        {selectedProject.plagiarismReport.score !== undefined && (
                                            <p className="tw-text-foreground">Score: {selectedProject.plagiarismReport.score}%</p>
                                        )}
                                        {selectedProject.plagiarismReport.reportUrl && (
                                            <a
                                                href={selectedProject.plagiarismReport.reportUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline tw-text-sm"
                                            >
                                                View Full Report
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

// Helper functions
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
        APPROVED_FOR_DEFENSE: 'Approved for Defense',
        FINAL_SUBMITTED: 'Final Submitted',
        ARCHIVED: 'Archived',
    };
    return labels[status] || status;
};

export default StudentDashboard;

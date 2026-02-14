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
import ProposalDetails from '../components/proposal/ProposalDetails';
import TopicCreator from '../components/topics/TopicCreator';
import DeadlineManager from '../components/deadlines/DeadlineManager';
import ReportsDashboard from '../components/reports/ReportsDashboard';
import LegacyUpload from '../components/legacy/LegacyUpload';
import UserManagement from '../components/admin/UserManagement';
import { LayoutDashboard, Users, User, Bell, ClipboardList, Search, UserPlus, FileText, Lightbulb, Loader2, CheckCircle, XCircle, Calendar, BarChart3, Archive, Shield } from 'lucide-react';

const CoordinatorDashboard = () => {
    const { user, logout } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [toast, setToast] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedProject, setSelectedProject] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [proposalOpen, setProposalOpen] = useState(false);
    const [projectLogs, setProjectLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Team management state
    const [teams, setTeams] = useState([]);
    const [teamsLoading, setTeamsLoading] = useState(false);
    const [orphanedStudents, setOrphanedStudents] = useState([]);
    const [adoptingStudent, setAdoptingStudent] = useState(null);

    // Title change requests state
    const [titleRequests, setTitleRequests] = useState([]);
    const [titleRequestsLoading, setTitleRequestsLoading] = useState(false);
    const [reviewingRequest, setReviewingRequest] = useState(null);
    const [reviewComment, setReviewComment] = useState('');

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

    const loadTeams = useCallback(async () => {
        setTeamsLoading(true);
        try {
            const response = await api.get('/teams');
            setTeams(response.data?.teams || []);
        } catch (err) {
            console.error('Failed to load teams:', err);
        } finally {
            setTeamsLoading(false);
        }
    }, []);

    const loadOrphanedStudents = useCallback(async () => {
        try {
            const usersRes = await api.get('/auth/users?role=student');
            const students = usersRes.data?.users || [];
            const teamsRes = await api.get('/teams');
            const allTeams = teamsRes.data?.teams || [];

            const assignedStudentIds = new Set();
            allTeams.forEach((team) => {
                if (team.status !== 'dissolved') {
                    team.members?.forEach((m) => {
                        const userId = m.user?._id || m.user;
                        if (userId) assignedStudentIds.add(String(userId));
                    });
                }
            });

            const orphaned = students.filter((s) => !assignedStudentIds.has(String(s._id)));
            setOrphanedStudents(orphaned);
        } catch (err) {
            console.error('Failed to load orphaned students:', err);
        }
    }, []);

    const handleAdoptStudent = async (teamId, studentId) => {
        setAdoptingStudent(studentId);
        try {
            await api.post(`/teams/${teamId}/adopt`, { studentId });
            showToast('success', 'Student added to team successfully');
            await loadTeams();
            await loadOrphanedStudents();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to adopt student');
        } finally {
            setAdoptingStudent(null);
        }
    };

    const loadTitleRequests = useCallback(async () => {
        setTitleRequestsLoading(true);
        try {
            const response = await api.get('/title-requests');
            setTitleRequests(response.data?.requests || []);
        } catch (err) {
            console.error('Failed to load title requests:', err);
        } finally {
            setTitleRequestsLoading(false);
        }
    }, []);

    const handleReviewTitleRequest = async (requestId, decision) => {
        setReviewingRequest(requestId);
        try {
            await api.patch(`/title-requests/${requestId}`, {
                status: decision,
                reviewComment: reviewComment.trim(),
            });
            showToast('success', `Title change request ${decision}`);
            setReviewComment('');
            await loadTitleRequests();
            await loadProjects();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to review title request');
        } finally {
            setReviewingRequest(null);
        }
    };

    const openProjectDetails = async (project) => {
        setSelectedProject(project);
        setDetailsOpen(true);
        await loadProjectLogs(project._id);
    };

    const handleArchive = async (projectId) => {
        try {
            await api.patch(`/projects/${projectId}/status`, { status: 'ARCHIVED' });
            showToast('success', 'Project archived successfully');
            await loadProjects();
            setDetailsOpen(false);
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to archive project');
        }
    };

    // Calculate statistics
    const statistics = {
        total: projects.length,
        proposed: projects.filter(p => p.status === 'PROPOSED').length,
        underReview: projects.filter(p => p.status === 'ADVISER_REVIEW').length,
        needsRevision: projects.filter(p => p.status === 'REVISION_REQUIRED').length,
        approved: projects.filter(p => p.status === 'APPROVED_FOR_DEFENSE').length,
        finalSubmitted: projects.filter(p => p.status === 'FINAL_SUBMITTED').length,
        archived: projects.filter(p => p.status === 'ARCHIVED').length,
    };

    // Calculate completion percentages
    const getCompletionPercentage = (status) => {
        const percentages = {
            PROPOSED: 10,
            ADVISER_REVIEW: 30,
            REVISION_REQUIRED: 40,
            APPROVED_FOR_DEFENSE: 70,
            FINAL_SUBMITTED: 90,
            ARCHIVED: 100,
        };
        return percentages[status] || 0;
    };

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
        const matchesSearch = searchTerm === '' || 
            project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.members?.some(m => {
                const fullName = m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : String(m);
                return fullName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        return matchesStatus && matchesSearch;
    });

    const coordinatorNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="tw-w-5 tw-h-5" /> },
        { id: 'teams', label: 'All Capstone Teams', icon: <Users className="tw-w-5 tw-h-5" /> },
        { id: 'teamManagement', label: 'Team Management', icon: <UserPlus className="tw-w-5 tw-h-5" /> },
        { id: 'titleRequests', label: 'Title Requests', icon: <FileText className="tw-w-5 tw-h-5" /> },
        { id: 'createTopics', label: 'Create Topics', icon: <Lightbulb className="tw-w-5 tw-h-5" /> },
        { id: 'deadlines', label: 'Deadlines', icon: <Calendar className="tw-w-5 tw-h-5" /> },
        { id: 'reports', label: 'Reports', icon: <BarChart3 className="tw-w-5 tw-h-5" /> },
        { id: 'legacyUpload', label: 'Legacy Upload', icon: <Archive className="tw-w-5 tw-h-5" /> },
        { id: 'userManagement', label: 'User Management', icon: <Shield className="tw-w-5 tw-h-5" /> },
        { id: 'profile', label: 'Profile', icon: <User className="tw-w-5 tw-h-5" /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell className="tw-w-5 tw-h-5" /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSection user={user} showToast={showToast} />;
            case 'notifications':
                return <NotificationPanel user={user} />;
            case 'teams':
                return renderTeamsView();
            case 'teamManagement':
                return renderTeamManagement();
            case 'titleRequests':
                return renderTitleRequests();
            case 'createTopics':
                return <TopicCreator showToast={showToast} />;
            case 'deadlines':
                return <DeadlineManager user={user} showToast={showToast} />;
            case 'reports':
                return <ReportsDashboard showToast={showToast} />;
            case 'legacyUpload':
                return <LegacyUpload showToast={showToast} />;
            case 'userManagement':
                return <UserManagement showToast={showToast} />;
            default:
                return renderDashboard();
        }
    };

    const renderDashboard = () => (
        <div className="tw-space-y-6">
            {/* Overview Stats */}
            <div>
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4 tw-text-foreground">Department Overview</h2>
                <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
                    <Card className="tw-bg-gradient-to-br tw-from-indigo-500 tw-to-indigo-600 tw-border-0">
                        <CardContent className="tw-p-6 tw-text-white">
                            <div className="tw-text-4xl tw-font-bold">{statistics.total}</div>
                            <div className="tw-text-indigo-100">Total Capstone Teams</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-gradient-to-br tw-from-amber-500 tw-to-amber-600 tw-border-0">
                        <CardContent className="tw-p-6 tw-text-white">
                            <div className="tw-text-4xl tw-font-bold">
                                {statistics.proposed + statistics.underReview + statistics.needsRevision}
                            </div>
                            <div className="tw-text-amber-100">In Progress</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-gradient-to-br tw-from-emerald-500 tw-to-emerald-600 tw-border-0">
                        <CardContent className="tw-p-6 tw-text-white">
                            <div className="tw-text-4xl tw-font-bold">
                                {statistics.approved + statistics.finalSubmitted}
                            </div>
                            <div className="tw-text-emerald-100">Approved / Completed</div>
                        </CardContent>
                    </Card>
                    <Card className="tw-bg-gradient-to-br tw-from-purple-500 tw-to-purple-600 tw-border-0">
                        <CardContent className="tw-p-6 tw-text-white">
                            <div className="tw-text-4xl tw-font-bold">{statistics.archived}</div>
                            <div className="tw-text-purple-100">Archived</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Status Breakdown */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-text-foreground">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-6 tw-gap-4">
                        {Object.entries({
                            'Proposed': statistics.proposed,
                            'Under Review': statistics.underReview,
                            'Needs Revision': statistics.needsRevision,
                            'Defense Ready': statistics.approved,
                            'Final Submitted': statistics.finalSubmitted,
                            'Archived': statistics.archived,
                        }).map(([label, count]) => (
                            <div key={label} className="tw-text-center tw-p-4 tw-bg-muted tw-rounded-lg">
                                <div className="tw-text-2xl tw-font-bold tw-text-foreground">{count}</div>
                                <div className="tw-text-sm tw-text-muted-foreground">{label}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Completion Chart */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-text-foreground">Overall Completion Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-space-y-4">
                        {/* Average completion */}
                        <div className="tw-text-center tw-py-4">
                            <div className="tw-text-5xl tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400">
                                {projects.length > 0 
                                    ? Math.round(projects.reduce((acc, p) => acc + getCompletionPercentage(p.status), 0) / projects.length)
                                    : 0}%
                            </div>
                            <div className="tw-text-muted-foreground">Average Completion Rate</div>
                        </div>

                        {/* Progress bars by status */}
                        <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-4">
                            {['PROPOSED', 'ADVISER_REVIEW', 'REVISION_REQUIRED', 'APPROVED_FOR_DEFENSE', 'FINAL_SUBMITTED', 'ARCHIVED'].map(status => {
                                const count = projects.filter(p => p.status === status).length;
                                const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                                return (
                                    <div key={status} className="tw-space-y-1">
                                        <div className="tw-flex tw-justify-between tw-text-sm">
                                            <span className="tw-text-foreground">{formatStatus(status)}</span>
                                            <span className="tw-font-medium tw-text-foreground">{count}</span>
                                        </div>
                                        <div className="tw-w-full tw-bg-muted tw-rounded-full tw-h-2">
                                            <div
                                                className={`tw-h-2 tw-rounded-full ${getStatusColor(status)}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Teams Requiring Final Review */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <ClipboardList className="tw-w-5 tw-h-5" /> Teams Ready for Archive
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {projects.filter(p => p.status === 'FINAL_SUBMITTED').length === 0 ? (
                        <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                            No teams ready for archive at the moment.
                        </div>
                    ) : (
                        <div className="tw-space-y-3">
                            {projects.filter(p => p.status === 'FINAL_SUBMITTED').map(project => (
                                <div
                                    key={project._id}
                                    className="tw-flex tw-justify-between tw-items-center tw-bg-purple-500/10 dark:tw-bg-purple-500/20 tw-border tw-border-purple-500/30 tw-rounded-lg tw-p-4"
                                >
                                    <div>
                                        <h4 className="tw-font-medium tw-text-foreground">{project.title}</h4>
                                        <p className="tw-text-sm tw-text-muted-foreground">
                                            Adviser: {project.adviser?.firstName ? `${project.adviser.firstName} ${project.adviser.lastName || ''}`.trim() : 'Not assigned'}
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
                                        <Button
                                            size="sm"
                                            onClick={() => handleArchive(project._id)}
                                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                        >
                                            Archive
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderTeamsView = () => (
        <div className="tw-space-y-6">
            {/* Filters */}
            <Card className="tw-bg-card tw-border-border">
                <CardContent className="tw-p-4">
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-4">
                        <div className="tw-flex-1">
                            <input
                                type="text"
                                placeholder="Search by title or member name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-4 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 tw-transition-colors"
                            />
                        </div>
                        <div className="tw-flex tw-gap-2 tw-flex-wrap">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('all')}
                                className={filterStatus === 'all' ? 'tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white' : ''}
                            >
                                All
                            </Button>
                            {['PROPOSED', 'ADVISER_REVIEW', 'REVISION_REQUIRED', 'APPROVED_FOR_DEFENSE', 'FINAL_SUBMITTED', 'ARCHIVED'].map(status => (
                                <Button
                                    key={status}
                                    variant={filterStatus === status ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterStatus(status)}
                                    className={filterStatus === status ? 'tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white' : ''}
                                >
                                    {formatStatus(status)}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Teams Table */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-text-foreground">
                        Capstone Teams ({filteredProjects.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="tw-space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="tw-h-16 tw-rounded tw-bg-muted tw-animate-pulse" />
                            ))}
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="tw-text-center tw-py-12">
                            <div className="tw-text-indigo-500 tw-mb-4 tw-flex tw-justify-center"><Search className="tw-w-10 tw-h-10" /></div>
                            <p className="tw-text-muted-foreground">No teams found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="tw-overflow-x-auto">
                            <table className="tw-w-full">
                                <thead>
                                    <tr className="tw-border-b tw-border-border">
                                        <th className="tw-text-left tw-py-3 tw-px-4 tw-font-medium tw-text-muted-foreground">Title</th>
                                        <th className="tw-text-left tw-py-3 tw-px-4 tw-font-medium tw-text-muted-foreground">Status</th>
                                        <th className="tw-text-left tw-py-3 tw-px-4 tw-font-medium tw-text-muted-foreground">Completion</th>
                                        <th className="tw-text-left tw-py-3 tw-px-4 tw-font-medium tw-text-muted-foreground">Team Members</th>
                                        <th className="tw-text-left tw-py-3 tw-px-4 tw-font-medium tw-text-muted-foreground">Adviser</th>
                                        <th className="tw-text-left tw-py-3 tw-px-4 tw-font-medium tw-text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map(project => {
                                        const completion = getCompletionPercentage(project.status);
                                        return (
                                            <tr key={project._id} className="tw-border-b tw-border-border hover:tw-bg-muted/50 tw-transition-colors">
                                                <td className="tw-py-3 tw-px-4">
                                                    <div className="tw-font-medium tw-max-w-[200px] tw-truncate tw-text-foreground">
                                                        {project.title}
                                                    </div>
                                                </td>
                                                <td className="tw-py-3 tw-px-4">
                                                    <Badge variant={getStatusVariant(project.status)}>
                                                        {formatStatus(project.status)}
                                                    </Badge>
                                                </td>
                                                <td className="tw-py-3 tw-px-4">
                                                    <div className="tw-flex tw-items-center tw-gap-2">
                                                        <div className="tw-w-20 tw-bg-muted tw-rounded-full tw-h-2">
                                                            <div
                                                                className={`tw-h-2 tw-rounded-full ${getStatusColor(project.status)}`}
                                                                style={{ width: `${completion}%` }}
                                                            />
                                                        </div>
                                                        <span className="tw-text-sm tw-text-muted-foreground">{completion}%</span>
                                                    </div>
                                                </td>
                                                <td className="tw-py-3 tw-px-4">
                                                    <div className="tw-flex tw-flex-wrap tw-gap-1">
                                                        {project.members?.slice(0, 2).map((m, idx) => (
                                                            <Badge key={idx} variant="secondary" className="tw-text-xs">
                                                                {m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : m}
                                                            </Badge>
                                                        ))}
                                                        {project.members?.length > 2 && (
                                                            <Badge variant="outline" className="tw-text-xs">
                                                                +{project.members.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="tw-py-3 tw-px-4 tw-text-sm tw-text-muted-foreground">
                                                    {project.adviser?.firstName ? `${project.adviser.firstName} ${project.adviser.lastName || ''}`.trim() : 'Not assigned'}
                                                </td>
                                                <td className="tw-py-3 tw-px-4">
                                                    <div className="tw-flex tw-gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openProjectDetails(project)}
                                                        >
                                                            View
                                                        </Button>
                                                        {project.status === 'FINAL_SUBMITTED' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleArchive(project._id)}
                                                                className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                                            >
                                                                Archive
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderTeamManagement = () => {
        // Load data on first render of this section
        if (teams.length === 0 && !teamsLoading) {
            loadTeams();
            loadOrphanedStudents();
        }

        return (
            <div className="tw-space-y-6">
                {/* Orphaned Students */}
                <Card className="tw-bg-card tw-border-border">
                    <CardHeader>
                        <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                            <UserPlus className="tw-w-5 tw-h-5 tw-text-amber-500" />
                            Unassigned Students ({orphanedStudents.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orphanedStudents.length === 0 ? (
                            <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                                All students are assigned to teams.
                            </div>
                        ) : (
                            <div className="tw-space-y-3">
                                {orphanedStudents.map((student) => (
                                    <div
                                        key={student._id}
                                        className="tw-flex tw-justify-between tw-items-center tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border tw-border-amber-500/30 tw-rounded-lg tw-p-4"
                                    >
                                        <div>
                                            <h4 className="tw-font-medium tw-text-foreground">
                                                {student.firstName} {student.lastName}
                                            </h4>
                                            <p className="tw-text-sm tw-text-muted-foreground">{student.email}</p>
                                        </div>
                                        <div className="tw-flex tw-items-center tw-gap-2">
                                            <select
                                                className="tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1.5 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                id={`team-select-${student._id}`}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select team...</option>
                                                {teams.filter((t) => t.status !== 'dissolved' && t.members.length < t.maxSize).map((t) => (
                                                    <option key={t._id} value={t._id}>{t.name} ({t.members.length}/{t.maxSize})</option>
                                                ))}
                                            </select>
                                            <Button
                                                size="sm"
                                                disabled={adoptingStudent === student._id}
                                                onClick={() => {
                                                    const select = document.getElementById(`team-select-${student._id}`);
                                                    if (select?.value) {
                                                        handleAdoptStudent(select.value, student._id);
                                                    } else {
                                                        showToast('error', 'Please select a team first');
                                                    }
                                                }}
                                                className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                            >
                                                {adoptingStudent === student._id ? 'Adding...' : 'Add to Team'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* All Teams Overview */}
                <Card className="tw-bg-card tw-border-border">
                    <CardHeader>
                        <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                            <Users className="tw-w-5 tw-h-5" />
                            All Teams ({teams.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {teamsLoading ? (
                            <div className="tw-space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="tw-h-16 tw-rounded tw-bg-muted tw-animate-pulse" />
                                ))}
                            </div>
                        ) : teams.length === 0 ? (
                            <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                                No teams have been created yet.
                            </div>
                        ) : (
                            <div className="tw-space-y-3">
                                {teams.map((team) => (
                                    <div
                                        key={team._id}
                                        className="tw-bg-muted/50 tw-border tw-border-border tw-rounded-lg tw-p-4"
                                    >
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <div>
                                                <div className="tw-flex tw-items-center tw-gap-2 tw-mb-1">
                                                    <h4 className="tw-font-medium tw-text-foreground">{team.name}</h4>
                                                    <Badge variant={team.status === 'locked' ? 'default' : team.status === 'forming' ? 'secondary' : 'destructive'}>
                                                        {team.status}
                                                    </Badge>
                                                </div>
                                                <div className="tw-flex tw-flex-wrap tw-gap-1 tw-mt-1">
                                                    {team.members?.map((m, idx) => (
                                                        <Badge key={idx} variant="outline" className="tw-text-xs">
                                                            {m.user?.firstName ? `${m.user.firstName} ${m.user.lastName || ''}`.trim() : 'Unknown'}
                                                            {m.role === 'leader' && ' (Leader)'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="tw-text-sm tw-text-muted-foreground">
                                                {team.members?.length || 0}/{team.maxSize} members
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderTitleRequests = () => {
        // Load data on first render of this section
        if (titleRequests.length === 0 && !titleRequestsLoading) {
            loadTitleRequests();
        }

        return (
            <div className="tw-space-y-6">
                <Card className="tw-bg-card tw-border-border">
                    <CardHeader>
                        <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                            <FileText className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                            Pending Title Change Requests ({titleRequests.filter(r => r.status === 'pending').length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {titleRequestsLoading ? (
                            <div className="tw-space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="tw-h-24 tw-rounded tw-bg-muted tw-animate-pulse" />
                                ))}
                            </div>
                        ) : titleRequests.filter(r => r.status === 'pending').length === 0 ? (
                            <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
                                No pending title change requests.
                            </div>
                        ) : (
                            <div className="tw-space-y-4">
                                {titleRequests.filter(r => r.status === 'pending').map((request) => (
                                    <div
                                        key={request._id}
                                        className="tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border tw-border-amber-500/30 tw-rounded-lg tw-p-4"
                                    >
                                        <div className="tw-flex tw-justify-between tw-items-start tw-mb-3">
                                            <div>
                                                <div className="tw-text-sm tw-text-muted-foreground tw-mb-1">
                                                    Requested by: {request.requestedBy?.firstName
                                                        ? `${request.requestedBy.firstName} ${request.requestedBy.lastName || ''}`.trim()
                                                        : 'Unknown'}
                                                </div>
                                                <div className="tw-space-y-1">
                                                    <div className="tw-text-sm">
                                                        <span className="tw-font-medium tw-text-foreground">Current: </span>
                                                        <span className="tw-text-muted-foreground">{request.currentTitle}</span>
                                                    </div>
                                                    <div className="tw-text-sm">
                                                        <span className="tw-font-medium tw-text-foreground">Proposed: </span>
                                                        <span className="tw-text-indigo-600 dark:tw-text-indigo-400 tw-font-medium">{request.proposedTitle}</span>
                                                    </div>
                                                </div>
                                                {request.rationale && (
                                                    <div className="tw-text-sm tw-mt-2">
                                                        <span className="tw-font-medium tw-text-foreground">Rationale: </span>
                                                        <span className="tw-text-muted-foreground">{request.rationale}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge variant="secondary">
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </Badge>
                                        </div>

                                        <div className="tw-space-y-2">
                                            <textarea
                                                placeholder="Add a review comment (optional)..."
                                                className="tw-w-full tw-min-h-[60px] tw-px-3 tw-py-2 tw-bg-background tw-border tw-border-border tw-rounded-md tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent tw-resize-none tw-text-sm"
                                                onChange={(e) => setReviewComment(e.target.value)}
                                            />
                                            <div className="tw-flex tw-gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReviewTitleRequest(request._id, 'approved')}
                                                    disabled={reviewingRequest === request._id}
                                                    className="tw-bg-emerald-600 hover:tw-bg-emerald-700 tw-text-white"
                                                >
                                                    {reviewingRequest === request._id ? (
                                                        <Loader2 className="tw-w-4 tw-h-4 tw-mr-1 tw-animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="tw-w-4 tw-h-4 tw-mr-1" />
                                                    )}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleReviewTitleRequest(request._id, 'rejected')}
                                                    disabled={reviewingRequest === request._id}
                                                >
                                                    {reviewingRequest === request._id ? (
                                                        <Loader2 className="tw-w-4 tw-h-4 tw-mr-1 tw-animate-spin" />
                                                    ) : (
                                                        <XCircle className="tw-w-4 tw-h-4 tw-mr-1" />
                                                    )}
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recently Reviewed */}
                {titleRequests.filter(r => r.status !== 'pending').length > 0 && (
                    <Card className="tw-bg-card tw-border-border">
                        <CardHeader>
                            <CardTitle className="tw-text-foreground">Recently Reviewed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="tw-space-y-3">
                                {titleRequests.filter(r => r.status !== 'pending').slice(0, 10).map((request) => (
                                    <div
                                        key={request._id}
                                        className="tw-bg-muted/50 tw-border tw-border-border tw-rounded-lg tw-p-3"
                                    >
                                        <div className="tw-flex tw-justify-between tw-items-start">
                                            <div>
                                                <div className="tw-text-sm">
                                                    <span className="tw-text-muted-foreground">{request.currentTitle}</span>
                                                    <span className="tw-mx-2 tw-text-muted-foreground">&rarr;</span>
                                                    <span className="tw-font-medium tw-text-foreground">{request.proposedTitle}</span>
                                                </div>
                                                {request.reviewComment && (
                                                    <div className="tw-text-xs tw-text-muted-foreground tw-mt-1 tw-italic">
                                                        &ldquo;{request.reviewComment}&rdquo;
                                                    </div>
                                                )}
                                            </div>
                                            <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                                                {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <div className="tw-min-h-screen tw-bg-background tw-flex tw-transition-colors tw-duration-300">
            <Sidebar
                navItems={coordinatorNavItems}
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
                                {coordinatorNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                            </h1>
                            <p className="tw-text-sm tw-text-muted-foreground">
                                Research Coordinator View
                            </p>
                        </div>
                    </div>
                </header>

                <main className="tw-p-6">
                    {error && (
                        <div className="tw-bg-red-500/10 tw-border tw-border-red-500/30 tw-text-red-600 dark:tw-text-red-400 tw-rounded-lg tw-p-4 tw-mb-6">
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
                        className={`tw-rounded-lg tw-px-4 tw-py-3 tw-shadow-lg ${
                            toast.type === 'success' ? 'tw-bg-emerald-500 tw-text-white' : 'tw-bg-red-500 tw-text-white'
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
                        <DialogDescription className="tw-text-muted-foreground">Complete project information</DialogDescription>
                    </DialogHeader>

                    {selectedProject && (
                        <div className="tw-space-y-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <Badge variant={getStatusVariant(selectedProject.status)}>
                                    {formatStatus(selectedProject.status)}
                                </Badge>
                                <span className="tw-text-sm tw-text-muted-foreground">
                                    {getCompletionPercentage(selectedProject.status)}% Complete
                                </span>
                            </div>

                            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
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
                                <div>
                                    <h4 className="tw-font-medium tw-mb-2 tw-text-foreground">Adviser</h4>
                                    <p className="tw-text-muted-foreground">
                                        {selectedProject.adviser?.firstName ? `${selectedProject.adviser.firstName} ${selectedProject.adviser.lastName || ''}`.trim() : 'Not assigned'}
                                    </p>
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

                            {selectedProject.plagiarismReport && (
                                <div>
                                    <h4 className="tw-font-medium tw-mb-2 tw-text-foreground">Plagiarism Report</h4>
                                    <div className="tw-bg-muted tw-rounded tw-p-3">
                                        <p className="tw-text-foreground">Status: {selectedProject.plagiarismReport.status}</p>
                                        {selectedProject.plagiarismReport.score !== undefined && (
                                            <p className="tw-text-foreground">Similarity Score: {selectedProject.plagiarismReport.score}%</p>
                                        )}
                                        {selectedProject.plagiarismReport.reportUrl && (
                                            <a
                                                href={selectedProject.plagiarismReport.reportUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline tw-text-sm"
                                            >
                                                View Full Report →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Coordinator Actions */}
                            {selectedProject.status === 'FINAL_SUBMITTED' && (
                                <div className="tw-bg-purple-500/10 dark:tw-bg-purple-500/20 tw-border tw-border-purple-500/30 tw-rounded-lg tw-p-4">
                                    <h4 className="tw-font-medium tw-mb-3 tw-text-foreground">Coordinator Action</h4>
                                    <Button 
                                        onClick={() => handleArchive(selectedProject._id)}
                                        className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                    >
                                        Archive This Project
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

            {/* Full Proposal Details Modal */}
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

const getStatusColor = (status) => {
    const colors = {
        PROPOSED: 'tw-bg-slate-500',
        ADVISER_REVIEW: 'tw-bg-amber-500',
        REVISION_REQUIRED: 'tw-bg-orange-500',
        APPROVED_FOR_DEFENSE: 'tw-bg-emerald-500',
        FINAL_SUBMITTED: 'tw-bg-indigo-500',
        ARCHIVED: 'tw-bg-purple-500',
        TOPIC_SELECTION: 'tw-bg-slate-400',
        CHAPTER_1_DRAFT: 'tw-bg-blue-400', CHAPTER_1_REVIEW: 'tw-bg-amber-400', CHAPTER_1_APPROVED: 'tw-bg-emerald-400',
        CHAPTER_2_DRAFT: 'tw-bg-blue-400', CHAPTER_2_REVIEW: 'tw-bg-amber-400', CHAPTER_2_APPROVED: 'tw-bg-emerald-400',
        CHAPTER_3_DRAFT: 'tw-bg-blue-400', CHAPTER_3_REVIEW: 'tw-bg-amber-400', CHAPTER_3_APPROVED: 'tw-bg-emerald-400',
        PROPOSAL_CONSOLIDATION: 'tw-bg-teal-500', PROPOSAL_DEFENSE: 'tw-bg-cyan-500', PROPOSAL_DEFENDED: 'tw-bg-cyan-600',
        CAPSTONE2_IN_PROGRESS: 'tw-bg-blue-500', CAPSTONE2_REVIEW: 'tw-bg-amber-500', CAPSTONE2_APPROVED: 'tw-bg-emerald-500',
        CAPSTONE3_IN_PROGRESS: 'tw-bg-blue-500', CAPSTONE3_REVIEW: 'tw-bg-amber-500', CAPSTONE3_APPROVED: 'tw-bg-emerald-500',
        FINAL_COMPILATION: 'tw-bg-violet-500', PLAGIARISM_CHECK: 'tw-bg-rose-500', FINAL_DEFENSE: 'tw-bg-indigo-600',
        FINAL_APPROVED: 'tw-bg-emerald-600', CREDENTIAL_UPLOAD: 'tw-bg-teal-600',
        PROJECT_RESET: 'tw-bg-red-500',
    };
    return colors[status] || 'tw-bg-slate-500';
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
        CAPSTONE2_IN_PROGRESS: 'Capstone 2', CAPSTONE2_REVIEW: 'Cap.2 Review', CAPSTONE2_APPROVED: 'Cap.2 Approved',
        CAPSTONE3_IN_PROGRESS: 'Capstone 3', CAPSTONE3_REVIEW: 'Cap.3 Review', CAPSTONE3_APPROVED: 'Cap.3 Approved',
        FINAL_COMPILATION: 'Final Compilation', PLAGIARISM_CHECK: 'Plagiarism Check', FINAL_DEFENSE: 'Final Defense',
        FINAL_APPROVED: 'Final Approved', CREDENTIAL_UPLOAD: 'Credential Upload',
        PROJECT_RESET: 'Project Reset',
    };
    return labels[status] || status?.replace(/_/g, ' ') || status;
};

export default CoordinatorDashboard;
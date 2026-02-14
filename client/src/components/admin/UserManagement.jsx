import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog';
import api from '../../services/api';
import { Users, Search, Shield, Loader2 } from 'lucide-react';

const ROLES = ['student', 'adviser', 'panelist', 'coordinator'];

const ROLE_BADGE_VARIANT = {
    coordinator: 'default',
    adviser: 'secondary',
    panelist: 'outline',
    student: 'secondary',
};

const UserManagement = ({ showToast }) => {
    // ── User list state ──
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // ── Role change dialog state ──
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [roleChangeLoading, setRoleChangeLoading] = useState(false);

    // ── Project assignment state ──
    const [projects, setProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedAdviserId, setSelectedAdviserId] = useState('');
    const [selectedPanelistIds, setSelectedPanelistIds] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);

    // ────────────────────────────────────────────
    //  Fetch users
    // ────────────────────────────────────────────
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (searchTerm.trim()) params.append('search', searchTerm.trim());

            const res = await api.get(`/auth/users?${params}`);
            setUsers(res.data?.users || res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            showToast?.('error', err.response?.data?.message || 'Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, searchTerm, showToast]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchUsers]);

    // ────────────────────────────────────────────
    //  Fetch projects (for assignment section)
    // ────────────────────────────────────────────
    const fetchProjects = useCallback(async () => {
        try {
            setProjectsLoading(true);
            const res = await api.get('/projects');
            setProjects(res.data?.projects || res.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setProjects([]);
        } finally {
            setProjectsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // ────────────────────────────────────────────
    //  Role change handlers
    // ────────────────────────────────────────────
    const openRoleDialog = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setRoleDialogOpen(true);
    };

    const handleRoleChange = async () => {
        if (!selectedUser || !newRole || newRole === selectedUser.role) {
            setRoleDialogOpen(false);
            return;
        }

        try {
            setRoleChangeLoading(true);
            await api.patch(`/users/${selectedUser._id}/role`, { role: newRole });
            showToast?.('success', `Role updated to "${newRole}" for ${selectedUser.firstName || selectedUser.email}`);
            setRoleDialogOpen(false);
            setSelectedUser(null);
            setNewRole('');
            await fetchUsers();
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to update role');
        } finally {
            setRoleChangeLoading(false);
        }
    };

    // ────────────────────────────────────────────
    //  Project assignment handlers
    // ────────────────────────────────────────────
    const handleAssignAdviser = async () => {
        if (!selectedProjectId || !selectedAdviserId) {
            showToast?.('error', 'Please select both a project and an adviser');
            return;
        }

        try {
            setAssignLoading(true);
            await api.post(`/projects/${selectedProjectId}/assign-adviser`, {
                adviserId: selectedAdviserId,
            });
            showToast?.('success', 'Adviser assigned successfully');
            setSelectedAdviserId('');
            await fetchProjects();
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to assign adviser');
        } finally {
            setAssignLoading(false);
        }
    };

    const handleAssignPanelists = async () => {
        if (!selectedProjectId || selectedPanelistIds.length === 0) {
            showToast?.('error', 'Please select a project and at least one panelist');
            return;
        }

        try {
            setAssignLoading(true);
            await api.post(`/projects/${selectedProjectId}/assign-panelists`, {
                panelistIds: selectedPanelistIds,
            });
            showToast?.('success', 'Panelists assigned successfully');
            setSelectedPanelistIds([]);
            await fetchProjects();
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to assign panelists');
        } finally {
            setAssignLoading(false);
        }
    };

    const togglePanelist = (userId) => {
        setSelectedPanelistIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    // ────────────────────────────────────────────
    //  Derived data
    // ────────────────────────────────────────────
    const advisers = users.filter((u) => u.role === 'adviser');
    const panelists = users.filter((u) => u.role === 'panelist');

    const getUserDisplayName = (user) => {
        if (user.firstName) {
            return `${user.firstName} ${user.lastName || ''}`.trim();
        }
        return user.email || 'Unknown';
    };

    // ────────────────────────────────────────────
    //  Render: loading state
    // ────────────────────────────────────────────
    if (loading && users.length === 0) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Loading users...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="tw-space-y-6">
            {/* ─── User List Section ─── */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <CardTitle className="tw-flex tw-items-center tw-gap-2">
                        <Users className="tw-w-5 tw-h-5" />
                        User Management
                    </CardTitle>

                    {/* Search bar */}
                    <div className="tw-mt-4 tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
                        <div className="tw-relative tw-flex-1">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or email..."
                                className="tw-w-full tw-pl-9 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Role filter buttons */}
                    <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-3">
                        <button
                            onClick={() => setRoleFilter('all')}
                            className={`tw-px-3 tw-py-1.5 tw-text-sm tw-rounded-md tw-capitalize tw-transition-colors tw-font-medium ${
                                roleFilter === 'all'
                                    ? 'tw-bg-indigo-500 tw-text-white'
                                    : 'tw-text-muted-foreground hover:tw-bg-muted'
                            }`}
                        >
                            All
                        </button>
                        {ROLES.map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`tw-px-3 tw-py-1.5 tw-text-sm tw-rounded-md tw-capitalize tw-transition-colors tw-font-medium ${
                                    roleFilter === role
                                        ? 'tw-bg-indigo-500 tw-text-white'
                                        : 'tw-text-muted-foreground hover:tw-bg-muted'
                                }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="tw-p-0">
                    {loading ? (
                        <div className="tw-p-8 tw-flex tw-justify-center tw-items-center tw-gap-2">
                            <Loader2 className="tw-h-5 tw-w-5 tw-animate-spin tw-text-indigo-600" />
                            <span className="tw-text-muted-foreground">Refreshing...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="tw-p-8 tw-text-center tw-text-muted-foreground">
                            <Users className="tw-w-12 tw-h-12 tw-mx-auto tw-mb-3 tw-opacity-30" />
                            <p className="tw-text-lg tw-font-medium">No users found</p>
                            <p className="tw-text-sm tw-mt-1">
                                {searchTerm || roleFilter !== 'all'
                                    ? 'Try adjusting your search or filter.'
                                    : 'No users have been registered yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="tw-overflow-x-auto">
                            <table className="tw-w-full tw-text-sm">
                                <thead>
                                    <tr className="tw-border-b tw-border-border tw-bg-muted/50">
                                        <th className="tw-text-left tw-px-4 tw-py-3 tw-font-medium tw-text-muted-foreground">
                                            Name
                                        </th>
                                        <th className="tw-text-left tw-px-4 tw-py-3 tw-font-medium tw-text-muted-foreground">
                                            Email
                                        </th>
                                        <th className="tw-text-left tw-px-4 tw-py-3 tw-font-medium tw-text-muted-foreground">
                                            Role
                                        </th>
                                        <th className="tw-text-right tw-px-4 tw-py-3 tw-font-medium tw-text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="tw-divide-y tw-divide-border">
                                    {users.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="tw-transition-colors hover:tw-bg-muted/50"
                                        >
                                            <td className="tw-px-4 tw-py-3 tw-text-foreground tw-font-medium">
                                                {getUserDisplayName(user)}
                                            </td>
                                            <td className="tw-px-4 tw-py-3 tw-text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="tw-px-4 tw-py-3">
                                                <Badge variant={ROLE_BADGE_VARIANT[user.role] || 'secondary'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="tw-px-4 tw-py-3 tw-text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openRoleDialog(user)}
                                                >
                                                    <Shield className="tw-w-4 tw-h-4 tw-mr-1" />
                                                    Change Role
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Assign to Project Section ─── */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <CardTitle className="tw-flex tw-items-center tw-gap-2">
                        <Shield className="tw-w-5 tw-h-5" />
                        Assign to Project
                    </CardTitle>
                </CardHeader>

                <CardContent className="tw-pt-6">
                    {projectsLoading ? (
                        <div className="tw-flex tw-justify-center tw-items-center tw-gap-2 tw-py-6">
                            <Loader2 className="tw-h-5 tw-w-5 tw-animate-spin tw-text-indigo-600" />
                            <span className="tw-text-muted-foreground">Loading projects...</span>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                            <p className="tw-font-medium">No projects available</p>
                            <p className="tw-text-sm tw-mt-1">Projects will appear here once they are created.</p>
                        </div>
                    ) : (
                        <div className="tw-space-y-6">
                            {/* Project selector */}
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-2">
                                    Select Project
                                </label>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => {
                                        setSelectedProjectId(e.target.value);
                                        setSelectedAdviserId('');
                                        setSelectedPanelistIds([]);
                                    }}
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                >
                                    <option value="">-- Choose a project --</option>
                                    {projects.map((project) => (
                                        <option key={project._id} value={project._id}>
                                            {project.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedProjectId && (
                                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                                    {/* Assign Adviser */}
                                    <div className="tw-space-y-3">
                                        <h4 className="tw-font-medium tw-text-foreground">Assign Adviser</h4>
                                        {advisers.length === 0 ? (
                                            <p className="tw-text-sm tw-text-muted-foreground">
                                                No advisers found. Change a user's role to "adviser" first.
                                            </p>
                                        ) : (
                                            <>
                                                <select
                                                    value={selectedAdviserId}
                                                    onChange={(e) => setSelectedAdviserId(e.target.value)}
                                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                >
                                                    <option value="">-- Select an adviser --</option>
                                                    {advisers.map((adviser) => (
                                                        <option key={adviser._id} value={adviser._id}>
                                                            {getUserDisplayName(adviser)} ({adviser.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                <Button
                                                    onClick={handleAssignAdviser}
                                                    disabled={!selectedAdviserId || assignLoading}
                                                    className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                                >
                                                    {assignLoading ? (
                                                        <>
                                                            <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                                            Assigning...
                                                        </>
                                                    ) : (
                                                        'Assign Adviser'
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {/* Assign Panelists */}
                                    <div className="tw-space-y-3">
                                        <h4 className="tw-font-medium tw-text-foreground">Assign Panelists</h4>
                                        {panelists.length === 0 ? (
                                            <p className="tw-text-sm tw-text-muted-foreground">
                                                No panelists found. Change a user's role to "panelist" first.
                                            </p>
                                        ) : (
                                            <>
                                                <div className="tw-space-y-2 tw-max-h-48 tw-overflow-y-auto tw-border tw-border-border tw-rounded tw-p-2 tw-bg-background">
                                                    {panelists.map((panelist) => (
                                                        <label
                                                            key={panelist._id}
                                                            className="tw-flex tw-items-center tw-gap-2 tw-p-2 tw-rounded tw-cursor-pointer hover:tw-bg-muted tw-transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPanelistIds.includes(panelist._id)}
                                                                onChange={() => togglePanelist(panelist._id)}
                                                                className="tw-rounded tw-border-border tw-text-indigo-600 focus:tw-ring-indigo-500"
                                                            />
                                                            <span className="tw-text-sm tw-text-foreground">
                                                                {getUserDisplayName(panelist)}
                                                            </span>
                                                            <span className="tw-text-xs tw-text-muted-foreground">
                                                                ({panelist.email})
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {selectedPanelistIds.length > 0 && (
                                                    <p className="tw-text-xs tw-text-muted-foreground">
                                                        {selectedPanelistIds.length} panelist{selectedPanelistIds.length !== 1 ? 's' : ''} selected
                                                    </p>
                                                )}
                                                <Button
                                                    onClick={handleAssignPanelists}
                                                    disabled={selectedPanelistIds.length === 0 || assignLoading}
                                                    className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                                >
                                                    {assignLoading ? (
                                                        <>
                                                            <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                                            Assigning...
                                                        </>
                                                    ) : (
                                                        'Assign Panelists'
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ─── Change Role Dialog ─── */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent className="tw-bg-card tw-border-border sm:tw-max-w-md">
                    <DialogHeader>
                        <DialogTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                            <Shield className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                            Change User Role
                        </DialogTitle>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="tw-py-4 tw-space-y-4">
                            <div className="tw-bg-muted tw-rounded-lg tw-p-3">
                                <p className="tw-font-medium tw-text-foreground">
                                    {getUserDisplayName(selectedUser)}
                                </p>
                                <p className="tw-text-sm tw-text-muted-foreground">
                                    {selectedUser.email}
                                </p>
                                <div className="tw-mt-2">
                                    <span className="tw-text-xs tw-text-muted-foreground tw-mr-2">Current role:</span>
                                    <Badge variant={ROLE_BADGE_VARIANT[selectedUser.role] || 'secondary'}>
                                        {selectedUser.role}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-2">
                                    New Role
                                </label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                    disabled={roleChangeLoading}
                                >
                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {newRole !== selectedUser.role && (
                                <div className="tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border tw-border-amber-500/30 tw-rounded-lg tw-p-3">
                                    <p className="tw-text-sm tw-text-amber-700 dark:tw-text-amber-300">
                                        This will change the role from{' '}
                                        <span className="tw-font-semibold">{selectedUser.role}</span> to{' '}
                                        <span className="tw-font-semibold">{newRole}</span>. The user's
                                        permissions will be updated immediately.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="tw-gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setRoleDialogOpen(false)}
                            disabled={roleChangeLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRoleChange}
                            disabled={roleChangeLoading || newRole === selectedUser?.role}
                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                        >
                            {roleChangeLoading ? (
                                <>
                                    <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Role'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserManagement;

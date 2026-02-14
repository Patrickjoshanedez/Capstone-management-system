import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import { Users, UserPlus, Lock, Mail, Check, X, Crown, Loader2 } from 'lucide-react';

const TeamFormation = ({ user, showToast }) => {
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [creating, setCreating] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [locking, setLocking] = useState(false);
    const [respondingTo, setRespondingTo] = useState(null);

    // ─── Fetch current team ───────────────────────────────────────────
    const fetchTeam = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/teams/me');
            if (res.data?.success) {
                setTeam(res.data.data ?? res.data.team ?? null);
            } else {
                setTeam(null);
            }
        } catch (err) {
            // 404 means the student has no team yet — that is expected
            if (err.response?.status !== 404) {
                console.error('Fetch team error:', err);
            }
            setTeam(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Fetch pending invitations addressed to this user ─────────────
    const fetchInvitations = useCallback(async () => {
        try {
            const res = await api.get('/teams/me/invitations');
            if (res.data?.success) {
                setPendingInvitations(res.data.data ?? res.data.invitations ?? []);
            }
        } catch (err) {
            // Silently ignore — invitations panel is supplementary
            setPendingInvitations([]);
        }
    }, []);

    useEffect(() => {
        fetchTeam();
        fetchInvitations();
    }, [fetchTeam, fetchInvitations]);

    // ─── Create a new team ────────────────────────────────────────────
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        const trimmed = teamName.trim();
        if (!trimmed) {
            showToast?.('error', 'Please enter a team name');
            return;
        }

        try {
            setCreating(true);
            const res = await api.post('/teams', { name: trimmed });
            if (res.data?.success) {
                setTeam(res.data.data ?? res.data.team);
                setTeamName('');
                showToast?.('success', 'Team created successfully');
            }
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to create team');
        } finally {
            setCreating(false);
        }
    };

    // ─── Invite a member by email ─────────────────────────────────────
    const handleInvite = async (e) => {
        e.preventDefault();
        const trimmed = inviteEmail.trim();
        if (!trimmed) {
            showToast?.('error', 'Please enter an email address');
            return;
        }
        if (!team?._id) return;

        try {
            setInviting(true);
            const res = await api.post(`/teams/${team._id}/invite`, { email: trimmed });
            if (res.data?.success) {
                // Refresh team to pick up the new pending invitation
                await fetchTeam();
                setInviteEmail('');
                showToast?.('success', `Invitation sent to ${trimmed}`);
            }
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setInviting(false);
        }
    };

    // ─── Respond to an invitation (accept / decline) ──────────────────
    const handleRespondInvitation = async (teamId, invitationId, response) => {
        try {
            setRespondingTo(invitationId);
            const res = await api.patch(`/teams/${teamId}/invitations/${invitationId}`, { response });
            if (res.data?.success) {
                showToast?.('success', `Invitation ${response}`);
                // Refresh both team and invitations
                await Promise.all([fetchTeam(), fetchInvitations()]);
            }
        } catch (err) {
            showToast?.('error', err.response?.data?.message || `Failed to ${response} invitation`);
        } finally {
            setRespondingTo(null);
        }
    };

    // ─── Lock the team (leader only) ──────────────────────────────────
    const handleLockTeam = async () => {
        if (!team?._id) return;
        try {
            setLocking(true);
            const res = await api.patch(`/teams/${team._id}/lock`);
            if (res.data?.success) {
                setTeam(res.data.data ?? res.data.team ?? { ...team, status: 'locked' });
                showToast?.('success', 'Team has been locked');
            }
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to lock team');
        } finally {
            setLocking(false);
        }
    };

    // ─── Helpers ──────────────────────────────────────────────────────
    const getFullName = (member) => {
        if (!member) return 'Unknown';
        return `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Unknown';
    };

    const isLeader = team?.leader === user?._id || team?.leader?._id === user?._id;

    const confirmedMembers = (team?.members || []).filter(
        (m) => m.status === 'accepted' || m.role === 'leader' || !m.status
    );

    const pendingSentInvitations = (team?.members || []).filter(
        (m) => m.status === 'pending'
    );

    // Also support team.invitations if the API returns them separately
    const sentInvitations = team?.invitations?.length
        ? team.invitations.filter((inv) => inv.status === 'pending')
        : pendingSentInvitations;

    // ─── Loading state ────────────────────────────────────────────────
    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Loading team information...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  LOCKED TEAM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (team && team.status === 'locked') {
        return (
            <div className="tw-space-y-6">
                <Card>
                    <CardHeader>
                        <div className="tw-flex tw-items-center tw-justify-between">
                            <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                <Users className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                                {team.name}
                            </CardTitle>
                            <Badge className="tw-bg-emerald-600 tw-text-white tw-border-transparent">
                                <Lock className="tw-w-3 tw-h-3 tw-mr-1" />
                                Locked
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="tw-space-y-4">
                        {/* Members list */}
                        <div className="tw-space-y-2">
                            <h4 className="tw-text-sm tw-font-medium tw-text-foreground">Members</h4>
                            <ul className="tw-space-y-2">
                                {confirmedMembers.map((member, idx) => {
                                    const memberId = member.user?._id || member.user || member._id;
                                    const memberIsLeader =
                                        memberId === (team.leader?._id || team.leader) ||
                                        member.role === 'leader';
                                    return (
                                        <li
                                            key={memberId || idx}
                                            className="tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-border tw-bg-background tw-px-4 tw-py-3"
                                        >
                                            <div className="tw-flex tw-items-center tw-gap-3">
                                                <div className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-bg-indigo-100 dark:tw-bg-indigo-900/30 tw-text-indigo-600 dark:tw-text-indigo-400 tw-text-sm tw-font-semibold">
                                                    {getFullName(member.user || member).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="tw-text-sm tw-font-medium tw-text-foreground">
                                                        {getFullName(member.user || member)}
                                                    </span>
                                                    {(member.user?.email || member.email) && (
                                                        <p className="tw-text-xs tw-text-muted-foreground tw-flex tw-items-center tw-gap-1">
                                                            <Mail className="tw-w-3 tw-h-3" />
                                                            {member.user?.email || member.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant={memberIsLeader ? 'default' : 'secondary'}>
                                                {memberIsLeader && <Crown className="tw-w-3 tw-h-3 tw-mr-1" />}
                                                {memberIsLeader ? 'Leader' : 'Member'}
                                            </Badge>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Ready message */}
                        <div className="tw-rounded-lg tw-border tw-border-emerald-200 dark:tw-border-emerald-800 tw-bg-emerald-50 dark:tw-bg-emerald-900/20 tw-p-4">
                            <div className="tw-flex tw-items-center tw-gap-2">
                                <Check className="tw-w-5 tw-h-5 tw-text-emerald-600 dark:tw-text-emerald-400" />
                                <p className="tw-text-sm tw-font-medium tw-text-emerald-700 dark:tw-text-emerald-300">
                                    Your team is ready! You can now create a project proposal.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  FORMING TEAM
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (team && team.status === 'forming') {
        return (
            <div className="tw-space-y-6">
                {/* Team header */}
                <Card>
                    <CardHeader>
                        <div className="tw-flex tw-items-center tw-justify-between">
                            <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                <Users className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                                {team.name}
                            </CardTitle>
                            <Badge variant="secondary">
                                <Loader2 className="tw-w-3 tw-h-3 tw-mr-1 tw-animate-spin" />
                                Forming
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="tw-space-y-6">
                        {/* Members list */}
                        <div className="tw-space-y-2">
                            <h4 className="tw-text-sm tw-font-medium tw-text-foreground">
                                Team Members ({confirmedMembers.length})
                            </h4>
                            <ul className="tw-space-y-2">
                                {confirmedMembers.map((member, idx) => {
                                    const memberId = member.user?._id || member.user || member._id;
                                    const memberIsLeader =
                                        memberId === (team.leader?._id || team.leader) ||
                                        member.role === 'leader';
                                    return (
                                        <li
                                            key={memberId || idx}
                                            className="tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-border tw-bg-background tw-px-4 tw-py-3"
                                        >
                                            <div className="tw-flex tw-items-center tw-gap-3">
                                                <div className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-bg-indigo-100 dark:tw-bg-indigo-900/30 tw-text-indigo-600 dark:tw-text-indigo-400 tw-text-sm tw-font-semibold">
                                                    {getFullName(member.user || member).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="tw-text-sm tw-font-medium tw-text-foreground">
                                                        {getFullName(member.user || member)}
                                                    </span>
                                                    {(member.user?.email || member.email) && (
                                                        <p className="tw-text-xs tw-text-muted-foreground tw-flex tw-items-center tw-gap-1">
                                                            <Mail className="tw-w-3 tw-h-3" />
                                                            {member.user?.email || member.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant={memberIsLeader ? 'default' : 'secondary'}>
                                                {memberIsLeader && <Crown className="tw-w-3 tw-h-3 tw-mr-1" />}
                                                {memberIsLeader ? 'Leader' : 'Member'}
                                            </Badge>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* ── Leader-only controls ───────────────────────── */}
                        {isLeader ? (
                            <>
                                {/* Invite member form */}
                                <div className="tw-space-y-2">
                                    <h4 className="tw-text-sm tw-font-medium tw-text-foreground tw-flex tw-items-center tw-gap-2">
                                        <UserPlus className="tw-w-4 tw-h-4 tw-text-indigo-500" />
                                        Invite Member
                                    </h4>
                                    <form onSubmit={handleInvite} className="tw-flex tw-gap-2">
                                        <input
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            placeholder="Enter student email address"
                                            className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                            disabled={inviting}
                                        />
                                        <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
                                            {inviting ? (
                                                <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                            ) : (
                                                <UserPlus className="tw-w-4 tw-h-4 tw-mr-1" />
                                            )}
                                            Invite
                                        </Button>
                                    </form>
                                </div>

                                {/* Pending sent invitations */}
                                {sentInvitations.length > 0 && (
                                    <div className="tw-space-y-2">
                                        <h4 className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                                            Pending Invitations Sent
                                        </h4>
                                        <ul className="tw-space-y-2">
                                            {sentInvitations.map((inv, idx) => (
                                                <li
                                                    key={inv._id || idx}
                                                    className="tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-dashed tw-border-border tw-bg-muted/30 tw-px-4 tw-py-3"
                                                >
                                                    <div className="tw-flex tw-items-center tw-gap-3">
                                                        <div className="tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-bg-amber-100 dark:tw-bg-amber-900/30 tw-text-amber-600 dark:tw-text-amber-400 tw-text-sm tw-font-semibold">
                                                            <Mail className="tw-w-4 tw-h-4" />
                                                        </div>
                                                        <span className="tw-text-sm tw-text-muted-foreground">
                                                            {inv.user?.email || inv.email || getFullName(inv.user || inv)}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline">Pending</Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Lock team button */}
                                <div className="tw-border-t tw-border-border tw-pt-4">
                                    <div className="tw-flex tw-items-center tw-justify-between">
                                        <div>
                                            <h4 className="tw-text-sm tw-font-medium tw-text-foreground">
                                                Finalize Team
                                            </h4>
                                            <p className="tw-text-xs tw-text-muted-foreground tw-mt-0.5">
                                                Lock the team once all members have joined. Requires at least 2 members.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleLockTeam}
                                            disabled={locking || confirmedMembers.length < 2}
                                            className="tw-bg-emerald-600 hover:tw-bg-emerald-700 tw-text-white"
                                        >
                                            {locking ? (
                                                <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                            ) : (
                                                <Lock className="tw-w-4 tw-h-4 tw-mr-1" />
                                            )}
                                            Lock Team
                                        </Button>
                                    </div>
                                    {confirmedMembers.length < 2 && (
                                        <p className="tw-text-xs tw-text-amber-600 dark:tw-text-amber-400 tw-mt-2">
                                            You need at least 2 confirmed members to lock the team.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Non-leader message */
                            <div className="tw-rounded-lg tw-border tw-border-amber-200 dark:tw-border-amber-800 tw-bg-amber-50 dark:tw-bg-amber-900/20 tw-p-4">
                                <p className="tw-text-sm tw-text-amber-700 dark:tw-text-amber-300">
                                    Waiting for the team leader to finalize the team. You will be notified once the
                                    team is locked.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  NO TEAM — create one or respond to invitations
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    return (
        <div className="tw-space-y-6">
            {/* Create a Team */}
            <Card>
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <Users className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        Create a Team
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="tw-text-sm tw-text-muted-foreground tw-mb-4">
                        Start by creating a team. You will become the team leader and can invite other students
                        to join.
                    </p>
                    <form onSubmit={handleCreateTeam} className="tw-flex tw-gap-2">
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter team name"
                            className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            disabled={creating}
                        />
                        <Button type="submit" disabled={creating || !teamName.trim()}>
                            {creating ? (
                                <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                            ) : (
                                <Users className="tw-w-4 tw-h-4 tw-mr-1" />
                            )}
                            {creating ? 'Creating...' : 'Create Team'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Pending Invitations received */}
            <Card>
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <Mail className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        Pending Invitations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingInvitations.length === 0 ? (
                        <div className="tw-text-center tw-py-6">
                            <Mail className="tw-w-10 tw-h-10 tw-mx-auto tw-mb-2 tw-text-muted-foreground tw-opacity-30" />
                            <p className="tw-text-sm tw-text-muted-foreground">
                                No pending invitations at this time.
                            </p>
                        </div>
                    ) : (
                        <ul className="tw-space-y-3">
                            {pendingInvitations.map((invitation) => {
                                const invTeamId = invitation.team?._id || invitation.team;
                                const invId = invitation._id;
                                const invTeamName = invitation.team?.name || invitation.teamName || 'Unknown Team';
                                const invitedBy =
                                    getFullName(invitation.invitedBy) !== 'Unknown'
                                        ? getFullName(invitation.invitedBy)
                                        : invitation.invitedByName || 'A team leader';
                                const isResponding = respondingTo === invId;

                                return (
                                    <li
                                        key={invId}
                                        className="tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-border tw-border-border tw-bg-background tw-px-4 tw-py-3"
                                    >
                                        <div>
                                            <p className="tw-text-sm tw-font-medium tw-text-foreground">
                                                {invTeamName}
                                            </p>
                                            <p className="tw-text-xs tw-text-muted-foreground">
                                                Invited by {invitedBy}
                                            </p>
                                        </div>
                                        <div className="tw-flex tw-gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleRespondInvitation(invTeamId, invId, 'accepted')
                                                }
                                                disabled={isResponding}
                                                className="tw-bg-emerald-600 hover:tw-bg-emerald-700 tw-text-white"
                                            >
                                                {isResponding ? (
                                                    <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="tw-w-4 tw-h-4 tw-mr-1" />
                                                        Accept
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    handleRespondInvitation(invTeamId, invId, 'declined')
                                                }
                                                disabled={isResponding}
                                            >
                                                {isResponding ? (
                                                    <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />
                                                ) : (
                                                    <>
                                                        <X className="tw-w-4 tw-h-4 tw-mr-1" />
                                                        Decline
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TeamFormation;

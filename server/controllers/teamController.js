const Team = require('../models/Team');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new team
// @route   POST /api/v1/teams
// @access  Private (Student)
exports.createTeam = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        // Check if student is already in an active team
        const existingTeam = await Team.findOne({
            'members.user': req.user._id,
            status: { $ne: 'dissolved' }
        });

        if (existingTeam) {
            return res.status(400).json({ message: 'You are already in an active team' });
        }

        const team = await Team.create({
            name,
            members: [{
                user: req.user._id,
                role: 'leader',
                joinedAt: new Date()
            }],
            createdBy: req.user._id
        });

        const populatedTeam = await Team.findById(team._id)
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('project');

        return res.status(201).json({ team: populatedTeam });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's team
// @route   GET /api/v1/teams/my-team
// @access  Private (Student)
exports.getMyTeam = async (req, res) => {
    try {
        const team = await Team.findOne({
            'members.user': req.user._id,
            status: { $ne: 'dissolved' }
        })
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('project');

        if (!team) {
            return res.status(404).json({ message: 'You are not in any team' });
        }

        return res.status(200).json({ team });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Invite a student to the team by email
// @route   POST /api/v1/teams/:teamId/invite
// @access  Private (Team Leader)
exports.inviteMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { email } = req.body;

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if the current user is the team leader
        const leader = team.members.find(
            (m) => m.user.toString() === req.user._id.toString() && m.role === 'leader'
        );

        if (!leader) {
            return res.status(403).json({ message: 'Only the team leader can invite members' });
        }

        // Team must be in forming status
        if (team.status !== 'forming') {
            return res.status(400).json({ message: 'Team is not accepting new members' });
        }

        // Check if team is at max size
        if (team.members.length >= team.maxSize) {
            return res.status(400).json({ message: 'Team is already at maximum capacity' });
        }

        // Find the user by email
        const invitee = await User.findOne({ email });

        if (!invitee) {
            return res.status(404).json({ message: 'User not found with that email' });
        }

        if (invitee.role !== 'student') {
            return res.status(400).json({ message: 'Only students can be invited to a team' });
        }

        // Check if the invitee is already a member
        const isAlreadyMember = team.members.some(
            (m) => m.user.toString() === invitee._id.toString()
        );

        if (isAlreadyMember) {
            return res.status(400).json({ message: 'This user is already a team member' });
        }

        // Check if the invitee already has a pending invitation for this team
        const hasPendingInvitation = team.invitations.some(
            (inv) => inv.invitee.toString() === invitee._id.toString() && inv.status === 'pending'
        );

        if (hasPendingInvitation) {
            return res.status(400).json({ message: 'This user already has a pending invitation' });
        }

        // Check if the invitee is in another active team
        const inviteeActiveTeam = await Team.findOne({
            'members.user': invitee._id,
            status: { $ne: 'dissolved' }
        });

        if (inviteeActiveTeam) {
            return res.status(400).json({ message: 'This user is already in another active team' });
        }

        // Add to invitations array
        team.invitations.push({
            invitee: invitee._id,
            invitedBy: req.user._id,
            status: 'pending',
            sentAt: new Date()
        });

        await team.save();

        // Create a TEAM_INVITATION notification for the invitee
        const leaderName = `${req.user.firstName} ${req.user.lastName}`.trim();
        await Notification.create({
            recipient: invitee._id,
            type: 'TEAM_INVITATION',
            title: 'Team Invitation',
            message: `${leaderName} has invited you to join team "${team.name}".`,
            metadata: { actionBy: req.user._id }
        });

        const updatedTeam = await Team.findById(teamId)
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('project');

        return res.status(200).json({ team: updatedTeam });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Respond to a team invitation (accept or decline)
// @route   PUT /api/v1/teams/:teamId/invitations/:invitationId
// @access  Private (Invitee)
exports.respondToInvitation = async (req, res) => {
    try {
        const { teamId, invitationId } = req.params;
        const { response } = req.body;

        if (!['accepted', 'declined'].includes(response)) {
            return res.status(400).json({ message: 'Response must be "accepted" or "declined"' });
        }

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        const invitation = team.invitations.id(invitationId);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Must be the invitee
        if (invitation.invitee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not the invitee of this invitation' });
        }

        // Invitation must be pending
        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'This invitation has already been responded to' });
        }

        // Find the team leader for notification
        const leaderMember = team.members.find((m) => m.role === 'leader');

        if (response === 'accepted') {
            // Add user to members
            team.members.push({
                user: req.user._id,
                role: 'member',
                joinedAt: new Date()
            });

            invitation.status = 'accepted';
            invitation.respondedAt = new Date();

            await team.save();

            // Notify team leader
            if (leaderMember) {
                const inviteeName = `${req.user.firstName} ${req.user.lastName}`.trim();
                await Notification.create({
                    recipient: leaderMember.user,
                    type: 'TEAM_INVITATION_ACCEPTED',
                    title: 'Invitation Accepted',
                    message: `${inviteeName} has accepted the invitation to join team "${team.name}".`,
                    metadata: { actionBy: req.user._id }
                });
            }
        } else {
            invitation.status = 'declined';
            invitation.respondedAt = new Date();

            await team.save();

            // Notify team leader
            if (leaderMember) {
                const inviteeName = `${req.user.firstName} ${req.user.lastName}`.trim();
                await Notification.create({
                    recipient: leaderMember.user,
                    type: 'TEAM_INVITATION_DECLINED',
                    title: 'Invitation Declined',
                    message: `${inviteeName} has declined the invitation to join team "${team.name}".`,
                    metadata: { actionBy: req.user._id }
                });
            }
        }

        const updatedTeam = await Team.findById(teamId)
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('project');

        return res.status(200).json({ team: updatedTeam });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Lock the team (no more changes)
// @route   PUT /api/v1/teams/:teamId/lock
// @access  Private (Team Leader)
exports.lockTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Must be the team leader
        const leader = team.members.find(
            (m) => m.user.toString() === req.user._id.toString() && m.role === 'leader'
        );

        if (!leader) {
            return res.status(403).json({ message: 'Only the team leader can lock the team' });
        }

        // Team must be forming
        if (team.status !== 'forming') {
            return res.status(400).json({ message: 'Team can only be locked when in forming status' });
        }

        // Team must have at least 2 members (including leader)
        if (team.members.length < 2) {
            return res.status(400).json({ message: 'Team must have at least 2 members to be locked' });
        }

        // Set status to locked
        team.status = 'locked';

        // Cancel all pending invitations
        team.invitations.forEach((inv) => {
            if (inv.status === 'pending') {
                inv.status = 'declined';
                inv.respondedAt = new Date();
            }
        });

        await team.save();

        // Notify all members that the team is locked
        const memberIds = team.members.map((m) => m.user);
        const leaderName = `${req.user.firstName} ${req.user.lastName}`.trim();

        await Notification.createForRecipients(memberIds, {
            type: 'TEAM_LOCKED',
            title: 'Team Locked',
            message: `Team "${team.name}" has been locked by ${leaderName}. No further changes can be made.`,
            metadata: { actionBy: req.user._id }
        });

        const updatedTeam = await Team.findById(teamId)
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('project');

        return res.status(200).json({ team: updatedTeam });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    List all teams (coordinator view)
// @route   GET /api/v1/teams
// @access  Private (Coordinator)
exports.listTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('project')
            .sort({ createdAt: -1 });

        return res.status(200).json({ teams });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Coordinator adds an orphaned student to a team
// @route   POST /api/v1/teams/:teamId/adopt
// @access  Private (Coordinator)
exports.adoptOrphanedStudent = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { studentId } = req.body;

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        // Validate studentId is a real student user
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.role !== 'student') {
            return res.status(400).json({ message: 'User is not a student' });
        }

        // Verify student is not in any active team
        const studentActiveTeam = await Team.findOne({
            'members.user': student._id,
            status: { $ne: 'dissolved' }
        });

        if (studentActiveTeam) {
            return res.status(400).json({ message: 'Student is already in an active team' });
        }

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Team must be forming or locked
        if (!['forming', 'locked'].includes(team.status)) {
            return res.status(400).json({ message: 'Students can only be added to forming or locked teams' });
        }

        // Check team isn't at maxSize
        if (team.members.length >= team.maxSize) {
            return res.status(400).json({ message: 'Team is already at maximum capacity' });
        }

        // Add student as member
        team.members.push({
            user: student._id,
            role: 'member',
            joinedAt: new Date()
        });

        await team.save();

        // Notify all existing members and the adopted student
        const allRecipientIds = team.members.map((m) => m.user);
        const studentName = `${student.firstName} ${student.lastName}`.trim();
        const coordinatorName = `${req.user.firstName} ${req.user.lastName}`.trim();

        await Notification.createForRecipients(allRecipientIds, {
            type: 'TEAM_MEMBER_ADDED',
            title: 'New Team Member Added',
            message: `${studentName} has been added to team "${team.name}" by coordinator ${coordinatorName}.`,
            metadata: { actionBy: req.user._id }
        });

        const updatedTeam = await Team.findById(teamId)
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('project');

        return res.status(200).json({ team: updatedTeam });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending invitations for the current student
// @route   GET /api/v1/teams/my-invitations
// @access  Private (Student)
exports.getMyInvitations = async (req, res) => {
    try {
        const teams = await Team.find({
            'invitations.invitee': req.user._id,
            'invitations.status': 'pending'
        })
            .populate('members.user', 'firstName lastName email role')
            .populate('invitations.invitee', 'firstName lastName email role')
            .populate('invitations.invitedBy', 'firstName lastName email role');

        // Extract only the pending invitations for the current user
        const invitations = [];

        for (const team of teams) {
            for (const inv of team.invitations) {
                if (
                    inv.invitee &&
                    inv.invitee._id.toString() === req.user._id.toString() &&
                    inv.status === 'pending'
                ) {
                    invitations.push({
                        _id: inv._id,
                        teamId: team._id,
                        teamName: team.name,
                        invitedBy: inv.invitedBy,
                        sentAt: inv.sentAt,
                        status: inv.status
                    });
                }
            }
        }

        return res.status(200).json({ invitations });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

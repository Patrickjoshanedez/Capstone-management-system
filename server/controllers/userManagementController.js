const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    List all users with optional filters
 * @route   GET /api/v1/users
 * @access  Private (Coordinator only)
 */
exports.listUsers = async (req, res) => {
    try {
        // Extra safety check - coordinator only
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Access denied. Coordinator role required.' });
        }

        const { role, search } = req.query;
        const query = {};

        // Filter by role if provided
        if (role) {
            const validRoles = ['student', 'adviser', 'panelist', 'coordinator'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role filter. Valid roles: student, adviser, panelist, coordinator' });
            }
            query.role = role;
        }

        // Search by firstName, lastName, or email if provided
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex }
            ];
        }

        const users = await User.find(query)
            .select('_id firstName lastName email role createdAt')
            .sort({ createdAt: -1 });

        return res.status(200).json({ users });
    } catch (error) {
        console.error('List users error:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Coordinator assigns an adviser to a project
 * @route   POST /api/v1/projects/:projectId/assign-adviser
 * @access  Private (Coordinator only)
 */
exports.assignAdviser = async (req, res) => {
    try {
        // Extra safety check - coordinator only
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Access denied. Coordinator role required.' });
        }

        const { projectId } = req.params;
        const { adviserId } = req.body;

        if (!adviserId) {
            return res.status(400).json({ message: 'adviserId is required' });
        }

        // Validate that the adviser user exists and has the adviser role
        const adviserUser = await User.findById(adviserId);
        if (!adviserUser) {
            return res.status(404).json({ message: 'Adviser user not found' });
        }

        if (adviserUser.role !== 'adviser') {
            return res.status(400).json({ message: 'The specified user does not have the adviser role' });
        }

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Assign the adviser
        project.adviser = adviserId;
        await project.save();

        // Create a notification for the adviser
        await Notification.create({
            recipient: adviserId,
            type: 'ADVISER_ASSIGNED',
            title: 'Assigned as Adviser',
            message: `You have been assigned as adviser for the project "${project.title}".`,
            relatedProject: project._id,
            metadata: {
                actionBy: req.user._id
            }
        });

        // Return updated project with populated fields
        const updatedProject = await Project.findById(projectId)
            .populate('members', 'firstName lastName email role')
            .populate('adviser', 'firstName lastName email role')
            .populate('panelists', 'firstName lastName email role');

        return res.status(200).json({ project: updatedProject });
    } catch (error) {
        console.error('Assign adviser error:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Coordinator assigns panelists to a project
 * @route   POST /api/v1/projects/:projectId/assign-panelists
 * @access  Private (Coordinator only)
 */
exports.assignPanelists = async (req, res) => {
    try {
        // Extra safety check - coordinator only
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Access denied. Coordinator role required.' });
        }

        const { projectId } = req.params;
        const { panelistIds } = req.body;

        if (!panelistIds || !Array.isArray(panelistIds) || panelistIds.length === 0) {
            return res.status(400).json({ message: 'panelistIds must be a non-empty array' });
        }

        // Validate that each panelist user exists and has the panelist role
        const panelistUsers = await User.find({ _id: { $in: panelistIds } });

        if (panelistUsers.length !== panelistIds.length) {
            const foundIds = panelistUsers.map(u => u._id.toString());
            const missingIds = panelistIds.filter(id => !foundIds.includes(id));
            return res.status(404).json({
                message: 'One or more panelist users not found',
                missingIds
            });
        }

        const invalidPanelists = panelistUsers.filter(u => u.role !== 'panelist');
        if (invalidPanelists.length > 0) {
            return res.status(400).json({
                message: 'One or more users do not have the panelist role',
                invalidUsers: invalidPanelists.map(u => ({
                    _id: u._id,
                    name: `${u.firstName} ${u.lastName}`,
                    role: u.role
                }))
            });
        }

        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Set the panelists
        project.panelists = panelistIds;
        await project.save();

        // Create notifications for each panelist
        await Notification.createForRecipients(panelistIds, {
            type: 'PANELIST_ASSIGNED',
            title: 'Assigned as Panelist',
            message: `You have been assigned as a panelist for the project "${project.title}".`,
            relatedProject: project._id,
            metadata: {
                actionBy: req.user._id
            }
        });

        // Return updated project with populated fields
        const updatedProject = await Project.findById(projectId)
            .populate('members', 'firstName lastName email role')
            .populate('adviser', 'firstName lastName email role')
            .populate('panelists', 'firstName lastName email role');

        return res.status(200).json({ project: updatedProject });
    } catch (error) {
        console.error('Assign panelists error:', error);
        return res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Coordinator changes a user's role
 * @route   PATCH /api/v1/users/:userId/role
 * @access  Private (Coordinator only)
 */
exports.updateUserRole = async (req, res) => {
    try {
        // Extra safety check - coordinator only
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Access denied. Coordinator role required.' });
        }

        const { userId } = req.params;
        const { role } = req.body;

        // Validate the role
        const validRoles = ['student', 'adviser', 'panelist', 'coordinator'];
        if (!role || !validRoles.includes(role)) {
            return res.status(400).json({
                message: 'Invalid role. Valid roles: student, adviser, panelist, coordinator'
            });
        }

        // Prevent coordinator from changing their own role
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot change your own role' });
        }

        // Find and update the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        // Return updated user without sensitive fields
        const updatedUser = await User.findById(userId)
            .select('_id firstName lastName email role createdAt');

        return res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error('Update user role error:', error);
        return res.status(500).json({ message: error.message });
    }
};

const TitleChangeRequest = require('../models/TitleChangeRequest');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

const getIdString = (value) => {
    if (!value) return null;

    if (typeof value === 'string') return value;

    if (typeof value === 'object' && value._id) {
        return value._id.toString();
    }

    if (typeof value.toString === 'function') {
        return value.toString();
    }

    return null;
};

// @desc    Submit a title change request
// @route   POST /api/v1/projects/:projectId/title-change
// @access  Private (Student - project member only)
exports.requestTitleChange = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { proposedTitle, rationale } = req.body;

        if (!proposedTitle || !proposedTitle.trim()) {
            return res.status(400).json({ message: 'Proposed title is required' });
        }

        if (!rationale || !rationale.trim()) {
            return res.status(400).json({ message: 'Rationale is required' });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Validate the user is a project member
        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) &&
            project.members.some((member) => getIdString(member) === userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can request a title change' });
        }

        // Check if there is already a pending title change request for this project
        const existingPending = await TitleChangeRequest.findOne({
            project: projectId,
            status: 'pending'
        });

        if (existingPending) {
            return res.status(400).json({ message: 'A pending title change request already exists for this project' });
        }

        const titleChangeRequest = await TitleChangeRequest.create({
            project: projectId,
            requestedBy: req.user._id,
            currentTitle: project.title,
            proposedTitle: proposedTitle.trim(),
            rationale: rationale.trim()
        });

        // Notify coordinators about the title change request
        const User = require('../models/User');
        const coordinators = await User.find({ role: 'coordinator' }).select('_id');
        const coordinatorIds = coordinators.map((c) => c._id);

        if (coordinatorIds.length > 0) {
            const requesterName = `${req.user.firstName} ${req.user.lastName}`.trim();

            await Notification.createForRecipients(coordinatorIds, {
                type: 'TITLE_CHANGE_REQUESTED',
                title: 'Title Change Requested',
                message: `${requesterName} requested to change the title of "${project.title}" to "${proposedTitle.trim()}".`,
                relatedProject: project._id,
                metadata: {
                    actionBy: req.user._id
                }
            });
        }

        return res.status(201).json({ request: titleChangeRequest });
    } catch (error) {
        console.error('Request title change error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    List title change requests (coordinator view)
// @route   GET /api/v1/title-changes
// @access  Private (Coordinator)
exports.listTitleRequests = async (req, res) => {
    try {
        const { status } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        } else {
            query.status = 'pending';
        }

        const requests = await TitleChangeRequest.find(query)
            .populate('project', 'title')
            .populate('requestedBy', 'firstName lastName email')
            .populate('reviewedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ requests });
    } catch (error) {
        console.error('List title requests error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or reject a title change request
// @route   PUT /api/v1/title-changes/:requestId/review
// @access  Private (Coordinator)
exports.reviewTitleRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { decision, reviewComment } = req.body;

        if (!decision || !['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be either "approved" or "rejected"' });
        }

        const titleRequest = await TitleChangeRequest.findById(requestId);

        if (!titleRequest) {
            return res.status(404).json({ message: 'Title change request not found' });
        }

        if (titleRequest.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been reviewed' });
        }

        // Update the title change request
        titleRequest.status = decision;
        titleRequest.reviewedBy = req.user._id;
        titleRequest.reviewComment = reviewComment || '';
        titleRequest.reviewedAt = new Date();

        await titleRequest.save();

        // On approval, atomically update the project title
        if (decision === 'approved') {
            await Project.findByIdAndUpdate(
                titleRequest.project,
                { title: titleRequest.proposedTitle },
                { new: true }
            );
        }

        // Notify project members about the decision
        const project = await Project.findById(titleRequest.project).select('members title');

        if (project && Array.isArray(project.members) && project.members.length > 0) {
            const reviewerName = `${req.user.firstName} ${req.user.lastName}`.trim();
            const notificationType = decision === 'approved'
                ? 'TITLE_CHANGE_APPROVED'
                : 'TITLE_CHANGE_REJECTED';
            const notificationTitle = decision === 'approved'
                ? 'Title Change Approved'
                : 'Title Change Rejected';
            const notificationMessage = decision === 'approved'
                ? `Your title change request has been approved. The project title is now "${titleRequest.proposedTitle}".`
                : `Your title change request for "${titleRequest.proposedTitle}" has been rejected.${reviewComment ? ` Reason: ${reviewComment}` : ''}`;

            await Notification.createForRecipients(project.members, {
                type: notificationType,
                title: notificationTitle,
                message: notificationMessage,
                relatedProject: project._id,
                metadata: {
                    actionBy: req.user._id,
                    comment: reviewComment || ''
                }
            });
        }

        // Return the updated request with populated fields
        const updatedRequest = await TitleChangeRequest.findById(requestId)
            .populate('project', 'title')
            .populate('requestedBy', 'firstName lastName email')
            .populate('reviewedBy', 'firstName lastName email');

        return res.status(200).json({ request: updatedRequest });
    } catch (error) {
        console.error('Review title request error:', error);
        return res.status(500).json({ message: error.message });
    }
};

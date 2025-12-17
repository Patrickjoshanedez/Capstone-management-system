const Project = require('../models/Project');
const WorkflowLog = require('../models/WorkflowLog');
const User = require('../models/User');

const normalizeEmail = (email) => {
    return String(email || '').trim().toLowerCase();
};

const parseCommaSeparated = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }

    return [];
};

const canAccessProject = (project, user) => {
    if (!project || !user) return false;

    if (user.role === 'coordinator') return true;

    if (user.role === 'adviser') {
        return project.adviser && project.adviser.toString() === user._id.toString();
    }

    return Array.isArray(project.members) && project.members.some((m) => m.toString() === user._id.toString());
};

const createWorkflowLog = async ({ projectId, userId, fromStatus, toStatus }) => {
    await WorkflowLog.create({
        project: projectId,
        user: userId,
        action: 'STATUS_CHANGE',
        fromStatus,
        toStatus,
    });
};

exports.createProject = async (req, res) => {
    try {
        const { title, members, adviser, memberEmails, adviserEmail } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const requestedMembers = Array.isArray(members) ? members : [];

        const requestedMemberEmails = parseCommaSeparated(memberEmails).map(normalizeEmail);
        const uniqueMemberEmails = Array.from(new Set(requestedMemberEmails)).filter(Boolean);

        let memberIdsFromEmails = [];
        if (uniqueMemberEmails.length > 0) {
            const resolvedMembers = await User.find({ email: { $in: uniqueMemberEmails } }).select('_id email role');
            const emailToUser = new Map(resolvedMembers.map((user) => [normalizeEmail(user.email), user]));

            const missingEmails = uniqueMemberEmails.filter((email) => !emailToUser.has(email));
            const invalidRoleEmails = resolvedMembers
                .filter((user) => user.role !== 'student')
                .map((user) => normalizeEmail(user.email));

            if (missingEmails.length > 0 || invalidRoleEmails.length > 0) {
                return res.status(400).json({
                    message: 'Invalid member emails',
                    missingEmails,
                    invalidRoleEmails
                });
            }

            memberIdsFromEmails = resolvedMembers.map((user) => user._id.toString());
        }

        let resolvedAdviserId = adviser || undefined;
        const normalizedAdviserEmail = normalizeEmail(adviserEmail);
        if (normalizedAdviserEmail) {
            const adviserUser = await User.findOne({ email: normalizedAdviserEmail }).select('_id email role');
            if (!adviserUser) {
                return res.status(400).json({ message: 'Adviser email not found' });
            }

            if (adviserUser.role !== 'adviser') {
                return res.status(400).json({ message: 'Adviser email must belong to an adviser account' });
            }

            resolvedAdviserId = adviserUser._id;
        }

        const memberIds = Array.from(
            new Set([
                req.user._id.toString(),
                ...requestedMembers.map((m) => m.toString()),
                ...memberIdsFromEmails
            ])
        );

        const project = await Project.create({
            title,
            members: memberIds,
            adviser: resolvedAdviserId,
            status: 'PROPOSED'
        });

        return res.status(201).json({ project });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.listProjects = async (req, res) => {
    try {
        const { status } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        if (req.user.role === 'student') {
            query.members = req.user._id;
        }

        if (req.user.role === 'adviser') {
            query.adviser = req.user._id;
        }

        const projects = await Project.find(query)
            .populate('members', 'name email role')
            .populate('adviser', 'name email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({ projects });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('members', 'name email role')
            .populate('adviser', 'name email role');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        return res.status(200).json({ project });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status: nextStatus } = req.body;

        if (!nextStatus) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        const currentStatus = project.status;

        const isAllowedTransition = (() => {
            if (req.user.role === 'student') {
                return (
                    (currentStatus === 'PROPOSED' && nextStatus === 'ADVISER_REVIEW') ||
                    (currentStatus === 'REVISION_REQUIRED' && nextStatus === 'ADVISER_REVIEW')
                );
            }

            if (req.user.role === 'adviser') {
                const isAssigned = project.adviser && project.adviser.toString() === req.user._id.toString();
                if (!isAssigned) return false;

                if (currentStatus === 'ADVISER_REVIEW') {
                    return ['REVISION_REQUIRED', 'APPROVED_FOR_DEFENSE'].includes(nextStatus);
                }

                return currentStatus === 'APPROVED_FOR_DEFENSE' && nextStatus === 'FINAL_SUBMITTED';
            }

            if (req.user.role === 'coordinator') {
                return currentStatus === 'FINAL_SUBMITTED' && nextStatus === 'ARCHIVED';
            }

            return false;
        })();

        if (!isAllowedTransition) {
            return res.status(403).json({ message: 'Transition not allowed for your role or current status' });
        }

        project.status = nextStatus;
        await project.save();

        await createWorkflowLog({
            projectId: project._id,
            userId: req.user._id,
            fromStatus: currentStatus,
            toStatus: nextStatus,
        });

        return res.status(200).json({ project });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getProjectLogs = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to view this project logs' });
        }

        const logs = await WorkflowLog.find({ project: projectId })
            .populate('user', 'name email role')
            .sort({ timestamp: -1 });

        return res.status(200).json({ logs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

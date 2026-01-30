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

const canAccessProject = (project, user) => {
    if (!project || !user) return false;

    if (user.role === 'coordinator') return true;

    const userId = getIdString(user._id);
    if (!userId) return false;

    if (user.role === 'adviser') {
        const adviserId = getIdString(project.adviser);
        return Boolean(adviserId && adviserId === userId);
    }

    return Array.isArray(project.members) && project.members.some((member) => getIdString(member) === userId);
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
            .populate('members', 'firstName lastName email role')
            .populate('adviser', 'firstName lastName email role')
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
            .populate('members', 'firstName lastName email role')
            .populate('adviser', 'firstName lastName email role');

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
        const hasUploadedDocument = Boolean(project.document && project.document.fileId);

        if (
            req.user.role === 'student' &&
            nextStatus === 'ADVISER_REVIEW' &&
            !hasUploadedDocument
        ) {
            return res.status(400).json({ message: 'Please upload a proposal document before submitting for adviser review' });
        }

        const isAllowedTransition = (() => {
            if (req.user.role === 'student') {
                return (
                    (currentStatus === 'PROPOSED' && nextStatus === 'ADVISER_REVIEW') ||
                    (currentStatus === 'REVISION_REQUIRED' && nextStatus === 'ADVISER_REVIEW')
                );
            }

            if (req.user.role === 'adviser') {
                const isAssigned = getIdString(project.adviser) === getIdString(req.user._id);
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
            .populate('user', 'firstName lastName email role')
            .sort({ timestamp: -1 });

        return res.status(200).json({ logs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Check title similarity against existing projects
// @route   POST /api/v1/projects/check-title
// @access  Private (Student)
exports.checkTitleSimilarity = async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || title.trim().length < 5) {
            return res.status(400).json({ message: 'Title must be at least 5 characters' });
        }

        const normalizedTitle = title.trim().toLowerCase();

        // Get all existing project titles
        const existingProjects = await Project.find({}, 'title status members adviser')
            .populate('members', 'firstName lastName email')
            .populate('adviser', 'firstName lastName email');

        // Calculate similarity scores
        const results = [];

        for (const project of existingProjects) {
            const existingTitle = project.title.toLowerCase();
            const similarity = calculateSimilarity(normalizedTitle, existingTitle);

            if (similarity > 30) { // Only return if more than 30% similar
                results.push({
                    projectId: project._id,
                    title: project.title,
                    similarity: Math.round(similarity),
                    status: project.status,
                    isInDevelopment: !['ARCHIVED', 'FINAL_SUBMITTED'].includes(project.status),
                    members: project.members?.map(m => `${m.firstName} ${m.lastName}`.trim()) || [],
                });
            }
        }

        // Sort by similarity (highest first)
        results.sort((a, b) => b.similarity - a.similarity);

        // Determine overall result
        let resultType = 'unique'; // Default: title is unique
        let message = 'This capstone title has not yet existed. You may proceed with your project.';

        if (results.length > 0) {
            const topMatch = results[0];

            if (topMatch.similarity >= 85) {
                // Very high similarity
                if (topMatch.isInDevelopment) {
                    resultType = 'in_development';
                    message = 'This capstone is currently being developed by your seniors. Please choose a different title.';
                } else {
                    resultType = 'exists';
                    message = 'A capstone with a very similar title already exists. Please consider a different approach.';
                }
            } else if (topMatch.similarity >= 50) {
                resultType = 'similar';
                message = 'This capstone has some similarity with existing projects but is not entirely the same. You may proceed with modifications.';
            }
        }

        return res.status(200).json({
            title: title.trim(),
            resultType,
            message,
            similarProjects: results.slice(0, 5), // Return top 5 similar projects
        });
    } catch (error) {
        console.error('Check title similarity error:', error);
        return res.status(500).json({ message: 'Failed to check title similarity' });
    }
};

// Simple string similarity calculation (Levenshtein-based)
function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0 || len2 === 0) return 0;

    // Check for exact match
    if (str1 === str2) return 100;

    // Check for word overlap
    const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));

    let commonWords = 0;
    for (const word of words1) {
        if (words2.has(word)) commonWords++;
    }

    const totalUniqueWords = new Set([...words1, ...words2]).size;
    const wordSimilarity = totalUniqueWords > 0 ? (commonWords / totalUniqueWords) * 100 : 0;

    // Simple character-based similarity
    const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    const levenshteinSimilarity = ((maxLen - distance) / maxLen) * 100;

    // Combine both metrics (weighted average)
    return Math.max(wordSimilarity, levenshteinSimilarity);
}

// @desc    Update proposal details
// @route   PUT /api/v1/projects/:projectId/proposal
// @access  Private (Student - project member only)
exports.updateProposal = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { proposal } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only project members can update proposal
        const userId = getIdString(req.user._id);
        const isMember = project.members.some(member => getIdString(member) === userId);
        
        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can update the proposal' });
        }

        // Only allow updates in certain statuses
        if (!['PROPOSED', 'REVISION_REQUIRED'].includes(project.status)) {
            return res.status(400).json({ 
                message: 'Proposal can only be edited when status is PROPOSED or REVISION_REQUIRED' 
            });
        }

        // Update proposal fields
        if (proposal) {
            project.proposal = {
                ...project.proposal?.toObject?.() || {},
                ...proposal,
                methodology: {
                    ...project.proposal?.methodology?.toObject?.() || {},
                    ...proposal.methodology,
                    techStack: {
                        ...project.proposal?.methodology?.techStack?.toObject?.() || {},
                        ...proposal.methodology?.techStack
                    }
                },
                architecture: {
                    ...project.proposal?.architecture?.toObject?.() || {},
                    ...proposal.architecture
                },
                feasibility: {
                    ...project.proposal?.feasibility?.toObject?.() || {},
                    ...proposal.feasibility
                }
            };
        }

        await project.save();

        const updatedProject = await Project.findById(projectId)
            .populate('members', 'firstName lastName email role')
            .populate('adviser', 'firstName lastName email role');

        return res.status(200).json({ project: updatedProject });
    } catch (error) {
        console.error('Update proposal error:', error);
        return res.status(500).json({ message: error.message });
    }
};

const Project = require('../models/Project');
const WorkflowLog = require('../models/WorkflowLog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const Team = require('../models/Team');

// Initialize email service
emailService.initialize();

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

    if (user.role === 'panelist') {
        return Array.isArray(project.panelists) && project.panelists.some((p) => getIdString(p) === userId);
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

        // Check if student has a team and auto-populate members
        const team = await Team.findOne({
            'members.user': req.user._id,
            status: { $ne: 'dissolved' }
        });

        if (team && team.project) {
            return res.status(400).json({ message: 'Your team already has a project' });
        }

        let memberIds;
        if (team && team.status === 'locked') {
            // Use locked team members as project members
            memberIds = team.members.map((m) => m.user.toString());
        } else {
            // Fallback to manual member assignment (backward compatible)
            const requestedMembers = Array.isArray(members) ? members : [];

            const requestedMemberEmails = parseCommaSeparated(memberEmails).map(normalizeEmail);
            const uniqueMemberEmails = Array.from(new Set(requestedMemberEmails)).filter(Boolean);

            let memberIdsFromEmails = [];
            if (uniqueMemberEmails.length > 0) {
                const resolvedMembers = await User.find({ email: { $in: uniqueMemberEmails } }).select('_id email role');
                const emailToUser = new Map(resolvedMembers.map((u) => [normalizeEmail(u.email), u]));

                const missingEmails = uniqueMemberEmails.filter((email) => !emailToUser.has(email));
                const invalidRoleEmails = resolvedMembers
                    .filter((u) => u.role !== 'student')
                    .map((u) => normalizeEmail(u.email));

                if (missingEmails.length > 0 || invalidRoleEmails.length > 0) {
                    return res.status(400).json({
                        message: 'Invalid member emails',
                        missingEmails,
                        invalidRoleEmails
                    });
                }

                memberIdsFromEmails = resolvedMembers.map((u) => u._id.toString());
            }

            memberIds = Array.from(
                new Set([
                    req.user._id.toString(),
                    ...requestedMembers.map((m) => m.toString()),
                    ...memberIdsFromEmails
                ])
            );
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

        const project = await Project.create({
            title,
            members: memberIds,
            adviser: resolvedAdviserId,
            status: 'PROPOSED'
        });

        // Link project to team if team exists
        if (team) {
            team.project = project._id;
            await team.save();
        }

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

        if (req.user.role === 'panelist') {
            query.panelists = req.user._id;
        }

        const projects = await Project.find(query)
            .populate('members', 'firstName lastName email role')
            .populate('adviser', 'firstName lastName email role')
            .populate('panelists', 'firstName lastName email role')
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
            .populate('adviser', 'firstName lastName email role')
            .populate('panelists', 'firstName lastName email role');

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

// State machine: { currentStatus: { nextStatus: [allowedRoles] } }
const STATUS_TRANSITIONS = {
    // Legacy / backward-compatible transitions
    'PROPOSED': { 'ADVISER_REVIEW': ['student'] },
    'ADVISER_REVIEW': { 'REVISION_REQUIRED': ['adviser'], 'APPROVED_FOR_DEFENSE': ['adviser'] },
    'REVISION_REQUIRED': { 'ADVISER_REVIEW': ['student'] },
    'APPROVED_FOR_DEFENSE': { 'FINAL_SUBMITTED': ['adviser', 'panelist'] },
    'FINAL_SUBMITTED': { 'ARCHIVED': ['coordinator'] },
    // Capstone 1 (Proposal) lifecycle
    'TOPIC_SELECTION': { 'CHAPTER_1_DRAFT': ['student'] },
    'CHAPTER_1_DRAFT': { 'CHAPTER_1_REVIEW': ['student'] },
    'CHAPTER_1_REVIEW': { 'CHAPTER_1_APPROVED': ['adviser'], 'REVISION_REQUIRED': ['adviser'] },
    'CHAPTER_1_APPROVED': { 'CHAPTER_2_DRAFT': ['student'] },
    'CHAPTER_2_DRAFT': { 'CHAPTER_2_REVIEW': ['student'] },
    'CHAPTER_2_REVIEW': { 'CHAPTER_2_APPROVED': ['adviser'], 'REVISION_REQUIRED': ['adviser'] },
    'CHAPTER_2_APPROVED': { 'CHAPTER_3_DRAFT': ['student'] },
    'CHAPTER_3_DRAFT': { 'CHAPTER_3_REVIEW': ['student'] },
    'CHAPTER_3_REVIEW': { 'CHAPTER_3_APPROVED': ['adviser'], 'REVISION_REQUIRED': ['adviser'] },
    'CHAPTER_3_APPROVED': { 'PROPOSAL_CONSOLIDATION': ['student'] },
    'PROPOSAL_CONSOLIDATION': { 'PROPOSAL_DEFENSE': ['adviser', 'coordinator'] },
    'PROPOSAL_DEFENSE': { 'PROPOSAL_DEFENDED': ['adviser', 'panelist', 'coordinator'] },
    'PROPOSAL_DEFENDED': { 'CAPSTONE2_IN_PROGRESS': ['coordinator'] },
    // Capstone 2
    'CAPSTONE2_IN_PROGRESS': { 'CAPSTONE2_REVIEW': ['student'] },
    'CAPSTONE2_REVIEW': { 'CAPSTONE2_APPROVED': ['adviser'], 'CAPSTONE2_IN_PROGRESS': ['adviser'] },
    'CAPSTONE2_APPROVED': { 'CAPSTONE3_IN_PROGRESS': ['coordinator'] },
    // Capstone 3
    'CAPSTONE3_IN_PROGRESS': { 'CAPSTONE3_REVIEW': ['student'] },
    'CAPSTONE3_REVIEW': { 'CAPSTONE3_APPROVED': ['adviser'], 'CAPSTONE3_IN_PROGRESS': ['adviser'] },
    'CAPSTONE3_APPROVED': { 'FINAL_COMPILATION': ['coordinator'] },
    // Capstone 4
    'FINAL_COMPILATION': { 'PLAGIARISM_CHECK': ['coordinator'] },
    'PLAGIARISM_CHECK': { 'FINAL_DEFENSE': ['coordinator'] },
    'FINAL_DEFENSE': { 'FINAL_APPROVED': ['panelist', 'coordinator'] },
    'FINAL_APPROVED': { 'CREDENTIAL_UPLOAD': ['student'] },
    'CREDENTIAL_UPLOAD': { 'ARCHIVED': ['coordinator'] },
    // Special
    'PROJECT_RESET': { 'TOPIC_SELECTION': ['coordinator'] },
};

exports.updateProjectStatus = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status: nextStatus, comment } = req.body;

        if (!nextStatus) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const project = await Project.findById(projectId)
            .populate('members', 'firstName lastName email')
            .populate('adviser', 'firstName lastName email')
            .populate('panelists', 'firstName lastName email');

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

        // Use state machine to validate transition
        const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
        const allowedRoles = allowedTransitions && allowedTransitions[nextStatus];

        let isAllowedTransition = false;
        if (allowedRoles) {
            if (req.user.role === 'adviser') {
                const isAssigned = getIdString(project.adviser) === getIdString(req.user._id);
                isAllowedTransition = isAssigned && allowedRoles.includes('adviser');
            } else if (req.user.role === 'panelist') {
                const isAssigned = Array.isArray(project.panelists) &&
                    project.panelists.some((p) => getIdString(p) === getIdString(req.user._id));
                isAllowedTransition = isAssigned && allowedRoles.includes('panelist');
            } else {
                isAllowedTransition = allowedRoles.includes(req.user.role);
            }
        }

        if (!isAllowedTransition) {
            return res.status(403).json({ message: 'Transition not allowed for your role or current status' });
        }

        // Add to status history
        project.statusHistory.push({
            fromStatus: currentStatus,
            toStatus: nextStatus,
            changedBy: req.user._id,
            comment: comment || '',
            changedAt: new Date()
        });

        // Handle revision feedback
        if (nextStatus === 'REVISION_REQUIRED' && comment) {
            project.revisionFeedback = {
                requestedBy: req.user._id,
                feedback: comment,
                requestedAt: new Date()
            };
        } else if (nextStatus === 'ADVISER_REVIEW' && project.revisionFeedback?.requestedAt) {
            project.revisionFeedback.addressedAt = new Date();
        }

        project.status = nextStatus;
        await project.save();

        await createWorkflowLog({
            projectId: project._id,
            userId: req.user._id,
            fromStatus: currentStatus,
            toStatus: nextStatus,
        });

        // Send notifications and emails based on status change
        await sendStatusChangeNotifications({
            project,
            currentStatus,
            nextStatus,
            changedBy: req.user,
            comment
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
            .populate('adviser', 'firstName lastName email role')
            .populate('panelists', 'firstName lastName email role');

        return res.status(200).json({ project: updatedProject });
    } catch (error) {
        console.error('Update proposal error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// Helper function to send notifications on status change
async function sendStatusChangeNotifications({ project, currentStatus, nextStatus, changedBy, comment }) {
    try {
        const changerName = `${changedBy.firstName} ${changedBy.lastName}`.trim();
        const memberEmails = project.members?.map(m => m.email).filter(Boolean) || [];
        const memberIds = project.members?.map(m => m._id) || [];

        // Notification type mapping
        const notificationTypes = {
            'ADVISER_REVIEW': 'PROPOSAL_SUBMITTED',
            'REVISION_REQUIRED': 'REVISION_REQUESTED',
            'APPROVED_FOR_DEFENSE': 'PROPOSAL_APPROVED',
            'FINAL_SUBMITTED': 'STATUS_CHANGED',
            'ARCHIVED': 'PROJECT_ARCHIVED'
        };

        const notificationType = notificationTypes[nextStatus] || 'STATUS_CHANGED';

        // Create in-app notifications
        if (nextStatus === 'ADVISER_REVIEW' && project.adviser) {
            // Notify adviser when student submits for review
            await Notification.create({
                recipient: project.adviser._id,
                type: 'PROPOSAL_SUBMITTED',
                title: 'New Proposal Submitted',
                message: `${project.title} has been submitted for your review.`,
                relatedProject: project._id,
                metadata: { fromStatus: currentStatus, toStatus: nextStatus }
            });

            // Send email to adviser
            const studentNames = project.members?.map(m => `${m.firstName} ${m.lastName}`.trim()).join(', ') || 'Unknown';
            await emailService.sendProposalSubmitted(
                project.adviser.email,
                `${project.adviser.firstName} ${project.adviser.lastName}`.trim(),
                project.title,
                studentNames
            );
        } else if (nextStatus === 'REVISION_REQUIRED') {
            // Notify all team members
            await Notification.createForRecipients(memberIds, {
                type: 'REVISION_REQUESTED',
                title: 'Revision Required',
                message: comment || `Your proposal "${project.title}" requires revisions.`,
                relatedProject: project._id,
                metadata: { comment, reviewerName: changerName }
            });

            // Send email to team
            await emailService.sendRevisionRequested(
                memberEmails,
                'Team',
                project.title,
                comment,
                changerName
            );
        } else if (['APPROVED_FOR_DEFENSE', 'FINAL_SUBMITTED', 'ARCHIVED'].includes(nextStatus)) {
            // Notify team members of approval/completion
            await Notification.createForRecipients(memberIds, {
                type: notificationType,
                title: nextStatus === 'APPROVED_FOR_DEFENSE' ? 'Proposal Approved!' : 'Status Updated',
                message: `Your project "${project.title}" status changed to ${nextStatus.replace(/_/g, ' ')}.`,
                relatedProject: project._id,
                metadata: { fromStatus: currentStatus, toStatus: nextStatus }
            });

            // Send approval email
            if (nextStatus === 'APPROVED_FOR_DEFENSE') {
                await emailService.sendProposalApproved(
                    memberEmails,
                    project.title,
                    changerName,
                    nextStatus
                );
            }
        }
    } catch (error) {
        console.error('Error sending status change notifications:', error);
        // Don't throw - notifications shouldn't break the main flow
    }
}

// @desc    Add comment to project
// @route   POST /api/v1/projects/:projectId/comments
// @access  Private (Adviser/Coordinator)
exports.addComment = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { content, section = 'general' } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const project = await Project.findById(projectId)
            .populate('members', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to comment on this project' });
        }

        // Add comment
        project.comments.push({
            author: req.user._id,
            content: content.trim(),
            section,
            createdAt: new Date()
        });

        await project.save();

        // Create notifications for team members
        const memberIds = project.members.map(m => m._id);
        const commenterName = `${req.user.firstName} ${req.user.lastName}`.trim();

        await Notification.createForRecipients(memberIds, {
            type: 'COMMENT_ADDED',
            title: 'New Comment',
            message: `${commenterName} commented on "${project.title}": "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
            relatedProject: project._id,
            metadata: { section, commenterName }
        });

        // Get populated project with comments
        const updatedProject = await Project.findById(projectId)
            .populate('members', 'firstName lastName email role')
            .populate('adviser', 'firstName lastName email role')
            .populate('panelists', 'firstName lastName email role')
            .populate('comments.author', 'firstName lastName email role');

        return res.status(201).json({ 
            message: 'Comment added successfully',
            comment: updatedProject.comments[updatedProject.comments.length - 1]
        });
    } catch (error) {
        console.error('Add comment error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get project comments
// @route   GET /api/v1/projects/:projectId/comments
// @access  Private (Student/Adviser/Coordinator)
exports.getComments = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { section } = req.query;

        const project = await Project.findById(projectId)
            .populate('comments.author', 'firstName lastName email role');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to view comments' });
        }

        let comments = project.comments || [];

        // Filter by section if specified
        if (section) {
            comments = comments.filter(c => c.section === section);
        }

        // Sort by date (newest first)
        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json({ comments });
    } catch (error) {
        console.error('Get comments error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Reset a project (archive current, reset for same team)
// @route   POST /api/v1/projects/:projectId/reset
// @access  Private (Coordinator only)
exports.resetProject = async (req, res) => {
    try {
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only coordinators can reset projects' });
        }

        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate('members', 'firstName lastName email');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Archive the current project
        const previousStatus = project.status;
        project.status = 'ARCHIVED';
        project.statusHistory.push({
            fromStatus: previousStatus,
            toStatus: 'ARCHIVED',
            changedBy: req.user._id,
            comment: 'Project reset by coordinator',
            changedAt: new Date()
        });
        await project.save();

        // Create a new project for the same team
        const newProject = new Project({
            title: project.title + ' (Reset)',
            members: project.members.map(m => m._id || m),
            adviser: project.adviser,
            panelists: project.panelists,
            status: 'TOPIC_SELECTION',
            capstonePhase: 1,
            academicYear: project.academicYear,
        });
        await newProject.save();

        // Update team reference if exists
        const team = await Team.findOne({ project: project._id });
        if (team) {
            team.project = newProject._id;
            await team.save();
        }

        // Notify members
        const memberIds = project.members.map(m => m._id || m);
        try {
            await Notification.createForRecipients(memberIds, {
                type: 'STATUS_CHANGED',
                title: 'Project Reset',
                message: `Your project "${project.title}" has been reset by the coordinator. A new project has been created for your team.`,
                relatedProject: newProject._id,
                metadata: {
                    fromStatus: previousStatus,
                    toStatus: 'TOPIC_SELECTION',
                    actionBy: req.user._id
                }
            });
        } catch (notifErr) {
            console.error('Failed to send reset notification:', notifErr);
        }

        // Log the reset
        await WorkflowLog.create({
            project: newProject._id,
            user: req.user._id,
            fromStatus: 'PROJECT_RESET',
            toStatus: 'TOPIC_SELECTION',
            comment: `Reset from archived project ${project._id}`,
            timestamp: new Date()
        });

        return res.status(200).json({
            message: 'Project reset successfully',
            archivedProject: project._id,
            newProject
        });
    } catch (error) {
        console.error('Reset project error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Add a prototype to project
// @route   POST /api/v1/projects/:projectId/prototypes
// @access  Private (Student - project member)
exports.addPrototype = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type, title, description, fileId, webViewLink, externalUrl } = req.body;

        if (!type || !title) {
            return res.status(400).json({ message: 'Type and title are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const userId = getIdString(req.user._id);
        const isMember = project.members.some(member => getIdString(member) === userId);
        if (!isMember && req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only project members can add prototypes' });
        }

        project.prototypes.push({
            type,
            title: title.trim(),
            description: description?.trim() || '',
            fileId: fileId || '',
            webViewLink: webViewLink || '',
            externalUrl: externalUrl || '',
            uploadedBy: req.user._id,
            uploadedAt: new Date()
        });

        await project.save();

        return res.status(201).json({
            message: 'Prototype added successfully',
            prototype: project.prototypes[project.prototypes.length - 1]
        });
    } catch (error) {
        console.error('Add prototype error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get prototypes for a project
// @route   GET /api/v1/projects/:projectId/prototypes
// @access  Private (All roles with project access)
exports.getPrototypes = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('prototypes.uploadedBy', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        return res.status(200).json({ prototypes: project.prototypes || [] });
    } catch (error) {
        console.error('Get prototypes error:', error);
        return res.status(500).json({ message: error.message });
    }
};

const Project = require('../models/Project');
const Notification = require('../models/Notification');

const getIdString = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id.toString();
    if (typeof value.toString === 'function') return value.toString();
    return null;
};

const canAccessProject = (project, user) => {
    if (!project || !user) return false;
    if (user.role === 'coordinator') return true;

    const userId = getIdString(user._id);
    if (!userId) return false;

    if (user.role === 'adviser') {
        return Boolean(getIdString(project.adviser) === userId);
    }

    if (user.role === 'panelist') {
        return Array.isArray(project.panelists) && project.panelists.some((p) => getIdString(p) === userId);
    }

    return Array.isArray(project.members) && project.members.some((m) => getIdString(m) === userId);
};

// @desc    Create a new chapter for a project
// @route   POST /api/v1/projects/:projectId/chapters
// @access  Private (Student - project member)
exports.createChapter = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { capstonePhase, chapterNumber, title } = req.body;

        if (!capstonePhase || !chapterNumber || !title) {
            return res.status(400).json({ message: 'capstonePhase, chapterNumber, and title are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only project members can add chapters
        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) && project.members.some((m) => getIdString(m) === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can add chapters' });
        }

        // Check for duplicate chapter in same phase
        const duplicate = project.chapters.find(
            (ch) => ch.capstonePhase === Number(capstonePhase) && ch.chapterNumber === Number(chapterNumber)
        );
        if (duplicate) {
            return res.status(400).json({ message: `Chapter ${chapterNumber} already exists in Phase ${capstonePhase}` });
        }

        project.chapters.push({
            capstonePhase: Number(capstonePhase),
            chapterNumber: Number(chapterNumber),
            title: title.trim(),
            status: 'draft',
            versions: [],
            adviserFeedback: []
        });

        await project.save();

        const newChapter = project.chapters[project.chapters.length - 1];

        return res.status(201).json({ chapter: newChapter });
    } catch (error) {
        console.error('Create chapter error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get all chapters for a project
// @route   GET /api/v1/projects/:projectId/chapters
// @access  Private (Student/Adviser/Panelist/Coordinator)
exports.getChapters = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('chapters.versions.uploadedBy', 'firstName lastName email')
            .populate('chapters.adviserFeedback.author', 'firstName lastName email')
            .populate('chapters.approvedBy', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        // Transform chapters to include feedback in format frontend expects
        const chapters = project.chapters.map((ch) => {
            const chObj = ch.toObject();
            // Map adviserFeedback to the "feedback" field expected by frontend
            chObj.feedback = (chObj.adviserFeedback || []).map((fb) => ({
                _id: fb._id,
                reviewerName: fb.author
                    ? `${fb.author.firstName} ${fb.author.lastName || ''}`.trim()
                    : 'Adviser',
                comment: fb.content,
                date: fb.createdAt,
                createdAt: fb.createdAt,
                section: fb.section,
                decision: fb.resolved ? 'approved' : undefined
            }));
            return chObj;
        });

        return res.status(200).json({ chapters });
    } catch (error) {
        console.error('Get chapters error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a new version to a chapter
// @route   POST /api/v1/projects/:projectId/chapters/:chapterId/upload
// @access  Private (Student - project member)
exports.uploadChapterVersion = async (req, res) => {
    try {
        const { projectId, chapterId } = req.params;
        const { fileId, webViewLink } = req.body;

        if (!fileId || !webViewLink) {
            return res.status(400).json({ message: 'fileId and webViewLink are required' });
        }

        const project = await Project.findById(projectId)
            .populate('adviser', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) && project.members.some((m) => getIdString(m) === userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can upload chapter versions' });
        }

        const chapter = project.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        const versionNumber = (chapter.versions?.length || 0) + 1;

        chapter.versions.push({
            fileId: fileId.trim(),
            webViewLink: webViewLink.trim(),
            uploadedAt: new Date(),
            uploadedBy: req.user._id,
            versionNumber
        });

        // Auto-transition to submitted status when a version is uploaded
        if (chapter.status === 'draft' || chapter.status === 'revision_required') {
            chapter.status = 'submitted';
            chapter.submittedAt = new Date();
        }

        await project.save();

        // Notify adviser about submission
        if (project.adviser) {
            try {
                await Notification.create({
                    recipient: project.adviser._id,
                    type: 'CHAPTER_SUBMITTED',
                    title: 'Chapter Submitted for Review',
                    message: `Chapter ${chapter.chapterNumber} (${chapter.title}) of "${project.title}" has been submitted (v${versionNumber}).`,
                    relatedProject: project._id,
                    metadata: {
                        actionBy: req.user._id
                    }
                });
            } catch (notifErr) {
                console.error('Failed to create chapter notification:', notifErr);
            }
        }

        return res.status(200).json({ chapter });
    } catch (error) {
        console.error('Upload chapter version error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Review a chapter (approve or request revision)
// @route   PATCH /api/v1/projects/:projectId/chapters/:chapterId/review
// @access  Private (Adviser)
exports.reviewChapter = async (req, res) => {
    try {
        const { projectId, chapterId } = req.params;
        const { decision, feedback } = req.body;

        if (!decision || !['approved', 'revision_required'].includes(decision)) {
            return res.status(400).json({ message: 'Decision must be "approved" or "revision_required"' });
        }

        if (!feedback || !feedback.trim()) {
            return res.status(400).json({ message: 'Feedback is required' });
        }

        const project = await Project.findById(projectId)
            .populate('members', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only adviser or coordinator can review
        const userId = getIdString(req.user._id);
        const isAdviser = getIdString(project.adviser) === userId;
        const isCoordinator = req.user.role === 'coordinator';

        if (!isAdviser && !isCoordinator) {
            return res.status(403).json({ message: 'Only the assigned adviser or coordinator can review chapters' });
        }

        const chapter = project.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        if (chapter.status !== 'submitted' && chapter.status !== 'under_review') {
            return res.status(400).json({ message: 'Chapter must be in submitted or under_review status to be reviewed' });
        }

        // Add feedback
        chapter.adviserFeedback.push({
            content: feedback.trim(),
            author: req.user._id,
            createdAt: new Date(),
            section: req.body.section || '',
            resolved: decision === 'approved'
        });

        // Update chapter status
        if (decision === 'approved') {
            chapter.status = 'approved';
            chapter.approvedAt = new Date();
            chapter.approvedBy = req.user._id;
        } else {
            chapter.status = 'revision_required';
        }

        await project.save();

        // Notify team members
        const memberIds = project.members.map((m) => m._id);
        const reviewerName = `${req.user.firstName} ${req.user.lastName || ''}`.trim();
        const notifType = decision === 'approved' ? 'CHAPTER_APPROVED' : 'CHAPTER_REVISION_REQUIRED';
        const notifTitle = decision === 'approved'
            ? `Chapter ${chapter.chapterNumber} Approved`
            : `Chapter ${chapter.chapterNumber} Needs Revision`;
        const notifMessage = decision === 'approved'
            ? `${reviewerName} approved Chapter ${chapter.chapterNumber} (${chapter.title}) of "${project.title}".`
            : `${reviewerName} requested revision for Chapter ${chapter.chapterNumber} (${chapter.title}) of "${project.title}".`;

        try {
            await Notification.createForRecipients(memberIds, {
                type: notifType,
                title: notifTitle,
                message: notifMessage,
                relatedProject: project._id,
                metadata: {
                    comment: feedback.trim(),
                    actionBy: req.user._id
                }
            });
        } catch (notifErr) {
            console.error('Failed to create review notification:', notifErr);
        }

        // Check if all chapters in this phase are approved -> auto-unlock consolidation
        const phaseChapters = project.chapters.filter(
            (ch) => ch.capstonePhase === chapter.capstonePhase
        );
        const allApproved = phaseChapters.length > 0 && phaseChapters.every((ch) => ch.status === 'approved');

        if (allApproved) {
            try {
                await Notification.createForRecipients(memberIds, {
                    type: 'CONSOLIDATION_UNLOCKED',
                    title: 'Consolidation Unlocked',
                    message: `All chapters in Phase ${chapter.capstonePhase} of "${project.title}" have been approved. You may now proceed to consolidation.`,
                    relatedProject: project._id,
                    metadata: {}
                });
            } catch (notifErr) {
                console.error('Failed to create consolidation notification:', notifErr);
            }
        }

        return res.status(200).json({
            chapter,
            allPhaseChaptersApproved: allApproved
        });
    } catch (error) {
        console.error('Review chapter error:', error);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get version history for a chapter
// @route   GET /api/v1/projects/:projectId/chapters/:chapterId/versions
// @access  Private (Student/Adviser/Panelist/Coordinator)
exports.getChapterVersions = async (req, res) => {
    try {
        const { projectId, chapterId } = req.params;

        const project = await Project.findById(projectId)
            .populate('chapters.versions.uploadedBy', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!canAccessProject(project, req.user)) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        const chapter = project.chapters.id(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        // Return versions sorted newest first
        const versions = [...(chapter.versions || [])].sort(
            (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
        );

        return res.status(200).json({ versions });
    } catch (error) {
        console.error('Get chapter versions error:', error);
        return res.status(500).json({ message: error.message });
    }
};

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

// @desc    Upload full academic paper
// @route   PUT /api/v1/projects/:projectId/capstone4/academic-version
// @access  Private (Project member)
exports.uploadAcademicVersion = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { fileId, webViewLink } = req.body;

        if (!fileId || !webViewLink) {
            return res.status(400).json({ message: 'fileId and webViewLink are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify user is a project member
        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) &&
            project.members.some(member => getIdString(member) === userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can upload the academic version' });
        }

        if (!project.capstone4) {
            project.capstone4 = {};
        }

        project.capstone4.academicVersion = {
            fileId,
            webViewLink,
            uploadedAt: new Date()
        };

        await project.save();

        return res.status(200).json({
            message: 'Academic version uploaded successfully',
            academicVersion: project.capstone4.academicVersion
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Upload journal-format paper
// @route   PUT /api/v1/projects/:projectId/capstone4/journal-version
// @access  Private (Project member)
exports.uploadJournalVersion = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { fileId, webViewLink } = req.body;

        if (!fileId || !webViewLink) {
            return res.status(400).json({ message: 'fileId and webViewLink are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify user is a project member
        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) &&
            project.members.some(member => getIdString(member) === userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can upload the journal version' });
        }

        if (!project.capstone4) {
            project.capstone4 = {};
        }

        project.capstone4.journalVersion = {
            fileId,
            webViewLink,
            uploadedAt: new Date()
        };

        await project.save();

        return res.status(200).json({
            message: 'Journal version uploaded successfully',
            journalVersion: project.capstone4.journalVersion
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Trigger placeholder plagiarism check
// @route   POST /api/v1/projects/:projectId/capstone4/plagiarism-check
// @access  Private (Coordinator only)
exports.runPlagiarismCheck = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only coordinators can trigger a plagiarism check' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.capstone4) {
            project.capstone4 = {};
        }

        // Placeholder - in a real application this would call an external plagiarism API
        project.capstone4.plagiarismReport = {
            score: 0,
            status: 'pending',
            reportUrl: '',
            checkedAt: new Date()
        };

        await project.save();

        return res.status(200).json({
            message: 'Plagiarism check initiated. This is a placeholder — results will be updated when the external service responds.',
            plagiarismReport: project.capstone4.plagiarismReport
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a credential document
// @route   POST /api/v1/projects/:projectId/capstone4/credentials
// @access  Private (Project member)
exports.uploadCredential = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type, name, fileId, webViewLink } = req.body;

        const validTypes = ['clearance', 'panel_approval', 'ethics_review', 'hardbound_receipt', 'other'];
        if (!type || !validTypes.includes(type)) {
            return res.status(400).json({
                message: `type is required and must be one of: ${validTypes.join(', ')}`
            });
        }

        if (!name || !fileId || !webViewLink) {
            return res.status(400).json({ message: 'name, fileId, and webViewLink are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify user is a project member
        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) &&
            project.members.some(member => getIdString(member) === userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can upload credentials' });
        }

        if (!project.capstone4) {
            project.capstone4 = {};
        }

        if (!Array.isArray(project.capstone4.credentials)) {
            project.capstone4.credentials = [];
        }

        project.capstone4.credentials.push({
            type,
            name,
            fileId,
            webViewLink,
            uploadedAt: new Date(),
            uploadedBy: req.user._id
        });

        await project.save();

        const addedCredential = project.capstone4.credentials[project.capstone4.credentials.length - 1];

        return res.status(201).json({
            message: 'Credential uploaded successfully',
            credential: addedCredential
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    List all credentials for a project
// @route   GET /api/v1/projects/:projectId/capstone4/credentials
// @access  Private
exports.getCredentials = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('capstone4.credentials.uploadedBy', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const credentials = project.capstone4?.credentials || [];

        return res.status(200).json({ credentials });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Record defense verdict (panelist or coordinator)
// @route   PUT /api/v1/projects/:projectId/capstone4/defense-verdict
// @access  Private (Panelist assigned to project or Coordinator)
exports.recordDefenseVerdict = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { result, remarks } = req.body;

        const validResults = ['passed', 'failed', 'conditional'];
        if (!result || !validResults.includes(result)) {
            return res.status(400).json({
                message: `result is required and must be one of: ${validResults.join(', ')}`
            });
        }

        const project = await Project.findById(projectId)
            .populate('members', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only panelist assigned to this project or coordinator can record verdict
        const userId = getIdString(req.user._id);
        const isCoordinator = req.user.role === 'coordinator';
        const isAssignedPanelist = req.user.role === 'panelist' &&
            Array.isArray(project.panelists) &&
            project.panelists.some(p => getIdString(p) === userId);

        if (!isCoordinator && !isAssignedPanelist) {
            return res.status(403).json({ message: 'Only an assigned panelist or coordinator can record the defense verdict' });
        }

        if (!project.capstone4) {
            project.capstone4 = {};
        }

        if (!project.capstone4.defenseVerdict) {
            project.capstone4.defenseVerdict = {
                result,
                remarks: remarks || '',
                evaluatedBy: [req.user._id],
                evaluatedAt: new Date()
            };
        } else {
            project.capstone4.defenseVerdict.result = result;
            project.capstone4.defenseVerdict.remarks = remarks || '';
            project.capstone4.defenseVerdict.evaluatedAt = new Date();

            // Add evaluator if not already present
            const alreadyEvaluated = project.capstone4.defenseVerdict.evaluatedBy
                .some(id => getIdString(id) === userId);

            if (!alreadyEvaluated) {
                project.capstone4.defenseVerdict.evaluatedBy.push(req.user._id);
            }
        }

        await project.save();

        // Send notifications to all project members about the verdict
        const memberIds = project.members.map(m => m._id);
        const evaluatorName = `${req.user.firstName} ${req.user.lastName}`.trim();
        const verdictLabel = result.charAt(0).toUpperCase() + result.slice(1);

        await Notification.createForRecipients(memberIds, {
            type: 'STATUS_CHANGED',
            title: 'Defense Verdict Recorded',
            message: `Your project "${project.title}" received a defense verdict: ${verdictLabel}. ${remarks ? `Remarks: ${remarks}` : ''}`.trim(),
            relatedProject: project._id,
            metadata: {
                actionBy: req.user._id,
                comment: remarks || ''
            }
        });

        return res.status(200).json({
            message: 'Defense verdict recorded successfully',
            defenseVerdict: project.capstone4.defenseVerdict
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get full capstone4 data for a project
// @route   GET /api/v1/projects/:projectId/capstone4
// @access  Private
exports.getCapstone4Status = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('capstone4.credentials.uploadedBy', 'firstName lastName email')
            .populate('capstone4.defenseVerdict.evaluatedBy', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const capstone4 = project.capstone4 || {};

        return res.status(200).json({ capstone4 });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

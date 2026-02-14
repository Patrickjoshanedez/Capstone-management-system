const Project = require('../models/Project');

/**
 * Upload a legacy project directly to the archive.
 * Coordinator-only. Bypasses the standard capstone workflow so that
 * older / historical projects can be stored in the system.
 */
const uploadLegacyProject = async (req, res) => {
    try {
        // Coordinator gate
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only coordinators can upload legacy projects' });
        }

        const {
            title,
            authors,         // comma-separated string
            year,            // maps to academicYear
            keywords,        // array or comma-separated string
            department,      // optional
            journalFileId,
            journalWebViewLink,
            academicFileId,
            academicWebViewLink
        } = req.body;

        // ── Validation ──────────────────────────────────────────────
        if (!title || !year) {
            return res.status(400).json({ message: 'Title and year are required' });
        }

        // Parse keywords into an array regardless of input format
        let parsedKeywords = [];
        if (keywords) {
            if (Array.isArray(keywords)) {
                parsedKeywords = keywords.map(k => k.trim()).filter(Boolean);
            } else if (typeof keywords === 'string') {
                parsedKeywords = keywords.split(',').map(k => k.trim()).filter(Boolean);
            }
        }

        // ── Build the project document ──────────────────────────────
        const projectData = {
            title,
            status: 'ARCHIVED',
            capstonePhase: 4,
            academicYear: year,
            keywords: parsedKeywords,
            members: [], // legacy projects have no user members

            // Store the original authors string inside proposal.background
            // so it remains searchable through normal text queries.
            proposal: {
                background: authors
                    ? `Legacy upload - Authors: ${authors}`
                    : 'Legacy upload'
            }
        };

        // Attach academic paper version if provided
        if (academicFileId || academicWebViewLink) {
            projectData.capstone4 = projectData.capstone4 || {};
            projectData.capstone4.academicVersion = {
                fileId: academicFileId,
                webViewLink: academicWebViewLink,
                uploadedAt: new Date()
            };
        }

        // Attach journal version if provided
        if (journalFileId || journalWebViewLink) {
            projectData.capstone4 = projectData.capstone4 || {};
            projectData.capstone4.journalVersion = {
                fileId: journalFileId,
                webViewLink: journalWebViewLink,
                uploadedAt: new Date()
            };
        }

        const project = await Project.create(projectData);

        return res.status(201).json(project);
    } catch (error) {
        console.error('uploadLegacyProject error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * List every legacy-uploaded project.
 * Coordinator-only. Returns archived projects that have no members
 * (the hallmark of a legacy upload).
 */
const listLegacyProjects = async (req, res) => {
    try {
        // Coordinator gate
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only coordinators can view legacy projects' });
        }

        const projects = await Project.find({
            status: 'ARCHIVED',
            members: { $size: 0 }
        }).sort({ createdAt: -1 });

        return res.status(200).json(projects);
    } catch (error) {
        console.error('listLegacyProjects error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    uploadLegacyProject,
    listLegacyProjects
};

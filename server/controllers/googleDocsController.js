/**
 * Google Docs Controller
 * 
 * Handles API endpoints for Google Docs integration:
 * - Create document for project
 * - Get document URL
 * - Sync document content
 * - Share document with team members
 */

const Project = require('../models/Project');
const User = require('../models/User');
const googleDocsService = require('../services/googleDocsService');
const Notification = require('../models/Notification');

/**
 * Check if Google Docs service is available
 */
exports.getStatus = async (req, res) => {
    try {
        const status = googleDocsService.getStatus();
        
        // Try to initialize if not already
        if (!status.isAvailable) {
            await googleDocsService.initialize();
        }

        const updatedStatus = googleDocsService.getStatus();
        
        res.json({
            success: true,
            googleDocs: {
                available: updatedStatus.isAvailable,
                message: updatedStatus.isAvailable 
                    ? 'Google Docs integration is available' 
                    : `Google Docs integration is not configured: ${updatedStatus.error}`
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to check Google Docs status',
            error: error.message
        });
    }
};

/**
 * Create a new Google Doc for a project
 * POST /api/v1/projects/:projectId/docs/create
 */
exports.createDocument = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        // Find the project
        const project = await Project.findById(projectId)
            .populate('members', 'email firstName lastName')
            .populate('adviser', 'email firstName lastName');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check if user is a member or adviser of the project
        const isMember = project.members.some(m => m._id.toString() === userId);
        const isAdviser = project.adviser?._id?.toString() === userId;
        const isCoordinator = req.user.role === 'coordinator';

        if (!isMember && !isAdviser && !isCoordinator) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to create a document for this project'
            });
        }

        // Check if document already exists
        if (project.googleDocs?.documentId) {
            return res.status(400).json({
                success: false,
                message: 'A Google Doc already exists for this project',
                googleDocs: project.googleDocs
            });
        }

        // Initialize service
        const initialized = await googleDocsService.initialize();
        if (!initialized) {
            const status = googleDocsService.getStatus();
            return res.status(503).json({
                success: false,
                message: 'Google Docs service is not available',
                error: status.error
            });
        }

        // Collect editor emails (members + adviser)
        const editorEmails = [];
        for (const member of project.members) {
            if (member.email) editorEmails.push(member.email);
        }
        if (project.adviser?.email) {
            editorEmails.push(project.adviser.email);
        }

        // Create the document
        const result = await googleDocsService.createDocument(
            project.title,
            projectId,
            editorEmails
        );

        // Update project with Google Docs info
        project.googleDocs = {
            documentId: result.documentId,
            documentUrl: result.documentUrl,
            createdAt: result.createdAt,
            lastSyncedAt: new Date()
        };

        await project.save();

        // Create notifications for team members
        const recipients = project.members.map(m => m._id);
        if (project.adviser) recipients.push(project.adviser._id);

        for (const recipientId of recipients) {
            if (recipientId.toString() !== userId) {
                await Notification.create({
                    recipient: recipientId,
                    type: 'DOCUMENT_UPLOADED',
                    title: 'Google Doc Created',
                    message: `A Google Doc has been created for project "${project.title}". Click to open and edit collaboratively.`,
                    data: {
                        projectId: project._id,
                        documentUrl: result.documentUrl
                    }
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Google Doc created successfully',
            googleDocs: project.googleDocs
        });
    } catch (error) {
        console.error('GoogleDocsController.createDocument error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Google Doc',
            error: error.message
        });
    }
};

/**
 * Get Google Doc URL for a project
 * GET /api/v1/projects/:projectId/docs
 */
exports.getDocument = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        const project = await Project.findById(projectId)
            .populate('members', '_id')
            .populate('adviser', '_id');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check permissions
        const isMember = project.members.some(m => m._id.toString() === userId);
        const isAdviser = project.adviser?._id?.toString() === userId;
        const isCoordinator = req.user.role === 'coordinator';

        if (!isMember && !isAdviser && !isCoordinator) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this document'
            });
        }

        if (!project.googleDocs?.documentId) {
            return res.status(404).json({
                success: false,
                message: 'No Google Doc exists for this project',
                canCreate: isMember || isAdviser || isCoordinator
            });
        }

        // Optionally get fresh info from Google
        let documentInfo = null;
        try {
            const initialized = await googleDocsService.initialize();
            if (initialized) {
                documentInfo = await googleDocsService.getDocumentInfo(project.googleDocs.documentId);
            }
        } catch (error) {
            console.warn('Could not fetch fresh document info:', error.message);
        }

        res.json({
            success: true,
            googleDocs: {
                ...project.googleDocs.toObject(),
                ...(documentInfo && {
                    title: documentInfo.title,
                    modifiedTime: documentInfo.modifiedTime,
                    lastModifiedBy: documentInfo.lastModifiedBy
                })
            }
        });
    } catch (error) {
        console.error('GoogleDocsController.getDocument error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get document info',
            error: error.message
        });
    }
};

/**
 * Sync Google Doc content to project
 * POST /api/v1/projects/:projectId/docs/sync
 */
exports.syncDocument = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        const project = await Project.findById(projectId)
            .populate('members', '_id')
            .populate('adviser', '_id');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Check permissions
        const isMember = project.members.some(m => m._id.toString() === userId);
        const isAdviser = project.adviser?._id?.toString() === userId;
        const isCoordinator = req.user.role === 'coordinator';

        if (!isMember && !isAdviser && !isCoordinator) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to sync this document'
            });
        }

        if (!project.googleDocs?.documentId) {
            return res.status(404).json({
                success: false,
                message: 'No Google Doc exists for this project'
            });
        }

        // Initialize service
        const initialized = await googleDocsService.initialize();
        if (!initialized) {
            return res.status(503).json({
                success: false,
                message: 'Google Docs service is not available'
            });
        }

        // Sync the document
        const syncResult = await googleDocsService.syncToProposal(project.googleDocs.documentId);

        // Update last synced time
        project.googleDocs.lastSyncedAt = new Date();
        await project.save();

        res.json({
            success: true,
            message: 'Document synced successfully',
            sync: {
                documentId: syncResult.documentId,
                title: syncResult.title,
                lastSyncedAt: project.googleDocs.lastSyncedAt,
                contentLength: syncResult.rawContent.length,
                // Future: Include parsed sections
                note: 'Section parsing is not yet implemented. Raw content retrieved.'
            }
        });
    } catch (error) {
        console.error('GoogleDocsController.syncDocument error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync document',
            error: error.message
        });
    }
};

/**
 * Share document with additional user
 * POST /api/v1/projects/:projectId/docs/share
 */
exports.shareDocument = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { email, role = 'writer' } = req.body;
        const userId = req.user.id;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }

        const project = await Project.findById(projectId)
            .populate('members', '_id')
            .populate('adviser', '_id');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only advisers and coordinators can share documents
        const isAdviser = project.adviser?._id?.toString() === userId;
        const isCoordinator = req.user.role === 'coordinator';

        if (!isAdviser && !isCoordinator) {
            return res.status(403).json({
                success: false,
                message: 'Only advisers and coordinators can share documents'
            });
        }

        if (!project.googleDocs?.documentId) {
            return res.status(404).json({
                success: false,
                message: 'No Google Doc exists for this project'
            });
        }

        // Initialize service
        const initialized = await googleDocsService.initialize();
        if (!initialized) {
            return res.status(503).json({
                success: false,
                message: 'Google Docs service is not available'
            });
        }

        // Share the document
        await googleDocsService.shareDocument(project.googleDocs.documentId, email, role);

        res.json({
            success: true,
            message: `Document shared with ${email} (${role} access)`
        });
    } catch (error) {
        console.error('GoogleDocsController.shareDocument error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share document',
            error: error.message
        });
    }
};

/**
 * Delete Google Doc for a project
 * DELETE /api/v1/projects/:projectId/docs
 */
exports.deleteDocument = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        const project = await Project.findById(projectId)
            .populate('adviser', '_id');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Only advisers and coordinators can delete documents
        const isAdviser = project.adviser?._id?.toString() === userId;
        const isCoordinator = req.user.role === 'coordinator';

        if (!isAdviser && !isCoordinator) {
            return res.status(403).json({
                success: false,
                message: 'Only advisers and coordinators can delete documents'
            });
        }

        if (!project.googleDocs?.documentId) {
            return res.status(404).json({
                success: false,
                message: 'No Google Doc exists for this project'
            });
        }

        // Initialize service
        const initialized = await googleDocsService.initialize();
        if (initialized) {
            try {
                await googleDocsService.deleteDocument(project.googleDocs.documentId);
            } catch (error) {
                console.warn('Could not delete document from Google:', error.message);
            }
        }

        // Clear Google Docs info from project
        project.googleDocs = {
            documentId: '',
            documentUrl: '',
            createdAt: null,
            lastSyncedAt: null
        };
        await project.save();

        res.json({
            success: true,
            message: 'Google Doc deleted successfully'
        });
    } catch (error) {
        console.error('GoogleDocsController.deleteDocument error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
};

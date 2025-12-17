const { google } = require('googleapis');
const streamifier = require('streamifier');
const Project = require('../models/Project');
const plagiarismService = require('../services/plagiarismService');

// Google Drive Setup
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
});
const drive = google.drive({ version: 'v3', auth });

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { projectId } = req.params;
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isMember = Array.isArray(project.members) && project.members.some(
            (memberId) => memberId.toString() === req.user._id.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: 'Not authorized to upload to this project' });
        }

        // Workflow Logic: Check Status
        if (!['PROPOSED', 'REVISION_REQUIRED'].includes(project.status)) {
            return res.status(403).json({ 
                message: `Uploads not allowed in current status: ${project.status}` 
            });
        }

        // Stream to Google Drive
        const fileMetadata = {
            name: `${project.title}_${Date.now()}.pdf`,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Shared Folder ID
        };

        const media = {
            mimeType: req.file.mimetype,
            body: streamifier.createReadStream(req.file.buffer),
        };

        const driveResponse = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        // Save to MongoDB
        project.document = {
            fileId: driveResponse.data.id,
            webViewLink: driveResponse.data.webViewLink,
            uploadedAt: new Date()
        };

        // Trigger Plagiarism Check (Mock)
        const plagiarismResult = await plagiarismService.checkDocument(driveResponse.data.id);
        project.plagiarismReport = plagiarismResult;

        await project.save();

        res.status(200).json({
            message: 'Upload successful',
            fileId: driveResponse.data.id,
            webViewLink: driveResponse.data.webViewLink,
            plagiarism: plagiarismResult
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

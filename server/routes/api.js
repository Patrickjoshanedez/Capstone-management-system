const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { protect, verifyRole } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');

// Multer Setup (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // Limit to 25MB to be safe with 512MB RAM
});

// --- AUTH ---
router.post('/auth/register', authController.registerUser);
router.post('/auth/login', authController.loginUser);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', protect, authController.getMe);

// --- PROJECTS ---

// List Projects (Role-based)
router.get('/projects', protect, verifyRole(['student', 'adviser', 'coordinator']), projectController.listProjects);

// Get Project Details
router.get('/projects/:projectId', protect, verifyRole(['student', 'adviser', 'coordinator']), projectController.getProjectById);

// Create Project (Student)
router.post('/projects', protect, verifyRole(['student']), projectController.createProject);

// Upload Document (Student)
router.post('/projects/:projectId/upload', 
    protect, 
    verifyRole(['student']), 
    upload.single('file'), 
    uploadController.uploadDocument
);

// Update Status (Adviser/Coordinator)
router.patch(
    '/projects/:projectId/status',
    protect,
    verifyRole(['student', 'adviser', 'coordinator']),
    projectController.updateProjectStatus
);

// Workflow Logs
router.get(
    '/projects/:projectId/logs',
    protect,
    verifyRole(['student', 'adviser', 'coordinator']),
    projectController.getProjectLogs
);

module.exports = router;

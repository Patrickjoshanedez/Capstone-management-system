const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { protect, verifyRole } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const projectController = require('../controllers/projectController');
const notificationController = require('../controllers/notificationController');
const googleDocsController = require('../controllers/googleDocsController');
const teamController = require('../controllers/teamController');
const chapterController = require('../controllers/chapterController');
const titleController = require('../controllers/titleController');
const topicController = require('../controllers/topicController');
const lockController = require('../controllers/lockController');
const deadlineController = require('../controllers/deadlineController');
const capstone4Controller = require('../controllers/capstone4Controller');
const repositoryController = require('../controllers/repositoryController');
const reportController = require('../controllers/reportController');
const legacyController = require('../controllers/legacyController');
const gapAnalysisController = require('../controllers/gapAnalysisController');
const userManagementController = require('../controllers/userManagementController');

// Multer Setup (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // Limit to 25MB to be safe with 512MB RAM
});

// --- AUTH ---
router.post('/auth/register', authController.registerUser);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/resend-otp', authController.resendOTP);
router.post('/auth/login', authController.loginUser);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/auth/me', protect, authController.getMe);
router.put('/auth/profile', protect, authController.updateProfile);
router.get('/auth/users', protect, verifyRole(['coordinator']), authController.listUsers);

// --- PROJECTS ---

// Check Title Similarity (before creating project)
router.post('/projects/check-title', protect, verifyRole(['student']), projectController.checkTitleSimilarity);

// List Projects (Role-based)
router.get('/projects', protect, verifyRole(['student', 'adviser', 'panelist', 'coordinator']), projectController.listProjects);

// Get Project Details
router.get('/projects/:projectId', protect, verifyRole(['student', 'adviser', 'panelist', 'coordinator']), projectController.getProjectById);

// Create Project (Student)
router.post('/projects', protect, verifyRole(['student']), projectController.createProject);

// Upload Document (Student)
router.post('/projects/:projectId/upload', 
    protect, 
    verifyRole(['student']), 
    upload.single('file'), 
    uploadController.uploadDocument
);

// Update Status (Adviser/Panelist/Coordinator)
router.patch(
    '/projects/:projectId/status',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    projectController.updateProjectStatus
);

// Workflow Logs
router.get(
    '/projects/:projectId/logs',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    projectController.getProjectLogs
);

// Update Proposal Details (Student)
router.put(
    '/projects/:projectId/proposal',
    protect,
    verifyRole(['student']),
    projectController.updateProposal
);

// Add Comment to Project (Adviser/Panelist/Coordinator)
router.post(
    '/projects/:projectId/comments',
    protect,
    verifyRole(['adviser', 'panelist', 'coordinator']),
    projectController.addComment
);

// Get Project Comments
router.get(
    '/projects/:projectId/comments',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    projectController.getComments
);

// --- CHAPTERS ---

// Create Chapter (Student)
router.post(
    '/projects/:projectId/chapters',
    protect,
    verifyRole(['student']),
    chapterController.createChapter
);

// Get Chapters for a Project
router.get(
    '/projects/:projectId/chapters',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    chapterController.getChapters
);

// Upload Chapter Version (Student)
router.post(
    '/projects/:projectId/chapters/:chapterId/upload',
    protect,
    verifyRole(['student']),
    chapterController.uploadChapterVersion
);

// Review Chapter (Adviser/Coordinator)
router.patch(
    '/projects/:projectId/chapters/:chapterId/review',
    protect,
    verifyRole(['adviser', 'coordinator']),
    chapterController.reviewChapter
);

// Get Chapter Version History
router.get(
    '/projects/:projectId/chapters/:chapterId/versions',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    chapterController.getChapterVersions
);

// --- GOOGLE DOCS ---
router.get('/google-docs/status', protect, googleDocsController.getStatus);

// Create Google Doc for project
router.post(
    '/projects/:projectId/docs/create',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    googleDocsController.createDocument
);

// Get Google Doc info for project
router.get(
    '/projects/:projectId/docs',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    googleDocsController.getDocument
);

// Sync Google Doc content to project
router.post(
    '/projects/:projectId/docs/sync',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    googleDocsController.syncDocument
);

// Share document with additional user
router.post(
    '/projects/:projectId/docs/share',
    protect,
    verifyRole(['adviser', 'panelist', 'coordinator']),
    googleDocsController.shareDocument
);

// Delete Google Doc for project
router.delete(
    '/projects/:projectId/docs',
    protect,
    verifyRole(['adviser', 'panelist', 'coordinator']),
    googleDocsController.deleteDocument
);

// --- TEAMS ---

// Create Team (Student)
router.post('/teams', protect, verifyRole(['student']), teamController.createTeam);

// Get My Team (Student)
router.get('/teams/me', protect, verifyRole(['student']), teamController.getMyTeam);

// Get My Pending Invitations (Student)
router.get('/teams/me/invitations', protect, verifyRole(['student']), teamController.getMyInvitations);

// List All Teams (Coordinator)
router.get('/teams', protect, verifyRole(['coordinator']), teamController.listTeams);

// Invite Member to Team (Student - team leader)
router.post('/teams/:teamId/invite', protect, verifyRole(['student']), teamController.inviteMember);

// Respond to Team Invitation (Student)
router.patch('/teams/:teamId/invitations/:invitationId', protect, verifyRole(['student']), teamController.respondToInvitation);

// Lock Team (Student - team leader)
router.patch('/teams/:teamId/lock', protect, verifyRole(['student']), teamController.lockTeam);

// Adopt Orphaned Student (Coordinator)
router.post('/teams/:teamId/adopt', protect, verifyRole(['coordinator']), teamController.adoptOrphanedStudent);

// --- TITLE CHANGE REQUESTS ---

// Request Title Change (Student)
router.post(
    '/projects/:projectId/title-change',
    protect,
    verifyRole(['student']),
    titleController.requestTitleChange
);

// List Title Change Requests (Coordinator)
router.get(
    '/title-requests',
    protect,
    verifyRole(['coordinator']),
    titleController.listTitleRequests
);

// Review Title Change Request (Coordinator)
router.patch(
    '/title-requests/:requestId',
    protect,
    verifyRole(['coordinator']),
    titleController.reviewTitleRequest
);

// --- TOPICS (Pre-Approved Topic Marketplace) ---

// Create Topic (Panelist/Coordinator)
router.post(
    '/topics',
    protect,
    verifyRole(['panelist', 'coordinator']),
    topicController.createTopic
);

// List Topics (All authenticated)
router.get(
    '/topics',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    topicController.listTopics
);

// Claim Topic (Student)
router.post(
    '/topics/:topicId/claim',
    protect,
    verifyRole(['student']),
    topicController.claimTopic
);

// --- DOCUMENT LOCKING ---

// Get Lock Status
router.get(
    '/projects/:projectId/lock',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    lockController.getLockStatus
);

// Acquire Lock (Student)
router.post(
    '/projects/:projectId/lock',
    protect,
    verifyRole(['student']),
    lockController.acquireLock
);

// Release Lock (Student/Coordinator)
router.delete(
    '/projects/:projectId/lock',
    protect,
    verifyRole(['student', 'coordinator']),
    lockController.releaseLock
);

// Request Unlock (Student)
router.post(
    '/projects/:projectId/lock/request-unlock',
    protect,
    verifyRole(['student']),
    lockController.requestUnlock
);

// Force Unlock (Coordinator)
router.delete(
    '/projects/:projectId/lock/override',
    protect,
    verifyRole(['coordinator']),
    lockController.overrideLock
);

// --- DEADLINES ---

// Create Deadline (Coordinator)
router.post(
    '/deadlines',
    protect,
    verifyRole(['coordinator']),
    deadlineController.createDeadline
);

// List Deadlines (All authenticated)
router.get(
    '/deadlines',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    deadlineController.listDeadlines
);

// Check Deadline (All authenticated)
router.get(
    '/deadlines/check',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    deadlineController.checkDeadline
);

// Update Deadline (Coordinator)
router.put(
    '/deadlines/:id',
    protect,
    verifyRole(['coordinator']),
    deadlineController.updateDeadline
);

// Delete Deadline (Coordinator)
router.delete(
    '/deadlines/:id',
    protect,
    verifyRole(['coordinator']),
    deadlineController.deleteDeadline
);

// --- CAPSTONE 4 (Finalization) ---

// Get Capstone 4 Status
router.get(
    '/projects/:projectId/capstone4',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    capstone4Controller.getCapstone4Status
);

// Upload Academic Version (Student)
router.post(
    '/projects/:projectId/capstone4/academic',
    protect,
    verifyRole(['student']),
    capstone4Controller.uploadAcademicVersion
);

// Upload Journal Version (Student)
router.post(
    '/projects/:projectId/capstone4/journal',
    protect,
    verifyRole(['student']),
    capstone4Controller.uploadJournalVersion
);

// Run Plagiarism Check (Coordinator)
router.post(
    '/projects/:projectId/capstone4/plagiarism-check',
    protect,
    verifyRole(['coordinator']),
    capstone4Controller.runPlagiarismCheck
);

// Upload Credential (Student)
router.post(
    '/projects/:projectId/capstone4/credentials',
    protect,
    verifyRole(['student']),
    capstone4Controller.uploadCredential
);

// Get Credentials
router.get(
    '/projects/:projectId/capstone4/credentials',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    capstone4Controller.getCredentials
);

// Record Defense Verdict (Panelist/Coordinator)
router.post(
    '/projects/:projectId/capstone4/defense-verdict',
    protect,
    verifyRole(['panelist', 'coordinator']),
    capstone4Controller.recordDefenseVerdict
);

// --- REPOSITORY ---

// Search Repository (All authenticated)
router.get(
    '/repository/search',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    repositoryController.searchRepository
);

// Repository Stats (Coordinator)
router.get(
    '/repository/stats',
    protect,
    verifyRole(['coordinator']),
    repositoryController.getRepositoryStats
);

// --- REPORTS ---

// Overview Stats (Coordinator)
router.get('/reports/overview', protect, verifyRole(['coordinator']), reportController.getOverviewStats);

// Projects by Year (Coordinator)
router.get('/reports/by-year', protect, verifyRole(['coordinator']), reportController.getProjectsByYear);

// Projects by Topic (Coordinator)
router.get('/reports/by-topic', protect, verifyRole(['coordinator']), reportController.getProjectsByTopic);

// Projects by Author (Coordinator)
router.get('/reports/by-author', protect, verifyRole(['coordinator']), reportController.getProjectsByAuthor);

// Export Report (Coordinator)
router.get('/reports/export', protect, verifyRole(['coordinator']), reportController.exportReport);

// --- LEGACY UPLOAD ---

// Upload Legacy Project (Coordinator)
router.post('/legacy/upload', protect, verifyRole(['coordinator']), legacyController.uploadLegacyProject);

// List Legacy Uploads (Coordinator)
router.get('/legacy', protect, verifyRole(['coordinator']), legacyController.listLegacyProjects);

// --- PROJECT RESET ---

// Reset Project (Coordinator)
router.post(
    '/projects/:projectId/reset',
    protect,
    verifyRole(['coordinator']),
    projectController.resetProject
);

// --- PROTOTYPES ---

// Add Prototype (Student)
router.post(
    '/projects/:projectId/prototypes',
    protect,
    verifyRole(['student']),
    projectController.addPrototype
);

// Get Prototypes (All roles with project access)
router.get(
    '/projects/:projectId/prototypes',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    projectController.getPrototypes
);

// --- GAP ANALYSIS ---

// Keyword Frequencies (All authenticated)
router.get(
    '/gap-analysis/keywords',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    gapAnalysisController.getKeywordFrequencies
);

// Topic Clusters (All authenticated)
router.get(
    '/gap-analysis/clusters',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    gapAnalysisController.getTopicClusters
);

// Gap Suggestions (Student)
router.post(
    '/gap-analysis/suggestions',
    protect,
    verifyRole(['student', 'adviser', 'panelist', 'coordinator']),
    gapAnalysisController.getGapSuggestions
);

// --- USER MANAGEMENT (Coordinator) ---

// List Users (Coordinator)
router.get(
    '/users',
    protect,
    verifyRole(['coordinator']),
    userManagementController.listUsers
);

// Update User Role (Coordinator)
router.patch(
    '/users/:userId/role',
    protect,
    verifyRole(['coordinator']),
    userManagementController.updateUserRole
);

// Assign Adviser to Project (Coordinator)
router.post(
    '/projects/:projectId/assign-adviser',
    protect,
    verifyRole(['coordinator']),
    userManagementController.assignAdviser
);

// Assign Panelists to Project (Coordinator)
router.post(
    '/projects/:projectId/assign-panelists',
    protect,
    verifyRole(['coordinator']),
    userManagementController.assignPanelists
);

// --- NOTIFICATIONS ---
router.get('/notifications', protect, notificationController.getNotifications);
router.get('/notifications/unread-count', protect, notificationController.getUnreadCount);
router.put('/notifications/:id/read', protect, notificationController.markAsRead);
router.put('/notifications/mark-all-read', protect, notificationController.markAllAsRead);
router.delete('/notifications/:id', protect, notificationController.deleteNotification);
router.delete('/notifications/clear-read', protect, notificationController.clearReadNotifications);

module.exports = router;

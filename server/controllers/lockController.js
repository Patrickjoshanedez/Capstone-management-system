const Project = require('../models/Project');
const Notification = require('../models/Notification');

// NOTE: The Project model must have the following subdocument added to its schema:
//
// documentLock: {
//   isLocked: { type: Boolean, default: false },
//   lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   lockedAt: Date,
//   chapterId: String,
//   unlockRequests: [{
//     requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     requestedAt: Date,
//     status: { type: String, enum: ['pending', 'granted', 'denied'], default: 'pending' }
//   }]
// }

const getIdString = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id.toString();
    if (typeof value.toString === 'function') return value.toString();
    return null;
};

// @desc    Acquire a pessimistic lock on a project document (or specific chapter)
// @route   POST /api/v1/projects/:projectId/lock
// @access  Private (Student - project member)
exports.acquireLock = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { chapterId } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) &&
            project.members.some(member => getIdString(member) === userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can acquire a lock' });
        }

        const lock = project.documentLock || {};

        // Check if already locked by someone else
        if (lock.isLocked) {
            const lockHolderId = getIdString(lock.lockedBy);

            if (lockHolderId !== userId) {
                // Locked by another user - return 409 Conflict
                const populatedProject = await Project.findById(projectId)
                    .populate('documentLock.lockedBy', 'firstName lastName email');

                const holderLock = populatedProject.documentLock;
                return res.status(409).json({
                    message: 'Document is currently locked by another user',
                    lock: {
                        isLocked: true,
                        lockedBy: holderLock.lockedBy,
                        lockedAt: holderLock.lockedAt,
                        chapterId: holderLock.chapterId
                    }
                });
            }

            // Locked by same user - refresh the timestamp
            project.documentLock.lockedAt = new Date();
            if (chapterId !== undefined) {
                project.documentLock.chapterId = chapterId;
            }

            await project.save();

            return res.status(200).json({
                message: 'Lock refreshed',
                lock: {
                    isLocked: true,
                    lockedBy: userId,
                    lockedAt: project.documentLock.lockedAt,
                    chapterId: project.documentLock.chapterId
                }
            });
        }

        // No existing lock - acquire it
        project.documentLock = {
            isLocked: true,
            lockedBy: req.user._id,
            lockedAt: new Date(),
            chapterId: chapterId || null,
            unlockRequests: []
        };

        await project.save();

        return res.status(200).json({
            message: 'Lock acquired',
            lock: {
                isLocked: true,
                lockedBy: userId,
                lockedAt: project.documentLock.lockedAt,
                chapterId: project.documentLock.chapterId
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Release a pessimistic lock on a project document
// @route   POST /api/v1/projects/:projectId/unlock
// @access  Private (Lock holder or Coordinator)
exports.releaseLock = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const lock = project.documentLock || {};
        if (!lock.isLocked) {
            return res.status(400).json({ message: 'Document is not currently locked' });
        }

        const userId = getIdString(req.user._id);
        const lockHolderId = getIdString(lock.lockedBy);
        const isCoordinator = req.user.role === 'coordinator';

        if (lockHolderId !== userId && !isCoordinator) {
            return res.status(403).json({ message: 'Only the lock holder or a coordinator can release this lock' });
        }

        // Grant any pending unlock requests and notify requesters
        const pendingRequests = (lock.unlockRequests || []).filter(r => r.status === 'pending');

        for (const request of pendingRequests) {
            request.status = 'granted';

            await Notification.create({
                recipient: request.requestedBy,
                type: 'LOCK_RELEASED',
                title: 'Document Lock Released',
                message: `The document lock on "${project.title}" has been released. You may now edit the document.`,
                relatedProject: project._id,
                metadata: {
                    actionBy: req.user._id
                }
            });
        }

        // Clear the lock
        project.documentLock.isLocked = false;
        project.documentLock.lockedBy = null;
        project.documentLock.lockedAt = null;
        project.documentLock.chapterId = null;

        await project.save();

        return res.status(200).json({ message: 'Lock released successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Request that the current lock holder unlocks the document
// @route   POST /api/v1/projects/:projectId/lock/request-unlock
// @access  Private (Project member, but not the lock holder)
exports.requestUnlock = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const userId = getIdString(req.user._id);
        const isMember = Array.isArray(project.members) &&
            project.members.some(member => getIdString(member) === userId);

        if (!isMember) {
            return res.status(403).json({ message: 'Only project members can request an unlock' });
        }

        const lock = project.documentLock || {};
        if (!lock.isLocked) {
            return res.status(400).json({ message: 'Document is not currently locked' });
        }

        const lockHolderId = getIdString(lock.lockedBy);
        if (lockHolderId === userId) {
            return res.status(400).json({ message: 'You are the current lock holder. Use the release endpoint instead.' });
        }

        // Add the unlock request
        if (!project.documentLock.unlockRequests) {
            project.documentLock.unlockRequests = [];
        }

        project.documentLock.unlockRequests.push({
            requestedBy: req.user._id,
            requestedAt: new Date(),
            status: 'pending'
        });

        await project.save();

        // Notify the lock holder
        const requesterName = `${req.user.firstName} ${req.user.lastName}`.trim();

        await Notification.create({
            recipient: lock.lockedBy,
            type: 'LOCK_REQUESTED',
            title: 'Unlock Request',
            message: `${requesterName} is requesting you to release the document lock on "${project.title}".`,
            relatedProject: project._id,
            metadata: {
                actionBy: req.user._id
            }
        });

        return res.status(200).json({ message: 'Unlock request sent to the lock holder' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Coordinator force-unlocks a document
// @route   POST /api/v1/projects/:projectId/lock/override
// @access  Private (Coordinator only)
exports.overrideLock = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only coordinators can override a document lock' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const lock = project.documentLock || {};
        if (!lock.isLocked) {
            return res.status(400).json({ message: 'Document is not currently locked' });
        }

        const previousHolderId = lock.lockedBy;

        // Force clear the lock
        project.documentLock.isLocked = false;
        project.documentLock.lockedBy = null;
        project.documentLock.lockedAt = null;
        project.documentLock.chapterId = null;

        await project.save();

        // Notify the previous lock holder
        if (previousHolderId) {
            const coordinatorName = `${req.user.firstName} ${req.user.lastName}`.trim();

            await Notification.create({
                recipient: previousHolderId,
                type: 'LOCK_OVERRIDE',
                title: 'Document Lock Overridden',
                message: `Coordinator ${coordinatorName} has overridden your document lock on "${project.title}".`,
                relatedProject: project._id,
                metadata: {
                    actionBy: req.user._id
                }
            });
        }

        return res.status(200).json({ message: 'Lock overridden successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get the current lock status of a project document
// @route   GET /api/v1/projects/:projectId/lock
// @access  Private
exports.getLockStatus = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('documentLock.lockedBy', 'firstName lastName email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const lock = project.documentLock || {};

        return res.status(200).json({
            lock: {
                isLocked: lock.isLocked || false,
                lockedBy: lock.lockedBy || null,
                lockedAt: lock.lockedAt || null,
                chapterId: lock.chapterId || null
            }
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

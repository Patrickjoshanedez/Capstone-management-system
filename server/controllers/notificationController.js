const Notification = require('../models/Notification');

/**
 * Get all notifications for the current user
 * GET /api/v1/notifications
 */
exports.getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
        const query = { recipient: req.user._id };
        
        if (unreadOnly === 'true') {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .populate('relatedProject', 'title status')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.getUnreadCount(req.user._id);

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                unreadCount
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user._id);
        res.json({ success: true, data: { count } });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark a notification as read
 * PUT /api/v1/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await notification.markAsRead();
        res.json({ success: true, data: notification });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark all notifications as read
 * PUT /api/v1/notifications/mark-all-read
 */
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true, readAt: new Date() }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete a notification
 * DELETE /api/v1/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Clear all read notifications (cleanup)
 * DELETE /api/v1/notifications/clear-read
 */
exports.clearReadNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({
            recipient: req.user._id,
            read: true
        });

        res.json({ 
            success: true, 
            message: `${result.deletedCount} read notifications cleared` 
        });
    } catch (error) {
        console.error('Clear read notifications error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Helper function to create notifications (used by other controllers)
 */
exports.createNotification = async ({
    recipient,
    type,
    title,
    message,
    relatedProject = null,
    metadata = {}
}) => {
    try {
        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            relatedProject,
            metadata
        });
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

/**
 * Helper function to create notifications for multiple recipients
 */
exports.createNotificationsForRecipients = async (recipientIds, data) => {
    try {
        return await Notification.createForRecipients(recipientIds, data);
    } catch (error) {
        console.error('Create notifications for recipients error:', error);
        return [];
    }
};

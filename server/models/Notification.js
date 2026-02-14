const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'PROPOSAL_SUBMITTED',
            'REVISION_REQUESTED',
            'PROPOSAL_APPROVED',
            'STATUS_CHANGED',
            'COMMENT_ADDED',
            'DOCUMENT_UPLOADED',
            'DEADLINE_REMINDER',
            'ADVISER_ASSIGNED',
            'PROJECT_ARCHIVED',
            'DEFENSE_SCHEDULED',
            'TEAM_INVITATION',
            'TEAM_INVITATION_ACCEPTED',
            'TEAM_INVITATION_DECLINED',
            'TEAM_MEMBER_ADDED',
            'TEAM_LOCKED',
            'PANELIST_ASSIGNED',
            'CHAPTER_SUBMITTED',
            'CHAPTER_APPROVED',
            'CHAPTER_REVISION_REQUIRED',
            'CONSOLIDATION_UNLOCKED',
            'TITLE_CHANGE_REQUESTED',
            'TITLE_CHANGE_APPROVED',
            'TITLE_CHANGE_REJECTED',
            'TOPIC_CLAIMED',
            'LOCK_REQUESTED',
            'LOCK_RELEASED',
            'LOCK_OVERRIDE'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    relatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    metadata: {
        fromStatus: String,
        toStatus: String,
        comment: String,
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    read: {
        type: Boolean,
        default: false
    },
    actionUrl: {
        type: String,
        default: ''
    },
    emailSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Static method to create notification for multiple recipients
notificationSchema.statics.createForRecipients = async function(recipients, notificationData) {
    const notifications = recipients.map(recipientId => ({
        ...notificationData,
        recipient: recipientId
    }));
    return this.insertMany(notifications);
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
    return this.countDocuments({ recipient: userId, read: false });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
    this.read = true;
    return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);

const mongoose = require('mongoose');

const AuthLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    email: {
        type: String,
        default: null
    },
    eventType: {
        type: String,
        enum: [
            'PASSWORD_RESET_REQUESTED',
            'PASSWORD_RESET_RATE_LIMITED',
            'PASSWORD_RESET_EMAIL_SENT',
            'PASSWORD_RESET_FAILED',
            'PASSWORD_RESET_SUCCEEDED'
        ],
        required: true
    },
    ip: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('AuthLog', AuthLogSchema);

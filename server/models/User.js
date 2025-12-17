const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'adviser', 'coordinator'],
        required: true
    },
    department: {
        type: String,
        default: 'IT'
    },
    resetPasswordCodeHash: {
        type: String,
        default: null
    },
    resetPasswordCodeExpiresAt: {
        type: Date,
        default: null
    },
    resetPasswordRequestedAt: {
        type: Date,
        default: null
    },
    resetPasswordFailedAttempts: {
        type: Number,
        default: 0
    },
    resetPasswordBlockedUntil: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

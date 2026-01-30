const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
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
    // Profile fields (as per workflow diagram)
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        default: ''
    },
    contactEmail: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    skills: [{
        type: String
    }],
    yearLevel: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', ''],
        default: ''
    },
    // Password reset fields
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

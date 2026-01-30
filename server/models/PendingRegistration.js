const mongoose = require('mongoose');

const PendingRegistrationSchema = new mongoose.Schema({
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
    otpCode: {
        type: String,
        required: true
    },
    otpExpiresAt: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete after 10 minutes
    }
});

module.exports = mongoose.model('PendingRegistration', PendingRegistrationSchema);

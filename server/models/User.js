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
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

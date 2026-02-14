const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: ['leader', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now }
    }],
    maxSize: { type: Number, default: 5 },
    status: { type: String, enum: ['forming', 'locked', 'dissolved'], default: 'forming' },
    invitations: [{
        invitee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
        sentAt: { type: Date, default: Date.now },
        respondedAt: Date
    }],
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);

const mongoose = require('mongoose');

const TitleChangeRequestSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentTitle: { type: String, required: true },
    proposedTitle: { type: String, required: true },
    rationale: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewComment: { type: String, maxlength: 1000 },
    reviewedAt: Date
}, { timestamps: true });

TitleChangeRequestSchema.index({ project: 1, status: 1 });
TitleChangeRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('TitleChangeRequest', TitleChangeRequestSchema);

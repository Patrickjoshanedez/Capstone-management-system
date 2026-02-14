const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true, maxlength: 2000 },
    suggestedOutline: {
        chapter1: { type: String, default: '' },
        chapter2: { type: String, default: '' },
        chapter3: { type: String, default: '' }
    },
    keywords: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['available', 'claimed', 'archived'], default: 'available' },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    claimedAt: Date,
    academicYear: { type: String, default: '' }
}, { timestamps: true });

TopicSchema.index({ status: 1, createdAt: -1 });
TopicSchema.index({ keywords: 1 });

module.exports = mongoose.model('Topic', TopicSchema);

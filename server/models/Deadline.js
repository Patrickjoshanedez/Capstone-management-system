const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    capstonePhase: { type: Number, enum: [1, 2, 3, 4], required: true },
    targetStatus: { type: String, required: true },
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    academicYear: { type: String, default: '' }
  },
  { timestamps: true }
);

deadlineSchema.index({ capstonePhase: 1, isActive: 1 });
deadlineSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Deadline', deadlineSchema);

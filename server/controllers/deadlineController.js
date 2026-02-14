const Deadline = require('../models/Deadline');

/**
 * Create a new deadline (coordinator only).
 */
const createDeadline = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({ message: 'Only coordinators can create deadlines' });
    }

    const { title, description, capstonePhase, targetStatus, dueDate, academicYear } = req.body;

    if (!title || !capstonePhase || !targetStatus || !dueDate) {
      return res.status(400).json({ message: 'Title, capstonePhase, targetStatus, and dueDate are required' });
    }

    const deadline = await Deadline.create({
      title,
      description,
      capstonePhase,
      targetStatus,
      dueDate,
      academicYear,
      createdBy: req.user._id
    });

    return res.status(201).json(deadline);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * List deadlines with optional filters.
 */
const listDeadlines = async (req, res) => {
  try {
    const filter = {};

    if (req.query.capstonePhase) {
      filter.capstonePhase = Number(req.query.capstonePhase);
    }

    // Default to active deadlines unless explicitly set to 'false'
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    } else {
      filter.isActive = true;
    }

    const deadlines = await Deadline.find(filter)
      .sort({ dueDate: 1 })
      .populate('createdBy', 'firstName lastName');

    return res.status(200).json(deadlines);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update an existing deadline (coordinator only).
 */
const updateDeadline = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({ message: 'Only coordinators can update deadlines' });
    }

    const { title, description, dueDate, isActive, academicYear } = req.body;

    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' });
    }

    if (title !== undefined) deadline.title = title;
    if (description !== undefined) deadline.description = description;
    if (dueDate !== undefined) deadline.dueDate = dueDate;
    if (isActive !== undefined) deadline.isActive = isActive;
    if (academicYear !== undefined) deadline.academicYear = academicYear;

    await deadline.save();

    return res.status(200).json(deadline);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete a deadline (coordinator only).
 */
const deleteDeadline = async (req, res) => {
  try {
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({ message: 'Only coordinators can delete deadlines' });
    }

    const deadline = await Deadline.findByIdAndDelete(req.params.id);
    if (!deadline) {
      return res.status(404).json({ message: 'Deadline not found' });
    }

    return res.status(200).json({ message: 'Deadline deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Check whether a submission would be late for the matching deadline.
 */
const checkDeadline = async (req, res) => {
  try {
    const { targetStatus, capstonePhase } = req.query;

    if (!targetStatus || !capstonePhase) {
      return res.status(400).json({ message: 'targetStatus and capstonePhase query params are required' });
    }

    const deadline = await Deadline.findOne({
      targetStatus,
      capstonePhase: Number(capstonePhase),
      isActive: true
    });

    if (!deadline) {
      return res.status(200).json({ deadline: null, isLate: false });
    }

    const now = new Date();
    const dueDate = new Date(deadline.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isLate = now > dueDate;

    return res.status(200).json({ deadline, isLate, daysRemaining });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createDeadline,
  listDeadlines,
  updateDeadline,
  deleteDeadline,
  checkDeadline
};

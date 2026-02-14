const Topic = require('../models/Topic');
const Project = require('../models/Project');
const Team = require('../models/Team');
const Notification = require('../models/Notification');

// @desc    Create a pre-approved topic
// @route   POST /api/v1/topics
// @access  Private (Panelist, Coordinator)
exports.createTopic = async (req, res) => {
    try {
        const { title, description, suggestedOutline, keywords, academicYear } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const topicData = {
            title,
            description,
            createdBy: req.user._id
        };

        if (suggestedOutline) {
            topicData.suggestedOutline = suggestedOutline;
        }

        if (Array.isArray(keywords) && keywords.length > 0) {
            topicData.keywords = keywords.map((k) => String(k).trim()).filter(Boolean);
        }

        if (academicYear) {
            topicData.academicYear = academicYear;
        }

        const topic = await Topic.create(topicData);

        const populatedTopic = await Topic.findById(topic._id)
            .populate('createdBy', 'firstName lastName');

        return res.status(201).json({ topic: populatedTopic });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Browse available topics
// @route   GET /api/v1/topics
// @access  Private (All authenticated roles)
exports.listTopics = async (req, res) => {
    try {
        const { status, keyword, academicYear } = req.query;

        const query = {};

        query.status = status || 'available';

        if (keyword) {
            query.keywords = keyword;
        }

        if (academicYear) {
            query.academicYear = academicYear;
        }

        const topics = await Topic.find(query)
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        return res.status(200).json({ topics });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Student team leader claims a topic
// @route   POST /api/v1/topics/:topicId/claim
// @access  Private (Student - Team Leader)
exports.claimTopic = async (req, res) => {
    try {
        const { topicId } = req.params;

        // Find the topic and verify it is available
        const topic = await Topic.findById(topicId);

        if (!topic) {
            return res.status(404).json({ message: 'Topic not found' });
        }

        if (topic.status !== 'available') {
            return res.status(400).json({ message: 'This topic is no longer available' });
        }

        // Find the student's locked team
        const team = await Team.findOne({
            'members.user': req.user._id,
            status: 'locked'
        });

        if (!team) {
            return res.status(400).json({ message: 'You must have a locked team to claim a topic' });
        }

        // Check that the student is the team leader
        const leader = team.members.find(
            (m) => m.user.toString() === req.user._id.toString() && m.role === 'leader'
        );

        if (!leader) {
            return res.status(403).json({ message: 'Only the team leader can claim a topic' });
        }

        // Team must not already have a project
        if (team.project) {
            return res.status(400).json({ message: 'Your team already has a project' });
        }

        // Create a new project from the topic
        const memberIds = team.members.map((m) => m.user);

        const project = await Project.create({
            title: topic.title,
            members: memberIds,
            status: 'TOPIC_SELECTION'
        });

        // Update the topic to claimed
        topic.status = 'claimed';
        topic.claimedBy = project._id;
        topic.claimedAt = new Date();
        await topic.save();

        // Link the project to the team
        team.project = project._id;
        await team.save();

        // Notify all team members
        await Notification.createForRecipients(memberIds, {
            type: 'TOPIC_CLAIMED',
            title: 'Topic Claimed',
            message: `Your team has claimed the topic "${topic.title}". You can now begin working on your capstone project.`,
            relatedProject: project._id,
            metadata: { actionBy: req.user._id }
        });

        // Populate and return the results
        const populatedTopic = await Topic.findById(topic._id)
            .populate('createdBy', 'firstName lastName')
            .populate('claimedBy');

        const populatedProject = await Project.findById(project._id)
            .populate('members', 'firstName lastName email role');

        return res.status(201).json({ topic: populatedTopic, project: populatedProject });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

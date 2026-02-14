const Project = require('../models/Project');

/**
 * Aggregate keyword frequencies across all archived projects.
 * Returns overall counts and a year-based breakdown.
 */
const getKeywordFrequencies = async (req, res) => {
    try {
        const matchStage = {
            $match: { status: { $in: ['ARCHIVED', 'FINAL_APPROVED'] } }
        };

        // Overall keyword frequencies
        const frequencies = await Project.aggregate([
            matchStage,
            { $unwind: '$keywords' },
            {
                $group: {
                    _id: '$keywords',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 50 },
            {
                $project: {
                    _id: 0,
                    keyword: '$_id',
                    count: 1
                }
            }
        ]);

        // Keyword frequencies broken down by academic year
        const byYear = await Project.aggregate([
            matchStage,
            { $unwind: '$keywords' },
            {
                $group: {
                    _id: { keyword: '$keywords', academicYear: '$academicYear' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 50 },
            {
                $project: {
                    _id: 0,
                    keyword: '$_id.keyword',
                    year: '$_id.academicYear',
                    count: 1
                }
            }
        ]);

        res.json({ frequencies, byYear });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve keyword frequencies', error: error.message });
    }
};

/**
 * Group projects by shared keywords into topic clusters.
 * Each keyword forms a cluster containing the projects that use it.
 */
const getTopicClusters = async (req, res) => {
    try {
        const clusters = await Project.aggregate([
            {
                $match: { status: { $in: ['ARCHIVED', 'FINAL_APPROVED'] } }
            },
            { $unwind: '$keywords' },
            {
                $group: {
                    _id: '$keywords',
                    count: { $sum: 1 },
                    projects: {
                        $push: {
                            title: '$title',
                            academicYear: '$academicYear'
                        }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 },
            {
                $project: {
                    _id: 0,
                    keyword: '$_id',
                    count: 1,
                    projects: 1
                }
            }
        ]);

        res.json({ clusters });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve topic clusters', error: error.message });
    }
};

/**
 * Compare user-supplied keywords against the existing archived corpus.
 * Classifies each keyword as saturated, moderate, or unexplored and
 * suggests related keywords found in matching projects.
 */
const getGapSuggestions = async (req, res) => {
    try {
        const { keywords } = req.body;

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return res.status(400).json({ message: 'keywords must be a non-empty array of strings' });
        }

        const matchStage = {
            $match: { status: { $in: ['ARCHIVED', 'FINAL_APPROVED'] } }
        };

        // Count how many archived projects contain each user keyword
        const keywordCounts = await Project.aggregate([
            matchStage,
            { $unwind: '$keywords' },
            {
                $match: { keywords: { $in: keywords } }
            },
            {
                $group: {
                    _id: '$keywords',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Build a lookup map from the aggregation results
        const countMap = {};
        keywordCounts.forEach((item) => {
            countMap[item._id] = item.count;
        });

        // Classify each user keyword
        const analysis = keywords.map((keyword) => {
            const count = countMap[keyword] || 0;
            let classification;
            if (count > 5) {
                classification = 'saturated';
            } else if (count >= 2) {
                classification = 'moderate';
            } else {
                classification = 'unexplored';
            }
            return { keyword, count, classification };
        });

        // Find related keywords from projects that match any of the user keywords
        const relatedResult = await Project.aggregate([
            matchStage,
            {
                $match: { keywords: { $in: keywords } }
            },
            { $unwind: '$keywords' },
            {
                $match: { keywords: { $nin: keywords } }
            },
            {
                $group: {
                    _id: '$keywords',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        const suggestedKeywords = relatedResult.map((item) => item._id);

        res.json({ analysis, suggestedKeywords });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate gap suggestions', error: error.message });
    }
};

module.exports = {
    getKeywordFrequencies,
    getTopicClusters,
    getGapSuggestions
};

const Project = require('../models/Project');

// @desc    Search archived/completed projects in the repository
// @route   GET /api/v1/repository/search
// @access  Private (All authenticated roles)
exports.searchRepository = async (req, res) => {
    try {
        const {
            q,
            year,
            keyword,
            page = 1,
            limit = 20
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
        const skip = (pageNum - 1) * limitNum;

        // Base filter: only archived or final-approved projects
        const filter = {
            status: { $in: ['ARCHIVED', 'FINAL_APPROVED'] }
        };

        // Search by title (case-insensitive regex)
        if (q && q.trim().length > 0) {
            filter.title = { $regex: q.trim(), $options: 'i' };
        }

        // Filter by academic year
        if (year && year.trim().length > 0) {
            filter.academicYear = year.trim();
        }

        // Filter by keyword (match within keywords array)
        if (keyword && keyword.trim().length > 0) {
            filter.keywords = { $in: [new RegExp(keyword.trim(), 'i')] };
        }

        // Role-based field projection
        let projection = null;
        if (req.user.role === 'student') {
            projection = {
                title: 1,
                members: 1,
                adviser: 1,
                academicYear: 1,
                keywords: 1,
                'capstone4.journalVersion': 1,
                createdAt: 1
            };
        }

        const query = Project.find(filter, projection)
            .populate('members', 'firstName lastName')
            .populate('adviser', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const [projects, total] = await Promise.all([
            query.exec(),
            Project.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limitNum);

        return res.status(200).json({
            projects,
            total,
            page: pageNum,
            totalPages
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get aggregation stats for the repository
// @route   GET /api/v1/repository/stats
// @access  Private (Coordinator only)
exports.getRepositoryStats = async (req, res) => {
    try {
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Only coordinators can access repository stats' });
        }

        const matchStage = {
            $match: {
                status: { $in: ['ARCHIVED', 'FINAL_APPROVED'] }
            }
        };

        const [countByYear, countByKeyword, totalResult] = await Promise.all([
            // Group by academic year
            Project.aggregate([
                matchStage,
                {
                    $group: {
                        _id: '$academicYear',
                        count: { $sum: 1 }
                    }
                }
            ]),
            // Unwind keywords, group by keyword, sort by count descending, limit 20
            Project.aggregate([
                matchStage,
                { $unwind: '$keywords' },
                {
                    $group: {
                        _id: '$keywords',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),
            // Total archived count
            Project.aggregate([
                matchStage,
                {
                    $count: 'total'
                }
            ])
        ]);

        const totalArchived = totalResult.length > 0 ? totalResult[0].total : 0;

        return res.status(200).json({
            countByYear,
            countByKeyword,
            totalArchived
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const Project = require('../models/Project');

// Middleware-style role check used by every handler
function assertCoordinator(req, res) {
    if (req.user.role !== 'coordinator') {
        res.status(403).json({ message: 'Access denied. Coordinator role required.' });
        return false;
    }
    return true;
}

// GET  /api/reports/overview
const getOverviewStats = async (req, res) => {
    try {
        if (!assertCoordinator(req, res)) return;

        const [totalResult, byStatus, byPhase, byAcademicYear] = await Promise.all([
            Project.countDocuments(),
            Project.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Project.aggregate([
                { $group: { _id: '$capstonePhase', count: { $sum: 1 } } }
            ]),
            Project.aggregate([
                { $match: { academicYear: { $ne: '' } } },
                { $group: { _id: '$academicYear', count: { $sum: 1 } } }
            ])
        ]);

        res.status(200).json({
            totalProjects: totalResult,
            byStatus,
            byPhase,
            byAcademicYear
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch overview stats.', error: error.message });
    }
};

// GET  /api/reports/by-year
const getProjectsByYear = async (req, res) => {
    try {
        if (!assertCoordinator(req, res)) return;

        const results = await Project.aggregate([
            { $group: { _id: '$academicYear', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch projects by year.', error: error.message });
    }
};

// GET  /api/reports/by-topic
const getProjectsByTopic = async (req, res) => {
    try {
        if (!assertCoordinator(req, res)) return;

        const results = await Project.aggregate([
            { $unwind: '$keywords' },
            { $group: { _id: '$keywords', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 30 }
        ]);

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch projects by topic.', error: error.message });
    }
};

// GET  /api/reports/by-author
const getProjectsByAuthor = async (req, res) => {
    try {
        if (!assertCoordinator(req, res)) return;

        const projects = await Project.find()
            .populate('members', 'firstName lastName email');

        const results = projects.map((project) => ({
            projectId: project._id,
            title: project.title,
            status: project.status,
            members: project.members.map((m) => ({
                name: `${m.firstName} ${m.lastName}`,
                email: m.email
            }))
        }));

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch projects by author.', error: error.message });
    }
};

// GET  /api/reports/export?type=overview|by-year|by-status|all-projects
const exportReport = async (req, res) => {
    try {
        if (!assertCoordinator(req, res)) return;

        const { type } = req.query;

        let csvContent = '';

        if (type === 'overview') {
            const totalProjects = await Project.countDocuments();
            const byStatus = await Project.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            csvContent += 'Metric,Value\n';
            csvContent += `Total Projects,${totalProjects}\n`;
            csvContent += '\nStatus,Count\n';
            for (const row of byStatus) {
                csvContent += `${row._id},${row.count}\n`;
            }
        } else if (type === 'by-year') {
            const results = await Project.aggregate([
                { $group: { _id: '$academicYear', count: { $sum: 1 } } },
                { $sort: { _id: -1 } }
            ]);

            csvContent += 'Academic Year,Count\n';
            for (const row of results) {
                csvContent += `${row._id},${row.count}\n`;
            }
        } else if (type === 'by-status') {
            const results = await Project.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            csvContent += 'Status,Count\n';
            for (const row of results) {
                csvContent += `${row._id},${row.count}\n`;
            }
        } else if (type === 'all-projects') {
            const projects = await Project.find()
                .populate('members', 'firstName lastName email')
                .populate('adviser', 'firstName lastName');

            csvContent += 'Title,Status,Phase,Members,Adviser,Academic Year,Created\n';
            for (const project of projects) {
                const title = `"${(project.title || '').replace(/"/g, '""')}"`;
                const status = project.status || '';
                const phase = project.capstonePhase || '';
                const members = `"${project.members.map((m) => `${m.firstName} ${m.lastName}`).join('; ')}"`;
                const adviser = project.adviser
                    ? `${project.adviser.firstName} ${project.adviser.lastName}`
                    : '';
                const academicYear = project.academicYear || '';
                const created = project.createdAt
                    ? project.createdAt.toISOString()
                    : '';

                csvContent += `${title},${status},${phase},${members},${adviser},${academicYear},${created}\n`;
            }
        } else {
            return res.status(400).json({ message: 'Invalid report type. Use: overview, by-year, by-status, or all-projects.' });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report-${type}.csv"`);
        res.status(200).send(csvContent);
    } catch (error) {
        res.status(500).json({ message: 'Failed to export report.', error: error.message });
    }
};

module.exports = {
    getOverviewStats,
    getProjectsByYear,
    getProjectsByTopic,
    getProjectsByAuthor,
    exportReport
};

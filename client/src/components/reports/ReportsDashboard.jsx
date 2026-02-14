import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BarChart3, Download, Loader2, TrendingUp } from 'lucide-react';

const STATUS_COLORS = {
    PROPOSED: 'tw-bg-slate-500',
    ADVISER_REVIEW: 'tw-bg-amber-500',
    REVISION_REQUIRED: 'tw-bg-orange-500',
    APPROVED_FOR_DEFENSE: 'tw-bg-emerald-500',
    FINAL_SUBMITTED: 'tw-bg-indigo-500',
    ARCHIVED: 'tw-bg-purple-500',
};

const formatStatusLabel = (status) => {
    if (!status) return '';
    return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const ReportsDashboard = ({ showToast }) => {
    const [stats, setStats] = useState({
        totalProjects: 0,
        byStatus: [],
        byPhase: [],
        byAcademicYear: [],
    });
    const [topKeywords, setTopKeywords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const [overviewRes, topicsRes] = await Promise.all([
                api.get('/reports/overview'),
                api.get('/reports/by-topic'),
            ]);
            setStats(overviewRes.data);
            setTopKeywords(topicsRes.data);
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to load reports';
            if (showToast) {
                showToast('error', message);
            }
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleExport = () => {
        const baseURL = api.defaults.baseURL || '/api/v1';
        window.open(`${baseURL}/reports/export?type=all-projects`, '_blank');
    };

    const maxStatusCount = Math.max(
        ...stats.byStatus.map((s) => s.count),
        1
    );

    if (loading) {
        return (
            <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-20 tw-gap-4">
                <Loader2 className="tw-h-10 tw-w-10 tw-animate-spin tw-text-indigo-500" />
                <p className="tw-text-muted-foreground tw-text-sm">Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="tw-space-y-6">
            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between">
                <div className="tw-flex tw-items-center tw-gap-3">
                    <BarChart3 className="tw-h-6 tw-w-6 tw-text-indigo-500" />
                    <h2 className="tw-text-2xl tw-font-bold tw-text-foreground">
                        Analytics Dashboard
                    </h2>
                </div>
                <Button onClick={handleExport} variant="outline">
                    <Download className="tw-h-4 tw-w-4 tw-mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                <Card>
                    <CardHeader className="tw-pb-2">
                        <CardTitle className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                            Total Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="tw-text-3xl tw-font-bold tw-text-foreground">
                            {stats.totalProjects}
                        </div>
                    </CardContent>
                </Card>

                {stats.byPhase.slice(0, 3).map((phase) => (
                    <Card key={phase._id}>
                        <CardHeader className="tw-pb-2">
                            <CardTitle className="tw-text-sm tw-font-medium tw-text-muted-foreground">
                                {formatStatusLabel(phase._id)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="tw-flex tw-items-end tw-gap-2">
                                <span className="tw-text-3xl tw-font-bold tw-text-foreground">
                                    {phase.count}
                                </span>
                                <TrendingUp className="tw-h-4 tw-w-4 tw-text-muted-foreground tw-mb-1" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="tw-text-lg">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    {stats.byStatus.length === 0 ? (
                        <p className="tw-text-muted-foreground tw-text-sm">
                            No status data available.
                        </p>
                    ) : (
                        <div className="tw-space-y-3">
                            {stats.byStatus.map((item) => {
                                const barColor =
                                    STATUS_COLORS[item._id] || 'tw-bg-gray-500';
                                const widthPercent =
                                    (item.count / maxStatusCount) * 100;

                                return (
                                    <div key={item._id} className="tw-space-y-1">
                                        <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
                                            <span className="tw-font-medium tw-text-foreground">
                                                {formatStatusLabel(item._id)}
                                            </span>
                                            <span className="tw-text-muted-foreground tw-tabular-nums">
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="tw-w-full tw-bg-muted tw-rounded-full tw-h-3 tw-overflow-hidden">
                                            <div
                                                className={`tw-h-full tw-rounded-full tw-transition-all tw-duration-500 ${barColor}`}
                                                style={{
                                                    width: `${widthPercent}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
                {/* Projects by Academic Year */}
                <Card>
                    <CardHeader>
                        <CardTitle className="tw-text-lg">
                            Projects by Academic Year
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.byAcademicYear.length === 0 ? (
                            <p className="tw-text-muted-foreground tw-text-sm">
                                No academic year data available.
                            </p>
                        ) : (
                            <div className="tw-overflow-x-auto">
                                <table className="tw-w-full tw-text-sm">
                                    <thead>
                                        <tr className="tw-border-b tw-border-border">
                                            <th className="tw-text-left tw-py-2 tw-px-3 tw-font-semibold tw-text-foreground">
                                                Year
                                            </th>
                                            <th className="tw-text-right tw-py-2 tw-px-3 tw-font-semibold tw-text-foreground">
                                                Count
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.byAcademicYear.map((item) => (
                                            <tr
                                                key={item._id}
                                                className="tw-border-b tw-border-border/50 last:tw-border-0"
                                            >
                                                <td className="tw-py-2 tw-px-3 tw-text-foreground">
                                                    {item._id}
                                                </td>
                                                <td className="tw-py-2 tw-px-3 tw-text-right tw-tabular-nums tw-text-foreground">
                                                    {item.count}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Keywords */}
                <Card>
                    <CardHeader>
                        <CardTitle className="tw-text-lg">Top Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topKeywords.length === 0 ? (
                            <p className="tw-text-muted-foreground tw-text-sm">
                                No keyword data available.
                            </p>
                        ) : (
                            <div className="tw-flex tw-flex-wrap tw-gap-2">
                                {topKeywords.slice(0, 20).map((kw) => (
                                    <div
                                        key={kw._id}
                                        className="tw-flex tw-items-center tw-gap-1.5"
                                    >
                                        <Badge variant="secondary">
                                            {kw._id}
                                        </Badge>
                                        <span className="tw-text-xs tw-text-muted-foreground tw-tabular-nums">
                                            {kw.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportsDashboard;

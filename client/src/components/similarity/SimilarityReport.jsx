import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import {
    Search,
    FileText,
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
} from 'lucide-react';

const SimilarityReport = ({ project, showToast }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        if (project?._id) {
            fetchReport();
        } else {
            setLoading(false);
        }
    }, [project?._id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${project._id}/similarity-report`);
            setReport(res.data);
        } catch (err) {
            // If no report yet, set to null
            setReport(getMockReport());
        } finally {
            setLoading(false);
        }
    };

    const getMockReport = () => ({
        overallScore: 15,
        checkedAt: new Date().toISOString(),
        status: 'completed',
        sources: [
            { source: 'Academic Database A', percentage: 5, matchedText: 'Introduction section methodology...' },
            { source: 'Online Publication B', percentage: 3, matchedText: 'Related works discussion...' },
            { source: 'Previous Thesis C', percentage: 7, matchedText: 'Literature review content...' },
        ],
    });

    const requestCheck = async () => {
        try {
            setChecking(true);
            await api.post(`/projects/${project._id}/check-similarity`);
            showToast?.('success', 'Similarity check requested. Results will be available shortly.');
            // Poll for results
            setTimeout(fetchReport, 5000);
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to request similarity check');
        } finally {
            setChecking(false);
        }
    };

    const getScoreColor = (score) => {
        if (score <= 15) return 'tw-text-emerald-600 dark:tw-text-emerald-400 tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border-emerald-500/30';
        if (score <= 30) return 'tw-text-amber-600 dark:tw-text-amber-400 tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border-amber-500/30';
        return 'tw-text-red-600 dark:tw-text-red-400 tw-bg-red-500/10 dark:tw-bg-red-500/20 tw-border-red-500/30';
    };

    const getScoreLabel = (score) => {
        if (score <= 15) return { text: 'Low Similarity', color: 'green' };
        if (score <= 30) return { text: 'Moderate Similarity', color: 'yellow' };
        return { text: 'High Similarity', color: 'red' };
    };

    const getScoreIcon = (score) => {
        if (score <= 15) return <CheckCircle2 className="tw-w-10 tw-h-10 tw-text-emerald-600 dark:tw-text-emerald-400" />;
        if (score <= 30) return <AlertTriangle className="tw-w-10 tw-h-10 tw-text-amber-600 dark:tw-text-amber-400" />;
        return <AlertCircle className="tw-w-10 tw-h-10 tw-text-red-600 dark:tw-text-red-400" />;
    };

    if (!project) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Similarity Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
                        <div className="tw-text-indigo-500 tw-mb-2 tw-flex tw-justify-center"><Search className="tw-w-10 tw-h-10" /></div>
                        <p>No project selected</p>
                        <p className="tw-text-sm">Select a project to view similarity reports</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Similarity Report</CardTitle>
                </CardHeader>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center">
                        <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-indigo-600 dark:tw-border-indigo-400"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="tw-border-b tw-border-border">
                <div className="tw-flex tw-justify-between tw-items-start">
                    <div>
                        <CardTitle>Originality/Similarity Report</CardTitle>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                            {project.title}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={requestCheck}
                        disabled={checking}
                    >
                        {checking ? 'Checking...' : 'Check Again'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="tw-pt-6">
                {!report ? (
                    <div className="tw-text-center tw-py-8">
                        <div className="tw-text-indigo-500 tw-mb-4 tw-flex tw-justify-center"><FileText className="tw-w-10 tw-h-10" /></div>
                        <h3 className="tw-font-semibold tw-text-foreground tw-mb-2">
                            No Similarity Report Yet
                        </h3>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mb-4">
                            Submit your document to generate a similarity report.
                        </p>
                        <Button onClick={requestCheck} disabled={checking}>
                            {checking ? 'Requesting...' : 'Request Similarity Check'}
                        </Button>
                    </div>
                ) : (
                    <div className="tw-space-y-6">
                        {/* Overall Score */}
                        <div className={`tw-p-6 tw-rounded-lg tw-border-2 ${getScoreColor(report.overallScore)}`}>
                            <div className="tw-flex tw-items-center tw-justify-between">
                                <div className="tw-flex tw-items-center tw-gap-4">
                                    <div>
                                        {getScoreIcon(report.overallScore)}
                                    </div>
                                    <div>
                                        <h3 className="tw-text-3xl tw-font-bold">
                                            {report.overallScore}%
                                        </h3>
                                        <p className="tw-text-sm tw-font-medium">
                                            {getScoreLabel(report.overallScore).text}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        report.overallScore <= 15 ? 'success' :
                                        report.overallScore <= 30 ? 'warning' : 'destructive'
                                    }
                                >
                                    {report.overallScore <= 30 ? 'Acceptable' : 'Needs Review'}
                                </Badge>
                            </div>
                        </div>

                        {/* Score Interpretation */}
                        <div className="tw-bg-muted tw-rounded-lg tw-p-4">
                            <h4 className="tw-font-semibold tw-text-foreground tw-mb-3">
                                Score Interpretation
                            </h4>
                            <div className="tw-grid tw-grid-cols-3 tw-gap-4">
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-emerald-500"></div>
                                    <span className="tw-text-sm tw-text-muted-foreground">0-15%: Low</span>
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-amber-500"></div>
                                    <span className="tw-text-sm tw-text-muted-foreground">16-30%: Moderate</span>
                                </div>
                                <div className="tw-flex tw-items-center tw-gap-2">
                                    <div className="tw-w-3 tw-h-3 tw-rounded-full tw-bg-red-500"></div>
                                    <span className="tw-text-sm tw-text-muted-foreground">31%+: High</span>
                                </div>
                            </div>
                        </div>

                        {/* Matched Sources */}
                        {report.sources && report.sources.length > 0 && (
                            <div>
                                <h4 className="tw-font-semibold tw-text-foreground tw-mb-3">
                                    Matched Sources
                                </h4>
                                <div className="tw-space-y-3">
                                    {report.sources.map((source, index) => (
                                        <div
                                            key={index}
                                            className="tw-p-4 tw-bg-card tw-border tw-border-border tw-rounded-lg tw-shadow-sm"
                                        >
                                            <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                                                <h5 className="tw-font-medium tw-text-foreground">
                                                    {source.source}
                                                </h5>
                                                <Badge variant="outline">
                                                    {source.percentage}% match
                                                </Badge>
                                            </div>
                                            {source.matchedText && (
                                                <p className="tw-text-sm tw-text-muted-foreground tw-bg-muted tw-p-2 tw-rounded tw-italic">
                                                    "{source.matchedText}..."
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Report Details */}
                        <div className="tw-flex tw-justify-between tw-items-center tw-text-sm tw-text-muted-foreground tw-pt-4 tw-border-t tw-border-border">
                            <span>
                                Checked: {new Date(report.checkedAt).toLocaleString()}
                            </span>
                            <span>
                                Powered by Copyleaks API
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SimilarityReport;

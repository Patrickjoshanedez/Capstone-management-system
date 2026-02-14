import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import { FileText, Check, X, MessageSquare, History, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
    draft: { label: 'Draft', classes: 'tw-bg-gray-400 tw-text-white tw-border-transparent' },
    submitted: { label: 'Submitted', classes: 'tw-bg-blue-500 tw-text-white tw-border-transparent' },
    under_review: { label: 'Under Review', classes: 'tw-bg-amber-500 tw-text-white tw-border-transparent' },
    revision_required: { label: 'Revision Required', classes: 'tw-bg-red-500 tw-text-white tw-border-transparent' },
    approved: { label: 'Approved', classes: 'tw-bg-emerald-500 tw-text-white tw-border-transparent' },
};

const PHASE_LABELS = {
    1: 'Phase 1 - Proposal & Design',
    2: 'Phase 2 - Development & Testing',
    3: 'Phase 3 - Final Documentation & Defense',
};

const ChapterReview = ({ project, onUpdate, showToast }) => {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewTarget, setReviewTarget] = useState(null);
    const [versionTarget, setVersionTarget] = useState(null);
    const [versions, setVersions] = useState([]);
    const [versionsLoading, setVersionsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const fetchChapters = useCallback(async () => {
        if (!project?._id) return;
        try {
            setLoading(true);
            const res = await api.get(`/projects/${project._id}/chapters`);
            if (res.data?.success) {
                setChapters(res.data.data || res.data.chapters || []);
            } else {
                setChapters(res.data?.chapters || res.data?.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch chapters:', err);
            showToast?.('error', err.response?.data?.message || 'Failed to load chapters');
            setChapters([]);
        } finally {
            setLoading(false);
        }
    }, [project?._id, showToast]);

    useEffect(() => {
        fetchChapters();
    }, [fetchChapters]);

    const fetchVersions = useCallback(async (chapterId) => {
        try {
            setVersionsLoading(true);
            const res = await api.get(`/projects/${project._id}/chapters/${chapterId}/versions`);
            if (res.data?.success) {
                setVersions(res.data.data || res.data.versions || []);
            } else {
                setVersions(res.data?.versions || res.data?.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch versions:', err);
            showToast?.('error', err.response?.data?.message || 'Failed to load version history');
            setVersions([]);
        } finally {
            setVersionsLoading(false);
        }
    }, [project?._id, showToast]);

    const handleReview = useCallback(async (chapterId, decision) => {
        if (!feedbackText.trim()) {
            showToast?.('error', 'Please provide feedback before submitting your review');
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.patch(`/projects/${project._id}/chapters/${chapterId}/review`, {
                decision,
                feedback: feedbackText.trim(),
            });

            if (res.data) {
                const actionLabel = decision === 'approved' ? 'approved' : 'sent back for revision';
                showToast?.('success', `Chapter ${actionLabel} successfully`);
                setReviewTarget(null);
                setFeedbackText('');
                await fetchChapters();
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    }, [project?._id, feedbackText, showToast, fetchChapters, onUpdate]);

    const toggleVersionHistory = (chapterId) => {
        if (versionTarget === chapterId) {
            setVersionTarget(null);
            setVersions([]);
        } else {
            setVersionTarget(chapterId);
            fetchVersions(chapterId);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStatusBadge = (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
        return (
            <Badge className={config.classes}>
                {config.label}
            </Badge>
        );
    };

    const getChaptersGroupedByPhase = () => {
        const grouped = { 1: [], 2: [], 3: [] };
        chapters.forEach(ch => {
            const phase = ch.capstonePhase || 1;
            if (grouped[phase]) {
                grouped[phase].push(ch);
            }
        });
        // Sort chapters within each phase by chapter number
        Object.keys(grouped).forEach(phase => {
            grouped[phase].sort((a, b) => a.chapterNumber - b.chapterNumber);
        });
        return grouped;
    };

    const getLatestVersion = (chapter) => {
        if (!chapter.versions || chapter.versions.length === 0) return null;
        return chapter.versions[chapter.versions.length - 1];
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Loading chapters for review...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const groupedChapters = getChaptersGroupedByPhase();
    const hasAnyChapters = chapters.length > 0;

    return (
        <Card>
            <CardHeader className="tw-border-b tw-border-border">
                <CardTitle className="tw-flex tw-items-center tw-gap-2">
                    <MessageSquare className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                    Chapter Review
                </CardTitle>
                {hasAnyChapters && (
                    <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                        {chapters.filter(ch => ch.status === 'submitted').length} chapter{chapters.filter(ch => ch.status === 'submitted').length !== 1 ? 's' : ''} awaiting review
                    </p>
                )}
            </CardHeader>

            <CardContent className="tw-p-4">
                {!hasAnyChapters ? (
                    <div className="tw-py-12 tw-text-center">
                        <FileText className="tw-w-12 tw-h-12 tw-text-muted-foreground tw-mx-auto tw-mb-3 tw-opacity-30" />
                        <p className="tw-text-muted-foreground tw-font-medium">
                            No chapters submitted yet
                        </p>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                            Chapters will appear here once the team begins submitting their work.
                        </p>
                    </div>
                ) : (
                    <div className="tw-space-y-6">
                        {[1, 2, 3].map(phase => {
                            const phaseChapters = groupedChapters[phase];
                            if (phaseChapters.length === 0) return null;

                            return (
                                <div key={phase}>
                                    <h3 className="tw-text-sm tw-font-semibold tw-text-foreground tw-mb-3 tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-w-6 tw-h-6 tw-rounded-full tw-bg-indigo-500/10 tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400">
                                            {phase}
                                        </span>
                                        {PHASE_LABELS[phase]}
                                    </h3>

                                    <div className="tw-space-y-3">
                                        {phaseChapters.map(chapter => {
                                            const latestVersion = getLatestVersion(chapter);
                                            const isReviewOpen = reviewTarget === chapter._id;
                                            const isVersionOpen = versionTarget === chapter._id;

                                            return (
                                                <Card key={chapter._id} className="tw-bg-background tw-border-border">
                                                    <CardContent className="tw-p-4">
                                                        {/* Chapter Header */}
                                                        <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                                                            <div className="tw-flex tw-items-start tw-gap-3 tw-flex-1 tw-min-w-0">
                                                                <div className="tw-flex-shrink-0 tw-w-10 tw-h-10 tw-rounded-lg tw-bg-indigo-500/10 tw-flex tw-items-center tw-justify-center">
                                                                    <span className="tw-text-sm tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400">
                                                                        {chapter.chapterNumber}
                                                                    </span>
                                                                </div>
                                                                <div className="tw-flex-1 tw-min-w-0">
                                                                    <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                                                                        <h4 className="tw-text-sm tw-font-semibold tw-text-foreground tw-truncate">
                                                                            Chapter {chapter.chapterNumber}: {chapter.title}
                                                                        </h4>
                                                                        {renderStatusBadge(chapter.status)}
                                                                    </div>
                                                                    <div className="tw-flex tw-items-center tw-gap-4 tw-mt-1.5 tw-text-xs tw-text-muted-foreground">
                                                                        <span>
                                                                            {chapter.versions?.length || 0} version{(chapter.versions?.length || 0) !== 1 ? 's' : ''}
                                                                        </span>
                                                                        {chapter.submittedAt && (
                                                                            <span>Submitted: {formatDate(chapter.submittedAt)}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="tw-flex tw-gap-2 tw-flex-shrink-0">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => toggleVersionHistory(chapter._id)}
                                                                    className="tw-text-xs"
                                                                >
                                                                    <History className="tw-w-4 tw-h-4 tw-mr-1" />
                                                                    Versions
                                                                </Button>

                                                                {chapter.status === 'submitted' && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setReviewTarget(isReviewOpen ? null : chapter._id);
                                                                            setFeedbackText('');
                                                                        }}
                                                                    >
                                                                        <MessageSquare className="tw-w-4 tw-h-4 tw-mr-1" />
                                                                        Review
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Latest Version Link */}
                                                        {latestVersion && (
                                                            <div className="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-text-sm">
                                                                <FileText className="tw-w-4 tw-h-4 tw-text-muted-foreground" />
                                                                <span className="tw-text-muted-foreground">Latest:</span>
                                                                {latestVersion.webViewLink ? (
                                                                    <a
                                                                        href={latestVersion.webViewLink}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline tw-truncate"
                                                                    >
                                                                        View Document (v{chapter.versions?.length || 1})
                                                                    </a>
                                                                ) : (
                                                                    <span className="tw-text-muted-foreground">No link available</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Inline Review Panel */}
                                                        {isReviewOpen && (
                                                            <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-border">
                                                                <h5 className="tw-text-xs tw-font-semibold tw-text-foreground tw-mb-3 tw-flex tw-items-center tw-gap-1">
                                                                    <MessageSquare className="tw-w-3.5 tw-h-3.5 tw-text-indigo-500" />
                                                                    Write Your Review
                                                                </h5>

                                                                {latestVersion?.webViewLink && (
                                                                    <div className="tw-mb-3 tw-p-2 tw-rounded tw-bg-muted/50 tw-text-sm">
                                                                        <a
                                                                            href={latestVersion.webViewLink}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline tw-flex tw-items-center tw-gap-1"
                                                                        >
                                                                            <FileText className="tw-w-4 tw-h-4" />
                                                                            Open submitted document to review
                                                                        </a>
                                                                    </div>
                                                                )}

                                                                <textarea
                                                                    value={feedbackText}
                                                                    onChange={(e) => setFeedbackText(e.target.value)}
                                                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-min-h-[100px] tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                                    placeholder="Provide detailed feedback on this chapter..."
                                                                />

                                                                <div className="tw-flex tw-justify-end tw-gap-2 tw-mt-3">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setReviewTarget(null);
                                                                            setFeedbackText('');
                                                                        }}
                                                                        disabled={submitting}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleReview(chapter._id, 'revision_required')}
                                                                        disabled={submitting || !feedbackText.trim()}
                                                                    >
                                                                        {submitting ? (
                                                                            <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                                                        ) : (
                                                                            <X className="tw-w-4 tw-h-4 tw-mr-1" />
                                                                        )}
                                                                        Request Revision
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleReview(chapter._id, 'approved')}
                                                                        disabled={submitting || !feedbackText.trim()}
                                                                        className="tw-bg-emerald-600 hover:tw-bg-emerald-700 tw-text-white"
                                                                    >
                                                                        {submitting ? (
                                                                            <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                                                        ) : (
                                                                            <Check className="tw-w-4 tw-h-4 tw-mr-1" />
                                                                        )}
                                                                        Approve
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Version History Panel */}
                                                        {isVersionOpen && (
                                                            <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-border">
                                                                <h5 className="tw-text-xs tw-font-semibold tw-text-foreground tw-mb-3 tw-flex tw-items-center tw-gap-1">
                                                                    <History className="tw-w-3.5 tw-h-3.5 tw-text-indigo-500" />
                                                                    Version History
                                                                </h5>

                                                                {versionsLoading ? (
                                                                    <div className="tw-flex tw-items-center tw-gap-2 tw-py-3">
                                                                        <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-text-indigo-500" />
                                                                        <span className="tw-text-sm tw-text-muted-foreground">Loading versions...</span>
                                                                    </div>
                                                                ) : versions.length === 0 ? (
                                                                    <p className="tw-text-sm tw-text-muted-foreground tw-py-2">
                                                                        No versions uploaded yet.
                                                                    </p>
                                                                ) : (
                                                                    <div className="tw-space-y-2">
                                                                        {versions.map((version, idx) => (
                                                                            <div
                                                                                key={version._id || idx}
                                                                                className="tw-flex tw-items-center tw-justify-between tw-p-2 tw-rounded tw-bg-muted/50 tw-text-sm"
                                                                            >
                                                                                <div className="tw-flex tw-items-center tw-gap-2">
                                                                                    <Badge className="tw-bg-gray-400 tw-text-white tw-border-transparent tw-text-xs">
                                                                                        v{versions.length - idx}
                                                                                    </Badge>
                                                                                    <span className="tw-text-muted-foreground">
                                                                                        {formatDate(version.uploadedAt || version.createdAt)}
                                                                                    </span>
                                                                                </div>
                                                                                {version.webViewLink && (
                                                                                    <a
                                                                                        href={version.webViewLink}
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                        className="tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline tw-text-xs tw-flex tw-items-center tw-gap-1"
                                                                                    >
                                                                                        <FileText className="tw-w-3.5 tw-h-3.5" />
                                                                                        View
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Feedback History */}
                                                        {chapter.feedback && chapter.feedback.length > 0 && (
                                                            <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-border">
                                                                <h5 className="tw-text-xs tw-font-semibold tw-text-foreground tw-mb-2 tw-flex tw-items-center tw-gap-1">
                                                                    <MessageSquare className="tw-w-3.5 tw-h-3.5 tw-text-amber-500" />
                                                                    Feedback History
                                                                </h5>
                                                                <div className="tw-space-y-2">
                                                                    {chapter.feedback.map((fb, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="tw-rounded tw-bg-muted/50 tw-p-3 tw-text-sm"
                                                                        >
                                                                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                                                                                <span className="tw-font-medium tw-text-foreground tw-text-xs">
                                                                                    {fb.reviewerName || 'Adviser'}
                                                                                </span>
                                                                                <div className="tw-flex tw-items-center tw-gap-2">
                                                                                    {fb.decision && (
                                                                                        <Badge className={`tw-text-xs ${
                                                                                            fb.decision === 'approved'
                                                                                                ? 'tw-bg-emerald-500 tw-text-white tw-border-transparent'
                                                                                                : 'tw-bg-red-500 tw-text-white tw-border-transparent'
                                                                                        }`}>
                                                                                            {fb.decision === 'approved' ? 'Approved' : 'Revision'}
                                                                                        </Badge>
                                                                                    )}
                                                                                    <span className="tw-text-xs tw-text-muted-foreground">
                                                                                        {formatDate(fb.date || fb.createdAt)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <p className="tw-text-muted-foreground tw-whitespace-pre-wrap">
                                                                                {fb.comment || fb.message || fb.text}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ChapterReview;

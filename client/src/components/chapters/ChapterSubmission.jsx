import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import { FileText, Upload, Plus, Check, AlertCircle, Loader2 } from 'lucide-react';

const PHASE_LABELS = {
    1: 'Phase 1 - Proposal & Design',
    2: 'Phase 2 - Development & Testing',
    3: 'Phase 3 - Final Documentation & Defense',
};

const STATUS_CONFIG = {
    draft: { label: 'Draft', classes: 'tw-bg-gray-400 tw-text-white tw-border-transparent' },
    submitted: { label: 'Submitted', classes: 'tw-bg-blue-500 tw-text-white tw-border-transparent' },
    under_review: { label: 'Under Review', classes: 'tw-bg-amber-500 tw-text-white tw-border-transparent' },
    revision_required: { label: 'Revision Required', classes: 'tw-bg-red-500 tw-text-white tw-border-transparent' },
    approved: { label: 'Approved', classes: 'tw-bg-emerald-500 tw-text-white tw-border-transparent' },
};

const ChapterSubmission = ({ project, onUpdate, showToast }) => {
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePhase, setActivePhase] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [uploadTarget, setUploadTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // New chapter form state
    const [newChapter, setNewChapter] = useState({
        capstonePhase: 1,
        chapterNumber: '',
        title: '',
    });

    // Upload form state
    const [uploadForm, setUploadForm] = useState({
        fileId: '',
        webViewLink: '',
    });

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

    const handleCreateChapter = useCallback(async (e) => {
        e.preventDefault();

        if (!newChapter.chapterNumber || !newChapter.title.trim()) {
            showToast?.('error', 'Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post(`/projects/${project._id}/chapters`, {
                capstonePhase: newChapter.capstonePhase,
                chapterNumber: Number(newChapter.chapterNumber),
                title: newChapter.title.trim(),
            });

            if (res.data) {
                showToast?.('success', 'Chapter created successfully');
                setShowAddForm(false);
                setNewChapter({ capstonePhase: activePhase, chapterNumber: '', title: '' });
                await fetchChapters();
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to create chapter');
        } finally {
            setSubmitting(false);
        }
    }, [project?._id, newChapter, activePhase, showToast, fetchChapters, onUpdate]);

    const handleUploadVersion = useCallback(async (chapterId) => {
        if (!uploadForm.fileId.trim() || !uploadForm.webViewLink.trim()) {
            showToast?.('error', 'Please provide both File ID and Web View Link');
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post(`/projects/${project._id}/chapters/${chapterId}/upload`, {
                fileId: uploadForm.fileId.trim(),
                webViewLink: uploadForm.webViewLink.trim(),
            });

            if (res.data) {
                showToast?.('success', 'New version uploaded successfully');
                setUploadTarget(null);
                setUploadForm({ fileId: '', webViewLink: '' });
                await fetchChapters();
                if (onUpdate) onUpdate();
            }
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to upload version');
        } finally {
            setSubmitting(false);
        }
    }, [project?._id, uploadForm, showToast, fetchChapters, onUpdate]);

    const getChaptersByPhase = (phase) => {
        return chapters
            .filter(ch => ch.capstonePhase === phase)
            .sort((a, b) => a.chapterNumber - b.chapterNumber);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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

    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Loading chapters...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="tw-border-b tw-border-border">
                <div className="tw-flex tw-justify-between tw-items-center">
                    <CardTitle className="tw-flex tw-items-center tw-gap-2">
                        <FileText className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        Chapter Submissions
                    </CardTitle>
                    <Button
                        size="sm"
                        onClick={() => {
                            setNewChapter({ capstonePhase: activePhase, chapterNumber: '', title: '' });
                            setShowAddForm(true);
                        }}
                    >
                        <Plus className="tw-w-4 tw-h-4 tw-mr-1" />
                        Add Chapter
                    </Button>
                </div>

                {/* Phase Tabs */}
                <div className="tw-flex tw-gap-2 tw-mt-4">
                    {[1, 2, 3].map(phase => (
                        <button
                            key={phase}
                            onClick={() => setActivePhase(phase)}
                            className={`tw-px-3 tw-py-1.5 tw-text-sm tw-rounded-md tw-transition-colors tw-font-medium
                                ${activePhase === phase
                                    ? 'tw-bg-indigo-500 tw-text-white'
                                    : 'tw-text-muted-foreground hover:tw-bg-muted'
                                }`}
                        >
                            Phase {phase}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="tw-p-4 tw-space-y-4">
                {/* Phase Description */}
                <p className="tw-text-sm tw-text-muted-foreground tw-font-medium">
                    {PHASE_LABELS[activePhase]}
                </p>

                {/* Add Chapter Form */}
                {showAddForm && (
                    <Card className="tw-bg-muted/30 tw-border-border tw-border-dashed">
                        <CardContent className="tw-p-4">
                            <form onSubmit={handleCreateChapter} className="tw-space-y-3">
                                <h4 className="tw-text-sm tw-font-semibold tw-text-foreground tw-flex tw-items-center tw-gap-2">
                                    <Plus className="tw-w-4 tw-h-4 tw-text-indigo-500" />
                                    New Chapter
                                </h4>

                                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
                                    <div>
                                        <label className="tw-text-xs tw-text-muted-foreground tw-font-medium">
                                            Capstone Phase
                                        </label>
                                        <select
                                            value={newChapter.capstonePhase}
                                            onChange={(e) => setNewChapter(prev => ({
                                                ...prev,
                                                capstonePhase: Number(e.target.value),
                                            }))}
                                            className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                        >
                                            <option value={1}>Phase 1</option>
                                            <option value={2}>Phase 2</option>
                                            <option value={3}>Phase 3</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="tw-text-xs tw-text-muted-foreground tw-font-medium">
                                            Chapter Number
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newChapter.chapterNumber}
                                            onChange={(e) => setNewChapter(prev => ({
                                                ...prev,
                                                chapterNumber: e.target.value,
                                            }))}
                                            className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                            placeholder="e.g., 1"
                                        />
                                    </div>

                                    <div>
                                        <label className="tw-text-xs tw-text-muted-foreground tw-font-medium">
                                            Chapter Title
                                        </label>
                                        <input
                                            type="text"
                                            value={newChapter.title}
                                            onChange={(e) => setNewChapter(prev => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))}
                                            className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                            placeholder="e.g., Introduction"
                                        />
                                    </div>
                                </div>

                                <div className="tw-flex tw-justify-end tw-gap-2 tw-pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAddForm(false)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                        ) : (
                                            <Plus className="tw-w-4 tw-h-4 tw-mr-1" />
                                        )}
                                        {submitting ? 'Creating...' : 'Create Chapter'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Chapter List */}
                {getChaptersByPhase(activePhase).length === 0 ? (
                    <div className="tw-py-12 tw-text-center">
                        <FileText className="tw-w-12 tw-h-12 tw-text-muted-foreground tw-mx-auto tw-mb-3 tw-opacity-30" />
                        <p className="tw-text-muted-foreground tw-font-medium">
                            No chapters for Phase {activePhase} yet
                        </p>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                            Click "Add Chapter" to create your first chapter in this phase.
                        </p>
                    </div>
                ) : (
                    <div className="tw-space-y-3">
                        {getChaptersByPhase(activePhase).map(chapter => (
                            <Card key={chapter._id} className="tw-bg-background tw-border-border">
                                <CardContent className="tw-p-4">
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
                                                    <span className="tw-flex tw-items-center tw-gap-1">
                                                        <Upload className="tw-w-3 tw-h-3" />
                                                        {chapter.versions?.length || 0} version{(chapter.versions?.length || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                    {chapter.submittedAt && (
                                                        <span>Submitted: {formatDate(chapter.submittedAt)}</span>
                                                    )}
                                                    {chapter.updatedAt && (
                                                        <span>Updated: {formatDate(chapter.updatedAt)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setUploadTarget(uploadTarget === chapter._id ? null : chapter._id);
                                                setUploadForm({ fileId: '', webViewLink: '' });
                                            }}
                                            className="tw-flex-shrink-0"
                                        >
                                            <Upload className="tw-w-4 tw-h-4 tw-mr-1" />
                                            Upload Version
                                        </Button>
                                    </div>

                                    {/* Upload Version Form */}
                                    {uploadTarget === chapter._id && (
                                        <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-border">
                                            <h5 className="tw-text-xs tw-font-semibold tw-text-foreground tw-mb-3 tw-flex tw-items-center tw-gap-1">
                                                <Upload className="tw-w-3.5 tw-h-3.5 tw-text-indigo-500" />
                                                Upload New Version
                                            </h5>
                                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-3">
                                                <div>
                                                    <label className="tw-text-xs tw-text-muted-foreground tw-font-medium">
                                                        Google Drive File ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={uploadForm.fileId}
                                                        onChange={(e) => setUploadForm(prev => ({
                                                            ...prev,
                                                            fileId: e.target.value,
                                                        }))}
                                                        className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="Enter file ID from Google Drive"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="tw-text-xs tw-text-muted-foreground tw-font-medium">
                                                        Web View Link
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={uploadForm.webViewLink}
                                                        onChange={(e) => setUploadForm(prev => ({
                                                            ...prev,
                                                            webViewLink: e.target.value,
                                                        }))}
                                                        className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="https://docs.google.com/..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="tw-flex tw-justify-end tw-gap-2 tw-mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setUploadTarget(null)}
                                                    disabled={submitting}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUploadVersion(chapter._id)}
                                                    disabled={submitting}
                                                >
                                                    {submitting ? (
                                                        <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                                    ) : (
                                                        <Upload className="tw-w-4 tw-h-4 tw-mr-1" />
                                                    )}
                                                    {submitting ? 'Uploading...' : 'Upload'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Feedback Section */}
                                    {chapter.feedback && chapter.feedback.length > 0 && (
                                        <div className="tw-mt-4 tw-pt-4 tw-border-t tw-border-border">
                                            <h5 className="tw-text-xs tw-font-semibold tw-text-foreground tw-mb-2 tw-flex tw-items-center tw-gap-1">
                                                <AlertCircle className="tw-w-3.5 tw-h-3.5 tw-text-amber-500" />
                                                Adviser Feedback
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
                                                            <span className="tw-text-xs tw-text-muted-foreground">
                                                                {formatDate(fb.date || fb.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="tw-text-muted-foreground tw-whitespace-pre-wrap">
                                                            {fb.comment || fb.message || fb.text}
                                                        </p>
                                                        {fb.decision && (
                                                            <Badge className={`tw-mt-2 ${
                                                                fb.decision === 'approved'
                                                                    ? 'tw-bg-emerald-500 tw-text-white tw-border-transparent'
                                                                    : 'tw-bg-red-500 tw-text-white tw-border-transparent'
                                                            }`}>
                                                                {fb.decision === 'approved' ? (
                                                                    <><Check className="tw-w-3 tw-h-3 tw-mr-1" /> Approved</>
                                                                ) : (
                                                                    <><AlertCircle className="tw-w-3 tw-h-3 tw-mr-1" /> Revision Required</>
                                                                )}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ChapterSubmission;

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Plus, Trash2, Edit2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog';

const TARGET_STATUSES = [
    { value: 'CHAPTER_1_DRAFT', label: 'Chapter 1 - Draft' },
    { value: 'CHAPTER_1_REVIEW', label: 'Chapter 1 - Review' },
    { value: 'CHAPTER_2_DRAFT', label: 'Chapter 2 - Draft' },
    { value: 'CHAPTER_2_REVIEW', label: 'Chapter 2 - Review' },
    { value: 'CHAPTER_3_DRAFT', label: 'Chapter 3 - Draft' },
    { value: 'CHAPTER_3_REVIEW', label: 'Chapter 3 - Review' },
    { value: 'PROPOSAL_CONSOLIDATION', label: 'Proposal Consolidation' },
    { value: 'PROPOSAL_DEFENSE', label: 'Proposal Defense' },
    { value: 'CAPSTONE2_IN_PROGRESS', label: 'Capstone 2 - In Progress' },
    { value: 'CAPSTONE2_REVIEW', label: 'Capstone 2 - Review' },
    { value: 'CAPSTONE3_IN_PROGRESS', label: 'Capstone 3 - In Progress' },
    { value: 'CAPSTONE3_REVIEW', label: 'Capstone 3 - Review' },
    { value: 'FINAL_COMPILATION', label: 'Final Compilation' },
    { value: 'PLAGIARISM_CHECK', label: 'Plagiarism Check' },
    { value: 'FINAL_DEFENSE', label: 'Final Defense' },
    { value: 'CREDENTIAL_UPLOAD', label: 'Credential Upload' },
];

const PHASE_LABELS = {
    1: 'Phase 1 - Proposal',
    2: 'Phase 2 - Development',
    3: 'Phase 3 - Testing & Review',
    4: 'Phase 4 - Final Defense & Completion',
};

const getDeadlineStatus = (dueDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffMs = due - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { label: 'Overdue', variant: 'overdue', days: diffDays };
    }
    if (diffDays <= 7) {
        return { label: 'Due Soon', variant: 'dueSoon', days: diffDays };
    }
    return { label: 'On Track', variant: 'onTrack', days: diffDays };
};

const formatTargetStatus = (status) => {
    const found = TARGET_STATUSES.find((s) => s.value === status);
    return found ? found.label : status;
};

const DeadlineManager = ({ user, showToast }) => {
    const [deadlines, setDeadlines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState(null);
    const [saving, setSaving] = useState(false);

    const defaultForm = {
        title: '',
        description: '',
        capstonePhase: '1',
        targetStatus: '',
        dueDate: '',
        academicYear: '',
    };
    const [form, setForm] = useState(defaultForm);

    const fetchDeadlines = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/deadlines');
            if (res.data?.success) {
                setDeadlines(res.data.data || []);
            } else if (Array.isArray(res.data)) {
                setDeadlines(res.data);
            } else {
                setDeadlines(res.data?.data || res.data?.deadlines || []);
            }
        } catch (err) {
            console.error('Fetch deadlines error:', err);
            setDeadlines([]);
            showToast?.('error', 'Failed to load deadlines');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDeadlines();
    }, [fetchDeadlines]);

    const openCreateDialog = () => {
        setEditingDeadline(null);
        setForm(defaultForm);
        setCreateOpen(true);
    };

    const openEditDialog = (deadline) => {
        setEditingDeadline(deadline);
        setForm({
            title: deadline.title || '',
            description: deadline.description || '',
            capstonePhase: String(deadline.capstonePhase || '1'),
            targetStatus: deadline.targetStatus || '',
            dueDate: deadline.dueDate ? deadline.dueDate.split('T')[0] : '',
            academicYear: deadline.academicYear || '',
        });
        setCreateOpen(true);
    };

    const closeDialog = () => {
        setCreateOpen(false);
        setEditingDeadline(null);
        setForm(defaultForm);
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            showToast?.('error', 'Title is required');
            return;
        }
        if (!form.dueDate) {
            showToast?.('error', 'Due date is required');
            return;
        }

        const payload = {
            ...form,
            capstonePhase: Number(form.capstonePhase),
        };

        try {
            setSaving(true);
            if (editingDeadline) {
                const res = await api.put(`/deadlines/${editingDeadline._id}`, payload);
                if (res.data?.success || res.status === 200) {
                    showToast?.('success', 'Deadline updated successfully');
                }
            } else {
                const res = await api.post('/deadlines', payload);
                if (res.data?.success || res.status === 201) {
                    showToast?.('success', 'Deadline created successfully');
                }
            }
            closeDialog();
            fetchDeadlines();
        } catch (err) {
            console.error('Save deadline error:', err);
            showToast?.('error', err.response?.data?.message || 'Failed to save deadline');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (deadlineId) => {
        const confirmed = window.confirm('Are you sure you want to delete this deadline? This action cannot be undone.');
        if (!confirmed) return;

        try {
            const res = await api.delete(`/deadlines/${deadlineId}`);
            if (res.data?.success || res.status === 200) {
                showToast?.('success', 'Deadline deleted successfully');
                setDeadlines((prev) => prev.filter((d) => d._id !== deadlineId));
            }
        } catch (err) {
            console.error('Delete deadline error:', err);
            showToast?.('error', err.response?.data?.message || 'Failed to delete deadline');
        }
    };

    const isCoordinator = user?.role === 'coordinator';

    // Group deadlines by capstonePhase
    const groupedDeadlines = deadlines.reduce((acc, deadline) => {
        const phase = deadline.capstonePhase || 1;
        if (!acc[phase]) acc[phase] = [];
        acc[phase].push(deadline);
        return acc;
    }, {});

    // Sort deadlines within each phase by dueDate
    Object.keys(groupedDeadlines).forEach((phase) => {
        groupedDeadlines[phase].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    });

    const inputClasses =
        'tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500';

    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Loading deadlines...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="tw-space-y-6">
            {/* Header */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <div className="tw-flex tw-justify-between tw-items-center">
                        <CardTitle className="tw-flex tw-items-center tw-gap-2">
                            <Calendar className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                            Deadline Manager
                        </CardTitle>
                        {isCoordinator && (
                            <Button onClick={openCreateDialog} className="tw-gap-2">
                                <Plus className="tw-w-4 tw-h-4" />
                                Add Deadline
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="tw-pt-4">
                    <p className="tw-text-sm tw-text-muted-foreground">
                        {isCoordinator
                            ? 'Manage capstone deadlines for all phases. Students and advisers can view these deadlines on their dashboards.'
                            : 'View upcoming capstone deadlines and milestones for all phases.'}
                    </p>
                </CardContent>
            </Card>

            {/* Deadlines grouped by phase */}
            {deadlines.length === 0 ? (
                <Card>
                    <CardContent className="tw-py-12 tw-text-center">
                        <Calendar className="tw-w-12 tw-h-12 tw-text-muted-foreground tw-mx-auto tw-mb-3 tw-opacity-30" />
                        <p className="tw-text-lg tw-font-medium tw-text-foreground">No Deadlines Set</p>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                            {isCoordinator
                                ? 'Get started by adding your first deadline.'
                                : 'No deadlines have been set by the coordinator yet.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                [1, 2, 3, 4].map((phase) => {
                    const phaseDeadlines = groupedDeadlines[phase];
                    if (!phaseDeadlines || phaseDeadlines.length === 0) return null;

                    return (
                        <Card key={phase} className="tw-bg-card tw-border-border">
                            <CardHeader className="tw-pb-3 tw-border-b tw-border-border">
                                <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                    <Clock className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                                    {PHASE_LABELS[phase] || `Phase ${phase}`}
                                    <Badge variant="secondary" className="tw-ml-2">
                                        {phaseDeadlines.length} deadline{phaseDeadlines.length !== 1 ? 's' : ''}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="tw-pt-4">
                                <div className="tw-space-y-3">
                                    {phaseDeadlines.map((deadline) => {
                                        const status = getDeadlineStatus(deadline.dueDate);
                                        const dueFormatted = new Date(deadline.dueDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        });

                                        return (
                                            <div
                                                key={deadline._id}
                                                className="tw-flex tw-items-start tw-justify-between tw-gap-4 tw-p-4 tw-rounded-lg tw-border tw-border-border tw-bg-background tw-transition-colors hover:tw-bg-muted/50"
                                            >
                                                <div className="tw-flex-1 tw-min-w-0">
                                                    <div className="tw-flex tw-items-center tw-gap-2 tw-flex-wrap">
                                                        <h4 className="tw-text-sm tw-font-semibold tw-text-foreground">
                                                            {deadline.title}
                                                        </h4>
                                                        {/* Status badge */}
                                                        {status.variant === 'overdue' && (
                                                            <Badge className="tw-border-transparent tw-bg-red-500 tw-text-white hover:tw-bg-red-600">
                                                                <AlertTriangle className="tw-w-3 tw-h-3 tw-mr-1" />
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                        {status.variant === 'dueSoon' && (
                                                            <Badge className="tw-border-transparent tw-bg-amber-500 tw-text-white hover:tw-bg-amber-600">
                                                                <Clock className="tw-w-3 tw-h-3 tw-mr-1" />
                                                                Due Soon
                                                            </Badge>
                                                        )}
                                                        {status.variant === 'onTrack' && (
                                                            <Badge className="tw-border-transparent tw-bg-emerald-500 tw-text-white hover:tw-bg-emerald-600">
                                                                On Track
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {deadline.description && (
                                                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1 tw-line-clamp-2">
                                                            {deadline.description}
                                                        </p>
                                                    )}

                                                    <div className="tw-flex tw-items-center tw-gap-4 tw-mt-2 tw-flex-wrap">
                                                        <span className="tw-text-xs tw-text-muted-foreground tw-flex tw-items-center tw-gap-1">
                                                            <Calendar className="tw-w-3 tw-h-3" />
                                                            {dueFormatted}
                                                        </span>
                                                        {deadline.targetStatus && (
                                                            <Badge variant="outline" className="tw-text-xs">
                                                                {formatTargetStatus(deadline.targetStatus)}
                                                            </Badge>
                                                        )}
                                                        {deadline.academicYear && (
                                                            <span className="tw-text-xs tw-text-muted-foreground">
                                                                AY: {deadline.academicYear}
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`tw-text-xs tw-font-medium ${
                                                                status.variant === 'overdue'
                                                                    ? 'tw-text-red-600 dark:tw-text-red-400'
                                                                    : status.variant === 'dueSoon'
                                                                    ? 'tw-text-amber-600 dark:tw-text-amber-400'
                                                                    : 'tw-text-emerald-600 dark:tw-text-emerald-400'
                                                            }`}
                                                        >
                                                            {status.days === 0
                                                                ? 'Due today'
                                                                : status.days > 0
                                                                ? `${status.days} day${status.days !== 1 ? 's' : ''} remaining`
                                                                : `${Math.abs(status.days)} day${Math.abs(status.days) !== 1 ? 's' : ''} overdue`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Coordinator actions */}
                                                {isCoordinator && (
                                                    <div className="tw-flex tw-items-center tw-gap-1 tw-flex-shrink-0">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openEditDialog(deadline)}
                                                            className="tw-h-8 tw-w-8 tw-text-muted-foreground hover:tw-text-foreground"
                                                        >
                                                            <Edit2 className="tw-w-4 tw-h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(deadline._id)}
                                                            className="tw-h-8 tw-w-8 tw-text-muted-foreground hover:tw-text-red-600 dark:hover:tw-text-red-400"
                                                        >
                                                            <Trash2 className="tw-w-4 tw-h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={createOpen} onOpenChange={closeDialog}>
                <DialogContent className="tw-max-w-lg tw-bg-card tw-border-border">
                    <DialogHeader>
                        <DialogTitle className="tw-text-foreground">
                            {editingDeadline ? 'Edit Deadline' : 'Create New Deadline'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="tw-space-y-4 tw-mt-2">
                        {/* Title */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Title <span className="tw-text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => handleFormChange('title', e.target.value)}
                                className={`${inputClasses} tw-mt-1`}
                                placeholder="e.g., Chapter 1 Draft Submission"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                className={`${inputClasses} tw-mt-1 tw-min-h-[80px] tw-resize-y`}
                                placeholder="Optional details about this deadline..."
                            />
                        </div>

                        {/* Capstone Phase */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Capstone Phase</label>
                            <select
                                value={form.capstonePhase}
                                onChange={(e) => handleFormChange('capstonePhase', e.target.value)}
                                className={`${inputClasses} tw-mt-1`}
                            >
                                <option value="1">Phase 1 - Proposal</option>
                                <option value="2">Phase 2 - Development</option>
                                <option value="3">Phase 3 - Testing & Review</option>
                                <option value="4">Phase 4 - Final Defense & Completion</option>
                            </select>
                        </div>

                        {/* Target Status */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Target Status</label>
                            <select
                                value={form.targetStatus}
                                onChange={(e) => handleFormChange('targetStatus', e.target.value)}
                                className={`${inputClasses} tw-mt-1`}
                            >
                                <option value="">Select a target status</option>
                                {TARGET_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Due Date <span className="tw-text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.dueDate}
                                onChange={(e) => handleFormChange('dueDate', e.target.value)}
                                className={`${inputClasses} tw-mt-1`}
                            />
                        </div>

                        {/* Academic Year */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">Academic Year</label>
                            <input
                                type="text"
                                value={form.academicYear}
                                onChange={(e) => handleFormChange('academicYear', e.target.value)}
                                className={`${inputClasses} tw-mt-1`}
                                placeholder="e.g., 2025-2026"
                            />
                        </div>
                    </div>

                    <DialogFooter className="tw-mt-6 tw-gap-2">
                        <Button variant="outline" onClick={closeDialog} disabled={saving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                        >
                            {saving && <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />}
                            {editingDeadline ? 'Update Deadline' : 'Create Deadline'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DeadlineManager;

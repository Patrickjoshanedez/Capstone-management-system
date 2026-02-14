import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../ui/dialog';
import {
    FileText,
    Upload,
    Shield,
    Award,
    AlertTriangle,
    ExternalLink,
    Loader2,
    Plus,
} from 'lucide-react';

const CREDENTIAL_TYPES = [
    { value: 'clearance', label: 'Clearance' },
    { value: 'panel_approval', label: 'Panel Approval' },
    { value: 'ethics_review', label: 'Ethics Review' },
    { value: 'hardbound_receipt', label: 'Hardbound Receipt' },
    { value: 'other', label: 'Other' },
];

const FinalSubmission = ({ project, onUpdate, showToast, user }) => {
    const [capstone4Data, setCapstone4Data] = useState(null);
    const [loading, setLoading] = useState(true);

    // Academic version form state
    const [academicForm, setAcademicForm] = useState({ fileId: '', webViewLink: '' });
    const [submittingAcademic, setSubmittingAcademic] = useState(false);

    // Journal version form state
    const [journalForm, setJournalForm] = useState({ fileId: '', webViewLink: '' });
    const [submittingJournal, setSubmittingJournal] = useState(false);

    // Plagiarism check state
    const [runningPlagiarismCheck, setRunningPlagiarismCheck] = useState(false);

    // Credential dialog state
    const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
    const [credentialForm, setCredentialForm] = useState({
        type: 'clearance',
        name: '',
        fileId: '',
        webViewLink: '',
    });
    const [submittingCredential, setSubmittingCredential] = useState(false);

    const isStudent = user?.role === 'student';
    const isCoordinator = user?.role === 'coordinator';

    const fetchCapstone4Data = useCallback(async () => {
        if (!project?._id) return;
        setLoading(true);
        try {
            const response = await api.get(`/projects/${project._id}/capstone4`);
            setCapstone4Data(response.data);
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to load Capstone 4 data.');
        } finally {
            setLoading(false);
        }
    }, [project?._id, showToast]);

    useEffect(() => {
        fetchCapstone4Data();
    }, [fetchCapstone4Data]);

    // ---------- Academic Version ----------
    const handleAcademicSubmit = async (e) => {
        e.preventDefault();
        if (!academicForm.fileId || !academicForm.webViewLink) {
            showToast?.('error', 'Please provide both the File ID and the Google Drive link.');
            return;
        }
        setSubmittingAcademic(true);
        try {
            await api.post(`/projects/${project._id}/capstone4/academic`, academicForm);
            showToast?.('success', 'Academic version uploaded successfully.');
            setAcademicForm({ fileId: '', webViewLink: '' });
            await fetchCapstone4Data();
            onUpdate?.();
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to upload academic version.');
        } finally {
            setSubmittingAcademic(false);
        }
    };

    // ---------- Journal Version ----------
    const handleJournalSubmit = async (e) => {
        e.preventDefault();
        if (!journalForm.fileId || !journalForm.webViewLink) {
            showToast?.('error', 'Please provide both the File ID and the Google Drive link.');
            return;
        }
        setSubmittingJournal(true);
        try {
            await api.post(`/projects/${project._id}/capstone4/journal`, journalForm);
            showToast?.('success', 'Journal version uploaded successfully.');
            setJournalForm({ fileId: '', webViewLink: '' });
            await fetchCapstone4Data();
            onUpdate?.();
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to upload journal version.');
        } finally {
            setSubmittingJournal(false);
        }
    };

    // ---------- Plagiarism Check ----------
    const handlePlagiarismCheck = async () => {
        setRunningPlagiarismCheck(true);
        try {
            await api.post(`/projects/${project._id}/capstone4/plagiarism-check`);
            showToast?.('success', 'Plagiarism check initiated successfully.');
            await fetchCapstone4Data();
            onUpdate?.();
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to run plagiarism check.');
        } finally {
            setRunningPlagiarismCheck(false);
        }
    };

    // ---------- Credentials ----------
    const handleCredentialSubmit = async (e) => {
        e.preventDefault();
        if (!credentialForm.type || !credentialForm.name || !credentialForm.fileId || !credentialForm.webViewLink) {
            showToast?.('error', 'Please fill in all credential fields.');
            return;
        }
        setSubmittingCredential(true);
        try {
            await api.post(`/projects/${project._id}/capstone4/credentials`, credentialForm);
            showToast?.('success', 'Credential uploaded successfully.');
            setCredentialForm({ type: 'clearance', name: '', fileId: '', webViewLink: '' });
            setCredentialDialogOpen(false);
            await fetchCapstone4Data();
            onUpdate?.();
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Failed to upload credential.');
        } finally {
            setSubmittingCredential(false);
        }
    };

    // ---------- Helpers ----------
    const getPlagiarismBadge = (status) => {
        switch (status) {
            case 'clear':
                return (
                    <Badge className="tw-bg-emerald-500 tw-text-white tw-border-transparent">
                        Clear
                    </Badge>
                );
            case 'flagged':
                return (
                    <Badge className="tw-bg-red-500 tw-text-white tw-border-transparent">
                        Flagged
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge className="tw-bg-amber-500 tw-text-white tw-border-transparent">
                        Pending
                    </Badge>
                );
        }
    };

    const getVerdictBadge = (result) => {
        switch (result) {
            case 'passed':
                return (
                    <Badge className="tw-bg-emerald-500 tw-text-white tw-border-transparent">
                        Passed
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="tw-bg-red-500 tw-text-white tw-border-transparent">
                        Failed
                    </Badge>
                );
            case 'conditional':
                return (
                    <Badge className="tw-bg-amber-500 tw-text-white tw-border-transparent">
                        Conditional
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        {result || 'Unknown'}
                    </Badge>
                );
        }
    };

    const getCredentialTypeLabel = (type) => {
        const found = CREDENTIAL_TYPES.find((ct) => ct.value === type);
        return found ? found.label : type;
    };

    // ---------- Loading / Empty ----------
    if (loading) {
        return (
            <Card>
                <CardContent className="tw-py-12">
                    <div className="tw-flex tw-items-center tw-justify-center tw-gap-3 tw-text-muted-foreground">
                        <Loader2 className="tw-w-5 tw-h-5 tw-animate-spin" />
                        <span>Loading Capstone 4 data...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="tw-space-y-6">
            {/* ===== Academic Version Upload ===== */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <FileText className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        <CardTitle>Academic Version</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="tw-pt-6">
                    {capstone4Data?.academicVersion?.webViewLink ? (
                        <div className="tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border">
                            <div className="tw-flex tw-items-center tw-justify-between">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <FileText className="tw-w-6 tw-h-6 tw-text-indigo-500" />
                                    <div>
                                        <h4 className="tw-font-medium tw-text-foreground">
                                            Academic Version Uploaded
                                        </h4>
                                        <p className="tw-text-sm tw-text-muted-foreground">
                                            File ID: {capstone4Data.academicVersion.fileId}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        window.open(capstone4Data.academicVersion.webViewLink, '_blank')
                                    }
                                >
                                    <ExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
                                    View
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="tw-text-sm tw-text-muted-foreground tw-mb-4">
                            No academic version uploaded yet.
                        </p>
                    )}

                    {isStudent && (
                        <form onSubmit={handleAcademicSubmit} className="tw-mt-4 tw-space-y-4">
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                    Google Drive File ID
                                </label>
                                <input
                                    type="text"
                                    value={academicForm.fileId}
                                    onChange={(e) =>
                                        setAcademicForm((prev) => ({ ...prev, fileId: e.target.value }))
                                    }
                                    placeholder="Enter the Google Drive file ID"
                                    className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                                />
                            </div>
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                    Google Drive Link
                                </label>
                                <input
                                    type="url"
                                    value={academicForm.webViewLink}
                                    onChange={(e) =>
                                        setAcademicForm((prev) => ({ ...prev, webViewLink: e.target.value }))
                                    }
                                    placeholder="https://drive.google.com/file/d/..."
                                    className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                                />
                            </div>
                            <Button type="submit" disabled={submittingAcademic}>
                                {submittingAcademic ? (
                                    <>
                                        <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="tw-w-4 tw-h-4 tw-mr-2" />
                                        Upload Academic Version
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* ===== Journal Version Upload ===== */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <FileText className="tw-w-5 tw-h-5 tw-text-emerald-500" />
                        <CardTitle>Journal Version</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="tw-pt-6">
                    {capstone4Data?.journalVersion?.webViewLink ? (
                        <div className="tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border">
                            <div className="tw-flex tw-items-center tw-justify-between">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <FileText className="tw-w-6 tw-h-6 tw-text-emerald-500" />
                                    <div>
                                        <h4 className="tw-font-medium tw-text-foreground">
                                            Journal Version Uploaded
                                        </h4>
                                        <p className="tw-text-sm tw-text-muted-foreground">
                                            File ID: {capstone4Data.journalVersion.fileId}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        window.open(capstone4Data.journalVersion.webViewLink, '_blank')
                                    }
                                >
                                    <ExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
                                    View
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="tw-text-sm tw-text-muted-foreground tw-mb-4">
                            No journal version uploaded yet.
                        </p>
                    )}

                    {isStudent && (
                        <form onSubmit={handleJournalSubmit} className="tw-mt-4 tw-space-y-4">
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                    Google Drive File ID
                                </label>
                                <input
                                    type="text"
                                    value={journalForm.fileId}
                                    onChange={(e) =>
                                        setJournalForm((prev) => ({ ...prev, fileId: e.target.value }))
                                    }
                                    placeholder="Enter the Google Drive file ID"
                                    className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                                />
                            </div>
                            <div>
                                <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                    Google Drive Link
                                </label>
                                <input
                                    type="url"
                                    value={journalForm.webViewLink}
                                    onChange={(e) =>
                                        setJournalForm((prev) => ({ ...prev, webViewLink: e.target.value }))
                                    }
                                    placeholder="https://drive.google.com/file/d/..."
                                    className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                                />
                            </div>
                            <Button type="submit" disabled={submittingJournal}>
                                {submittingJournal ? (
                                    <>
                                        <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="tw-w-4 tw-h-4 tw-mr-2" />
                                        Upload Journal Version
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* ===== Plagiarism Report ===== */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <Shield className="tw-w-5 tw-h-5 tw-text-amber-500" />
                        <CardTitle>Plagiarism Report</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="tw-pt-6">
                    {capstone4Data?.plagiarismReport ? (
                        <div className="tw-space-y-4">
                            <div className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <Shield className="tw-w-6 tw-h-6 tw-text-amber-500" />
                                    <div>
                                        <h4 className="tw-font-medium tw-text-foreground">
                                            Plagiarism Status
                                        </h4>
                                        {capstone4Data.plagiarismReport.score != null && (
                                            <p className="tw-text-sm tw-text-muted-foreground">
                                                Similarity Score: {capstone4Data.plagiarismReport.score}%
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {getPlagiarismBadge(capstone4Data.plagiarismReport.status)}
                            </div>
                        </div>
                    ) : (
                        <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                            <AlertTriangle className="tw-w-8 tw-h-8 tw-mx-auto tw-mb-2 tw-text-amber-500" />
                            <p className="tw-text-sm">No plagiarism report available yet.</p>
                        </div>
                    )}

                    {isCoordinator && (
                        <div className="tw-mt-4">
                            <Button
                                onClick={handlePlagiarismCheck}
                                disabled={runningPlagiarismCheck}
                                variant="outline"
                            >
                                {runningPlagiarismCheck ? (
                                    <>
                                        <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                        Running Check...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="tw-w-4 tw-h-4 tw-mr-2" />
                                        Run Plagiarism Check
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ===== Credentials ===== */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <div className="tw-flex tw-items-center tw-justify-between">
                        <div className="tw-flex tw-items-center tw-gap-3">
                            <Award className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                            <CardTitle>Credentials</CardTitle>
                        </div>
                        {isStudent && (
                            <Button
                                size="sm"
                                onClick={() => setCredentialDialogOpen(true)}
                            >
                                <Plus className="tw-w-4 tw-h-4 tw-mr-2" />
                                Add Credential
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="tw-pt-6">
                    {capstone4Data?.credentials?.length > 0 ? (
                        <div className="tw-space-y-3">
                            {capstone4Data.credentials.map((credential, index) => (
                                <div
                                    key={credential._id || index}
                                    className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border"
                                >
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <Award className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                                        <div>
                                            <h4 className="tw-font-medium tw-text-foreground">
                                                {credential.name}
                                            </h4>
                                            <Badge
                                                variant="secondary"
                                                className="tw-mt-1"
                                            >
                                                {getCredentialTypeLabel(credential.type)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            window.open(credential.webViewLink, '_blank')
                                        }
                                    >
                                        <ExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                            <Award className="tw-w-8 tw-h-8 tw-mx-auto tw-mb-2 tw-opacity-50" />
                            <p className="tw-text-sm">No credentials uploaded yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ===== Credential Dialog ===== */}
            <Dialog open={credentialDialogOpen} onOpenChange={setCredentialDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Credential</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCredentialSubmit} className="tw-space-y-4">
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Credential Type
                            </label>
                            <select
                                value={credentialForm.type}
                                onChange={(e) =>
                                    setCredentialForm((prev) => ({ ...prev, type: e.target.value }))
                                }
                                className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                            >
                                {CREDENTIAL_TYPES.map((ct) => (
                                    <option key={ct.value} value={ct.value}>
                                        {ct.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Credential Name
                            </label>
                            <input
                                type="text"
                                value={credentialForm.name}
                                onChange={(e) =>
                                    setCredentialForm((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="e.g. Ethics Clearance Certificate"
                                className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                            />
                        </div>
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Google Drive File ID
                            </label>
                            <input
                                type="text"
                                value={credentialForm.fileId}
                                onChange={(e) =>
                                    setCredentialForm((prev) => ({ ...prev, fileId: e.target.value }))
                                }
                                placeholder="Enter the Google Drive file ID"
                                className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                            />
                        </div>
                        <div>
                            <label className="tw-block tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                Google Drive Link
                            </label>
                            <input
                                type="url"
                                value={credentialForm.webViewLink}
                                onChange={(e) =>
                                    setCredentialForm((prev) => ({ ...prev, webViewLink: e.target.value }))
                                }
                                placeholder="https://drive.google.com/file/d/..."
                                className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-card tw-px-3 tw-py-2 tw-text-sm tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-ring-offset-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCredentialDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submittingCredential}>
                                {submittingCredential ? (
                                    <>
                                        <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="tw-w-4 tw-h-4 tw-mr-2" />
                                        Upload Credential
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ===== Defense Verdict ===== */}
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <div className="tw-flex tw-items-center tw-gap-3">
                        <Award className="tw-w-5 tw-h-5 tw-text-emerald-500" />
                        <CardTitle>Defense Verdict</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="tw-pt-6">
                    {capstone4Data?.defenseVerdict?.result ? (
                        <div className="tw-space-y-4">
                            <div className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border">
                                <div className="tw-flex tw-items-center tw-gap-3">
                                    <Award className="tw-w-6 tw-h-6 tw-text-emerald-500" />
                                    <div>
                                        <h4 className="tw-font-medium tw-text-foreground">
                                            Verdict
                                        </h4>
                                    </div>
                                </div>
                                {getVerdictBadge(capstone4Data.defenseVerdict.result)}
                            </div>

                            {capstone4Data.defenseVerdict.remarks && (
                                <div className="tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border">
                                    <h4 className="tw-text-sm tw-font-medium tw-text-foreground tw-mb-1">
                                        Remarks
                                    </h4>
                                    <p className="tw-text-sm tw-text-muted-foreground">
                                        {capstone4Data.defenseVerdict.remarks}
                                    </p>
                                </div>
                            )}

                            {capstone4Data.defenseVerdict.evaluators?.length > 0 && (
                                <div className="tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border">
                                    <h4 className="tw-text-sm tw-font-medium tw-text-foreground tw-mb-2">
                                        Evaluators
                                    </h4>
                                    <div className="tw-flex tw-flex-wrap tw-gap-2">
                                        {capstone4Data.defenseVerdict.evaluators.map((evaluator, index) => (
                                            <Badge key={index} variant="secondary">
                                                {evaluator.name || evaluator}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="tw-text-center tw-py-6 tw-text-muted-foreground">
                            <Award className="tw-w-8 tw-h-8 tw-mx-auto tw-mb-2 tw-opacity-50" />
                            <p className="tw-text-sm">No defense verdict recorded yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FinalSubmission;

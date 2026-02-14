import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import api from '../../services/api';
import {
    FileText,
    ExternalLink,
    RefreshCw,
    Plus,
    Trash2,
    Share2,
    Clock,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from 'lucide-react';

/**
 * GoogleDocsPanel Component
 * 
 * Displays Google Docs integration status and controls for a project.
 * Allows creating, opening, syncing, and managing Google Docs.
 */
const GoogleDocsPanel = ({ project, onUpdate, showToast, canManage = false }) => {
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [serviceStatus, setServiceStatus] = useState(null);
    const [docInfo, setDocInfo] = useState(null);
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [shareRole, setShareRole] = useState('writer');
    const [sharing, setSharing] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Check if Google Docs service is available
    const checkServiceStatus = useCallback(async () => {
        try {
            const response = await api.get('/google-docs/status');
            setServiceStatus(response.data.googleDocs);
        } catch (error) {
            setServiceStatus({ available: false, message: 'Could not check service status' });
        }
    }, []);

    // Load document info
    const loadDocInfo = useCallback(async () => {
        if (!project?._id) return;
        
        setLoading(true);
        try {
            const response = await api.get(`/projects/${project._id}/docs`);
            setDocInfo(response.data.googleDocs);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Failed to load doc info:', error);
            }
            setDocInfo(null);
        } finally {
            setLoading(false);
        }
    }, [project?._id]);

    useEffect(() => {
        checkServiceStatus();
    }, [checkServiceStatus]);

    useEffect(() => {
        if (project?.googleDocs?.documentId) {
            loadDocInfo();
        } else {
            setDocInfo(null);
        }
    }, [project?.googleDocs?.documentId, loadDocInfo]);

    // Create Google Doc for project
    const handleCreate = async () => {
        if (!project?._id) return;
        
        setCreating(true);
        try {
            const response = await api.post(`/projects/${project._id}/docs/create`);
            setDocInfo(response.data.googleDocs);
            if (onUpdate) onUpdate();
            if (showToast) showToast('success', 'Google Doc created successfully');
        } catch (error) {
            if (showToast) {
                showToast('error', error.response?.data?.message || 'Failed to create Google Doc');
            }
        } finally {
            setCreating(false);
        }
    };

    // Sync document content
    const handleSync = async () => {
        if (!project?._id) return;
        
        setSyncing(true);
        try {
            const response = await api.post(`/projects/${project._id}/docs/sync`);
            if (onUpdate) onUpdate();
            if (showToast) showToast('success', 'Document synced successfully');
        } catch (error) {
            if (showToast) {
                showToast('error', error.response?.data?.message || 'Failed to sync document');
            }
        } finally {
            setSyncing(false);
        }
    };

    // Share document
    const handleShare = async () => {
        if (!shareEmail.trim()) return;
        
        setSharing(true);
        try {
            await api.post(`/projects/${project._id}/docs/share`, {
                email: shareEmail.trim(),
                role: shareRole
            });
            setShareDialogOpen(false);
            setShareEmail('');
            if (showToast) showToast('success', `Document shared with ${shareEmail}`);
        } catch (error) {
            if (showToast) {
                showToast('error', error.response?.data?.message || 'Failed to share document');
            }
        } finally {
            setSharing(false);
        }
    };

    // Delete document
    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/projects/${project._id}/docs`);
            setDocInfo(null);
            setDeleteConfirmOpen(false);
            if (onUpdate) onUpdate();
            if (showToast) showToast('success', 'Google Doc deleted');
        } catch (error) {
            if (showToast) {
                showToast('error', error.response?.data?.message || 'Failed to delete document');
            }
        } finally {
            setDeleting(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // Check if service is unavailable
    if (serviceStatus && !serviceStatus.available) {
        return (
            <Card className="tw-bg-background tw-border-border">
                <CardHeader className="tw-pb-3">
                    <CardTitle className="tw-text-base tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <FileText className="tw-w-5 tw-h-5 tw-text-muted-foreground" />
                        Google Docs Integration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-flex tw-items-center tw-gap-3 tw-text-muted-foreground">
                        <AlertCircle className="tw-w-5 tw-h-5 tw-text-amber-500" />
                        <div>
                            <p className="tw-text-sm tw-font-medium">Google Docs is not configured</p>
                            <p className="tw-text-xs tw-mt-1">
                                Contact your administrator to set up Google Docs integration.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const hasDocument = project?.googleDocs?.documentId || docInfo?.documentId;
    const documentUrl = docInfo?.documentUrl || project?.googleDocs?.documentUrl;

    return (
        <>
            <Card className="tw-bg-background tw-border-border">
                <CardHeader className="tw-pb-3">
                    <div className="tw-flex tw-items-center tw-justify-between">
                        <CardTitle className="tw-text-base tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                            <FileText className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                            Google Docs Integration
                        </CardTitle>
                        {hasDocument && (
                            <Badge variant="default" className="tw-bg-green-100 tw-text-green-800 dark:tw-bg-green-900 dark:tw-text-green-200">
                                <CheckCircle2 className="tw-w-3 tw-h-3 tw-mr-1" />
                                Connected
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="tw-flex tw-items-center tw-justify-center tw-py-4">
                            <Loader2 className="tw-w-6 tw-h-6 tw-animate-spin tw-text-indigo-500" />
                        </div>
                    ) : hasDocument ? (
                        <div className="tw-space-y-4">
                            {/* Document Info */}
                            <div className="tw-bg-muted/50 tw-rounded-lg tw-p-3 tw-space-y-2">
                                {docInfo?.title && (
                                    <p className="tw-text-sm tw-font-medium tw-text-foreground">
                                        {docInfo.title}
                                    </p>
                                )}
                                <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-muted-foreground">
                                    <Clock className="tw-w-3 tw-h-3" />
                                    <span>Last synced: {formatDate(docInfo?.lastSyncedAt || project?.googleDocs?.lastSyncedAt)}</span>
                                </div>
                                {docInfo?.modifiedTime && (
                                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-xs tw-text-muted-foreground">
                                        <Clock className="tw-w-3 tw-h-3" />
                                        <span>Modified: {formatDate(docInfo.modifiedTime)}</span>
                                        {docInfo.lastModifiedBy && (
                                            <span className="tw-text-foreground">by {docInfo.lastModifiedBy}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="tw-flex tw-flex-wrap tw-gap-2">
                                <Button
                                    size="sm"
                                    className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                    onClick={() => window.open(documentUrl, '_blank')}
                                >
                                    <ExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
                                    Open in Google Docs
                                </Button>
                                
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSync}
                                    disabled={syncing}
                                >
                                    <RefreshCw className={`tw-w-4 tw-h-4 tw-mr-2 ${syncing ? 'tw-animate-spin' : ''}`} />
                                    {syncing ? 'Syncing...' : 'Sync'}
                                </Button>

                                {canManage && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShareDialogOpen(true)}
                                        >
                                            <Share2 className="tw-w-4 tw-h-4 tw-mr-2" />
                                            Share
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="tw-text-red-600 hover:tw-text-red-700 hover:tw-bg-red-50"
                                            onClick={() => setDeleteConfirmOpen(true)}
                                        >
                                            <Trash2 className="tw-w-4 tw-h-4 tw-mr-2" />
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="tw-space-y-4">
                            <p className="tw-text-sm tw-text-muted-foreground">
                                Create a collaborative Google Doc for your team to work on the proposal together in real-time.
                            </p>
                            <Button
                                onClick={handleCreate}
                                disabled={creating}
                                className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="tw-w-4 tw-h-4 tw-mr-2" />
                                        Create Google Doc
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="tw-bg-card tw-border-border">
                    <DialogHeader>
                        <DialogTitle className="tw-text-foreground">Share Document</DialogTitle>
                        <DialogDescription className="tw-text-muted-foreground">
                            Share this Google Doc with another person by entering their email address.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="tw-space-y-4 tw-py-4">
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="tw-w-full tw-px-3 tw-py-2 tw-text-sm tw-rounded-md tw-border tw-border-input tw-bg-background tw-text-foreground placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring"
                            />
                        </div>
                        <div className="tw-space-y-2">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Permission Level
                            </label>
                            <select
                                value={shareRole}
                                onChange={(e) => setShareRole(e.target.value)}
                                className="tw-w-full tw-px-3 tw-py-2 tw-text-sm tw-rounded-md tw-border tw-border-input tw-bg-background tw-text-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring"
                            >
                                <option value="writer">Can Edit</option>
                                <option value="commenter">Can Comment</option>
                                <option value="reader">View Only</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleShare}
                            disabled={sharing || !shareEmail.trim()}
                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                        >
                            {sharing ? (
                                <>
                                    <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                    Sharing...
                                </>
                            ) : (
                                <>
                                    <Share2 className="tw-w-4 tw-h-4 tw-mr-2" />
                                    Share
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="tw-bg-card tw-border-border">
                    <DialogHeader>
                        <DialogTitle className="tw-text-foreground">Delete Google Doc?</DialogTitle>
                        <DialogDescription className="tw-text-muted-foreground">
                            Are you sure you want to delete this Google Doc? This action cannot be undone.
                            The document will be permanently removed from Google Drive.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <Loader2 className="tw-w-4 tw-h-4 tw-mr-2 tw-animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="tw-w-4 tw-h-4 tw-mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default GoogleDocsPanel;

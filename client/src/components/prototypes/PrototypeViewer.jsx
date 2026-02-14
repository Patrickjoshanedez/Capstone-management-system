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
import { Image, Video, Link2, Plus, ExternalLink, X, Loader2 } from 'lucide-react';

const TYPE_OPTIONS = [
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'link', label: 'Link', icon: Link2 },
];

const EMPTY_FORM = {
    type: 'image',
    title: '',
    description: '',
    externalUrl: '',
    fileId: '',
    webViewLink: '',
};

const PrototypeViewer = ({ project, showToast, user }) => {
    const [prototypes, setPrototypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [submitting, setSubmitting] = useState(false);
    const [lightbox, setLightbox] = useState(null);

    const isStudent = user?.role === 'student';

    const fetchPrototypes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/projects/${project._id}/prototypes`);
            if (res.data?.success) {
                setPrototypes(res.data.data || []);
            } else {
                setPrototypes(res.data?.data || res.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch prototypes:', err);
            showToast?.('error', 'Failed to load prototypes');
            setPrototypes([]);
        } finally {
            setLoading(false);
        }
    }, [project._id, showToast]);

    useEffect(() => {
        fetchPrototypes();
    }, [fetchPrototypes]);

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData({ ...EMPTY_FORM });
    };

    const handleAddPrototype = async () => {
        if (!formData.title.trim()) {
            showToast?.('error', 'Title is required');
            return;
        }

        if (formData.type === 'link' && !formData.externalUrl.trim()) {
            showToast?.('error', 'External URL is required for link prototypes');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                type: formData.type,
                title: formData.title.trim(),
                description: formData.description.trim(),
            };

            if (formData.type === 'link') {
                payload.externalUrl = formData.externalUrl.trim();
            } else {
                if (formData.fileId) payload.fileId = formData.fileId.trim();
                if (formData.webViewLink) payload.webViewLink = formData.webViewLink.trim();
            }

            const res = await api.post(`/projects/${project._id}/prototypes`, payload);

            if (res.data?.success) {
                showToast?.('success', 'Prototype added successfully');
                setDialogOpen(false);
                resetForm();
                fetchPrototypes();
            }
        } catch (err) {
            console.error('Failed to add prototype:', err);
            showToast?.('error', err.response?.data?.message || 'Failed to add prototype');
        } finally {
            setSubmitting(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'image':
                return <Image className="tw-w-4 tw-h-4" />;
            case 'video':
                return <Video className="tw-w-4 tw-h-4" />;
            case 'link':
                return <Link2 className="tw-w-4 tw-h-4" />;
            default:
                return null;
        }
    };

    const getTypeBadgeVariant = (type) => {
        switch (type) {
            case 'image':
                return 'default';
            case 'video':
                return 'secondary';
            case 'link':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const resolveMediaUrl = (proto) => {
        if (proto.externalUrl) return proto.externalUrl;
        if (proto.webViewLink) return proto.webViewLink;
        return null;
    };

    const renderPrototypeCard = (proto) => {
        const mediaUrl = resolveMediaUrl(proto);

        return (
            <Card key={proto._id} className="tw-overflow-hidden tw-flex tw-flex-col">
                {/* Media preview */}
                <div className="tw-relative tw-bg-muted tw-aspect-video tw-flex tw-items-center tw-justify-center tw-overflow-hidden">
                    {proto.type === 'image' && mediaUrl ? (
                        <img
                            src={mediaUrl}
                            alt={proto.title}
                            className="tw-w-full tw-h-full tw-object-cover tw-cursor-pointer hover:tw-opacity-90 tw-transition-opacity"
                            onClick={() => setLightbox(mediaUrl)}
                        />
                    ) : proto.type === 'video' && mediaUrl ? (
                        <video
                            src={mediaUrl}
                            controls
                            className="tw-w-full tw-h-full tw-object-contain tw-bg-black"
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : proto.type === 'link' ? (
                        <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline"
                        >
                            <ExternalLink className="tw-w-10 tw-h-10 tw-opacity-60" />
                            <span className="tw-text-sm tw-font-medium">Open Link</span>
                        </a>
                    ) : (
                        <div className="tw-text-muted-foreground tw-text-sm">
                            No preview available
                        </div>
                    )}
                </div>

                {/* Card body */}
                <CardContent className="tw-p-4 tw-flex tw-flex-col tw-gap-2 tw-flex-1">
                    <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
                        <h4 className="tw-text-sm tw-font-semibold tw-text-foreground tw-truncate tw-flex-1">
                            {proto.title}
                        </h4>
                        <Badge variant={getTypeBadgeVariant(proto.type)} className="tw-flex-shrink-0 tw-gap-1">
                            {getTypeIcon(proto.type)}
                            {proto.type}
                        </Badge>
                    </div>
                    {proto.description && (
                        <p className="tw-text-xs tw-text-muted-foreground tw-line-clamp-2">
                            {proto.description}
                        </p>
                    )}
                    {proto.type === 'link' && mediaUrl && (
                        <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tw-inline-flex tw-items-center tw-gap-1 tw-text-xs tw-text-indigo-600 dark:tw-text-indigo-400 hover:tw-underline tw-mt-auto"
                        >
                            <ExternalLink className="tw-w-3 tw-h-3" />
                            Visit Link
                        </a>
                    )}
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Loading prototypes...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="tw-border-b tw-border-border">
                    <div className="tw-flex tw-items-center tw-justify-between">
                        <CardTitle className="tw-flex tw-items-center tw-gap-2">
                            <Image className="tw-w-5 tw-h-5" />
                            Prototypes
                        </CardTitle>
                        {isStudent && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    resetForm();
                                    setDialogOpen(true);
                                }}
                                className="tw-gap-1"
                            >
                                <Plus className="tw-w-4 tw-h-4" />
                                Add Prototype
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="tw-p-6">
                    {prototypes.length === 0 ? (
                        <div className="tw-py-12 tw-text-center tw-text-muted-foreground">
                            <Image className="tw-w-12 tw-h-12 tw-mx-auto tw-mb-3 tw-opacity-30" />
                            <p className="tw-text-lg tw-font-medium">No prototypes yet</p>
                            <p className="tw-text-sm tw-mt-1">
                                {isStudent
                                    ? 'Add images, videos, or links to showcase your project prototypes.'
                                    : 'No prototypes have been added to this project yet.'}
                            </p>
                        </div>
                    ) : (
                        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                            {prototypes.map(renderPrototypeCard)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Prototype Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:tw-max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Prototype</DialogTitle>
                    </DialogHeader>

                    <div className="tw-flex tw-flex-col tw-gap-4 tw-py-4">
                        {/* Type */}
                        <div className="tw-flex tw-flex-col tw-gap-1.5">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleFormChange('type', e.target.value)}
                                className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-text-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            >
                                {TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="tw-flex tw-flex-col tw-gap-1.5">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Title <span className="tw-text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleFormChange('title', e.target.value)}
                                placeholder="Enter prototype title"
                                className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-text-foreground tw-placeholder-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>

                        {/* Description */}
                        <div className="tw-flex tw-flex-col tw-gap-1.5">
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder="Describe this prototype"
                                rows={3}
                                className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-text-foreground tw-placeholder-muted-foreground tw-resize-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>

                        {/* Conditional fields based on type */}
                        {formData.type === 'link' ? (
                            <div className="tw-flex tw-flex-col tw-gap-1.5">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                    External URL <span className="tw-text-red-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    value={formData.externalUrl}
                                    onChange={(e) => handleFormChange('externalUrl', e.target.value)}
                                    placeholder="https://example.com"
                                    className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-text-foreground tw-placeholder-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                />
                            </div>
                        ) : (
                            <>
                                <div className="tw-flex tw-flex-col tw-gap-1.5">
                                    <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                        File ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fileId}
                                        onChange={(e) => handleFormChange('fileId', e.target.value)}
                                        placeholder="Google Drive file ID"
                                        className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-text-foreground tw-placeholder-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                    />
                                </div>
                                <div className="tw-flex tw-flex-col tw-gap-1.5">
                                    <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                        Web View Link
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.webViewLink}
                                        onChange={(e) => handleFormChange('webViewLink', e.target.value)}
                                        placeholder="https://drive.google.com/file/d/..."
                                        className="tw-w-full tw-rounded-md tw-border tw-border-border tw-bg-transparent tw-px-3 tw-py-2 tw-text-sm tw-text-foreground tw-placeholder-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddPrototype}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-1" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="tw-w-4 tw-h-4 tw-mr-1" />
                                    Add Prototype
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lightbox Modal for Images */}
            {lightbox && (
                <div
                    className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black/80 tw-backdrop-blur-sm"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        onClick={() => setLightbox(null)}
                        className="tw-absolute tw-top-4 tw-right-4 tw-p-2 tw-rounded-full tw-bg-white/10 tw-text-white hover:tw-bg-white/20 tw-transition-colors"
                    >
                        <X className="tw-w-6 tw-h-6" />
                    </button>
                    <img
                        src={lightbox}
                        alt="Prototype preview"
                        className="tw-max-w-[90vw] tw-max-h-[90vh] tw-object-contain tw-rounded-lg tw-shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
};

export default PrototypeViewer;

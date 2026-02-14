import React, { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Upload, Loader2, Archive, Plus } from 'lucide-react';

const initialForm = {
    title: '',
    authors: '',
    year: '',
    keywords: '',
    journalFileId: '',
    journalWebViewLink: '',
    academicFileId: '',
    academicWebViewLink: '',
};

const LegacyUpload = ({ showToast }) => {
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [legacyProjects, setLegacyProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const fetchLegacyProjects = useCallback(async () => {
        setLoadingProjects(true);
        try {
            const response = await api.get('/legacy');
            setLegacyProjects(response.data?.projects || response.data || []);
        } catch (error) {
            if (showToast) showToast('error', error.response?.data?.message || 'Failed to load legacy projects');
        } finally {
            setLoadingProjects(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchLegacyProjects();
    }, [fetchLegacyProjects]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            if (showToast) showToast('error', 'Title is required');
            return;
        }

        setSaving(true);
        try {
            await api.post('/legacy/upload', {
                title: form.title.trim(),
                authors: form.authors
                    .split(',')
                    .map((a) => a.trim())
                    .filter(Boolean),
                year: form.year.trim(),
                keywords: form.keywords
                    .split(',')
                    .map((k) => k.trim())
                    .filter(Boolean),
                journalFileId: form.journalFileId.trim(),
                journalWebViewLink: form.journalWebViewLink.trim(),
                academicFileId: form.academicFileId.trim(),
                academicWebViewLink: form.academicWebViewLink.trim(),
            });

            if (showToast) showToast('success', 'Legacy project uploaded successfully');
            setForm(initialForm);
            fetchLegacyProjects();
        } catch (error) {
            if (showToast) showToast('error', error.response?.data?.message || 'Failed to upload legacy project');
        } finally {
            setSaving(false);
        }
    }, [form, showToast, fetchLegacyProjects]);

    return (
        <div className="tw-space-y-6">
            {/* Upload Form */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader className="tw-pb-3">
                    <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <Upload className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        Upload Legacy Archived Project
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="tw-space-y-4">
                        {/* Title */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Title <span className="tw-text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="Enter project title"
                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>

                        {/* Authors */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Authors
                            </label>
                            <input
                                type="text"
                                name="authors"
                                value={form.authors}
                                onChange={handleChange}
                                placeholder="Comma-separated names (e.g., Juan Dela Cruz, Maria Santos)"
                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>

                        {/* Academic Year */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Academic Year
                            </label>
                            <input
                                type="text"
                                name="year"
                                value={form.year}
                                onChange={handleChange}
                                placeholder='e.g., 2024-2025'
                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>

                        {/* Keywords */}
                        <div>
                            <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                Keywords
                            </label>
                            <input
                                type="text"
                                name="keywords"
                                value={form.keywords}
                                onChange={handleChange}
                                placeholder="Comma-separated keywords (e.g., IoT, Machine Learning, Web App)"
                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>

                        {/* Google Drive File References */}
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                            {/* Journal Version */}
                            <div className="tw-space-y-3">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                    Journal Version
                                </label>
                                <div>
                                    <label className="tw-text-xs tw-text-muted-foreground">File ID</label>
                                    <input
                                        type="text"
                                        name="journalFileId"
                                        value={form.journalFileId}
                                        onChange={handleChange}
                                        placeholder="Google Drive File ID"
                                        className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="tw-text-xs tw-text-muted-foreground">Web View Link</label>
                                    <input
                                        type="text"
                                        name="journalWebViewLink"
                                        value={form.journalWebViewLink}
                                        onChange={handleChange}
                                        placeholder="https://drive.google.com/..."
                                        className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Academic Version */}
                            <div className="tw-space-y-3">
                                <label className="tw-text-sm tw-font-medium tw-text-foreground">
                                    Academic Version
                                </label>
                                <div>
                                    <label className="tw-text-xs tw-text-muted-foreground">File ID</label>
                                    <input
                                        type="text"
                                        name="academicFileId"
                                        value={form.academicFileId}
                                        onChange={handleChange}
                                        placeholder="Google Drive File ID"
                                        className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="tw-text-xs tw-text-muted-foreground">Web View Link</label>
                                    <input
                                        type="text"
                                        name="academicWebViewLink"
                                        value={form.academicWebViewLink}
                                        onChange={handleChange}
                                        placeholder="https://drive.google.com/..."
                                        className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="tw-flex tw-justify-end tw-pt-2">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white tw-gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="tw-w-4 tw-h-4" />
                                        Upload Legacy Project
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Existing Legacy Uploads */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader className="tw-pb-3">
                    <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <Archive className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        Existing Legacy Uploads
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingProjects ? (
                        <div className="tw-flex tw-items-center tw-justify-center tw-py-8">
                            <Loader2 className="tw-w-6 tw-h-6 tw-animate-spin tw-text-indigo-500" />
                            <span className="tw-ml-2 tw-text-sm tw-text-muted-foreground">Loading legacy projects...</span>
                        </div>
                    ) : legacyProjects.length === 0 ? (
                        <div className="tw-text-center tw-py-8">
                            <Archive className="tw-w-12 tw-h-12 tw-text-muted-foreground tw-mx-auto tw-mb-3" />
                            <p className="tw-text-sm tw-text-muted-foreground">
                                No legacy projects uploaded yet.
                            </p>
                        </div>
                    ) : (
                        <div className="tw-space-y-3">
                            {legacyProjects.map((project, idx) => (
                                <div
                                    key={project._id || idx}
                                    className="tw-flex tw-items-start tw-justify-between tw-gap-4 tw-rounded-lg tw-border tw-border-border tw-bg-background tw-p-4"
                                >
                                    <div className="tw-flex-1 tw-min-w-0">
                                        <h4 className="tw-text-sm tw-font-medium tw-text-foreground tw-truncate">
                                            {project.title}
                                        </h4>
                                        {project.year && (
                                            <p className="tw-text-xs tw-text-muted-foreground tw-mt-1">
                                                AY {project.year}
                                            </p>
                                        )}
                                        {project.keywords && project.keywords.length > 0 && (
                                            <div className="tw-flex tw-flex-wrap tw-gap-1.5 tw-mt-2">
                                                {project.keywords.map((keyword, kIdx) => (
                                                    <Badge key={kIdx} variant="secondary" className="tw-text-xs">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LegacyUpload;

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import {
    FileIcon,
    FileText,
    FolderOpen,
    Upload,
    ClipboardList,
} from 'lucide-react';

const SubmissionPortal = ({ project, onSubmissionSuccess, showToast }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.google-apps.document',
    ];

    const maxSize = 25 * 1024 * 1024; // 25MB

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile) => {
        if (!selectedFile) return;

        if (!allowedTypes.includes(selectedFile.type)) {
            showToast?.('error', 'Invalid file type. Please upload PDF or Word documents.');
            return;
        }

        if (selectedFile.size > maxSize) {
            showToast?.('error', 'File too large. Maximum size is 25MB.');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file || !project?._id) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('document', file);

            const response = await api.post(
                `/projects/${project._id}/upload`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(progress);
                    },
                }
            );

            showToast?.('success', 'Document uploaded successfully!');
            setFile(null);
            setUploadProgress(0);
            onSubmissionSuccess?.(response.data);
        } catch (err) {
            showToast?.('error', err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        if (type.includes('pdf')) return <FileIcon className="tw-w-10 tw-h-10 tw-text-red-500" />;
        if (type.includes('word') || type.includes('document')) return <FileText className="tw-w-10 tw-h-10 tw-text-blue-500" />;
        return <FolderOpen className="tw-w-10 tw-h-10 tw-text-muted-foreground" />;
    };

    if (!project) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Submission Portal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
                        <div className="tw-text-indigo-500 tw-mb-2 tw-flex tw-justify-center"><Upload className="tw-w-10 tw-h-10" /></div>
                        <p>No project selected</p>
                        <p className="tw-text-sm">Create or select a project to submit documents</p>
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
                        <CardTitle>Centralized Submission Portal</CardTitle>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                            {project.title}
                        </p>
                    </div>
                    <Badge variant="outline">
                        {project.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="tw-pt-6">
                {/* Current Document Status */}
                {project.document && (
                    <div className="tw-mb-6 tw-p-4 tw-bg-muted tw-rounded-lg tw-border tw-border-border">
                        <div className="tw-flex tw-items-center tw-justify-between">
                            <div className="tw-flex tw-items-center tw-gap-3">
                                <FileText className="tw-w-6 tw-h-6 tw-text-indigo-500" />
                                <div>
                                    <h4 className="tw-font-medium tw-text-foreground">
                                        Current Document
                                    </h4>
                                    <p className="tw-text-sm tw-text-muted-foreground">
                                        Uploaded: {new Date(project.document.uploadedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(project.document.url, '_blank')}
                            >
                                View
                            </Button>
                        </div>
                    </div>
                )}

                {/* Upload Area */}
                <div
                    className={`tw-relative tw-border-2 tw-border-dashed tw-rounded-lg tw-p-8 tw-text-center tw-transition-colors
                        ${dragActive 
                            ? 'tw-border-indigo-500 tw-bg-indigo-500/10' 
                            : 'tw-border-border hover:tw-border-muted-foreground'
                        }
                        ${uploading ? 'tw-pointer-events-none tw-opacity-50' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="tw-hidden"
                        id="file-upload"
                    />

                    {!file ? (
                        <div>
                            <div className="tw-text-indigo-500 tw-mb-4 tw-flex tw-justify-center"><FolderOpen className="tw-w-10 tw-h-10" /></div>
                            <p className="tw-text-lg tw-font-medium tw-text-foreground tw-mb-2">
                                Drag and drop your document here
                            </p>
                            <p className="tw-text-sm tw-text-muted-foreground tw-mb-4">
                                or click to browse
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Select File
                            </Button>
                            <p className="tw-text-xs tw-text-muted-foreground tw-mt-4">
                                Supported: PDF, DOC, DOCX (Max 25MB)
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="tw-flex tw-items-center tw-justify-center tw-gap-4 tw-mb-4">
                                <div>
                                    {getFileIcon(file.type)}
                                </div>
                                <div className="tw-text-left">
                                    <p className="tw-font-medium tw-text-foreground tw-truncate tw-max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="tw-text-sm tw-text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                            </div>

                            {uploading && (
                                <div className="tw-mb-4">
                                    <div className="tw-w-full tw-bg-muted tw-rounded-full tw-h-2">
                                        <div
                                            className="tw-bg-indigo-600 dark:tw-bg-indigo-500 tw-h-2 tw-rounded-full tw-transition-all"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="tw-text-sm tw-text-muted-foreground tw-mt-2">
                                        Uploading... {uploadProgress}%
                                    </p>
                                </div>
                            )}

                            <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
                                <Button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Document'}
                                </Button>
                                {!uploading && (
                                    <Button
                                        variant="outline"
                                        onClick={clearFile}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submission Guidelines */}
                <div className="tw-mt-6 tw-p-4 tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-rounded-lg tw-border tw-border-indigo-500/30">
                    <h4 className="tw-font-semibold tw-text-indigo-800 dark:tw-text-indigo-300 tw-mb-2 tw-flex tw-items-center tw-gap-2">
                        <ClipboardList className="tw-w-4 tw-h-4" />
                        Submission Guidelines
                    </h4>
                    <ul className="tw-text-sm tw-text-indigo-700 dark:tw-text-indigo-400 tw-space-y-1">
                        <li>• Ensure your document follows the required format</li>
                        <li>• Include all required sections for your current stage</li>
                        <li>• Documents will be automatically checked for similarity</li>
                        <li>• Your adviser will be notified upon submission</li>
                    </ul>
                </div>

                {/* Submission History */}
                <div className="tw-mt-6">
                    <h4 className="tw-font-semibold tw-text-foreground tw-mb-3">
                        Recent Submissions
                    </h4>
                    {project.submissions?.length > 0 ? (
                        <div className="tw-space-y-2">
                            {project.submissions.slice(0, 5).map((sub, index) => (
                                <div
                                    key={index}
                                    className="tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-muted tw-rounded"
                                >
                                    <div className="tw-flex tw-items-center tw-gap-3">
                                        <FileText className="tw-w-5 tw-h-5 tw-text-muted-foreground" />
                                        <div>
                                            <p className="tw-text-sm tw-font-medium tw-text-foreground">
                                                {sub.stage || 'Document'}
                                            </p>
                                            <p className="tw-text-xs tw-text-muted-foreground">
                                                {new Date(sub.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={sub.status === 'approved' ? 'success' : 'outline'}>
                                        {sub.status || 'Pending'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="tw-text-sm tw-text-muted-foreground tw-text-center tw-py-4">
                            No submissions yet
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default SubmissionPortal;

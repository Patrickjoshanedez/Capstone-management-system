import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import { Plus, Loader2, X } from 'lucide-react';

const initialFormState = {
    title: '',
    description: '',
    chapter1: '',
    chapter2: '',
    chapter3: '',
    keywordsInput: '',
    academicYear: '',
};

const TopicCreator = ({ showToast }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [keywords, setKeywords] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleKeywordsInputChange = (e) => {
        setFormData((prev) => ({ ...prev, keywordsInput: e.target.value }));
    };

    const processKeywords = () => {
        const raw = formData.keywordsInput;
        if (!raw.trim()) return;

        const newKeywords = raw
            .split(',')
            .map((k) => k.trim())
            .filter((k) => k.length > 0 && !keywords.includes(k));

        if (newKeywords.length > 0) {
            setKeywords((prev) => [...prev, ...newKeywords]);
        }
        setFormData((prev) => ({ ...prev, keywordsInput: '' }));
    };

    const handleKeywordsKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processKeywords();
        }
    };

    const removeKeyword = (index) => {
        setKeywords((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setKeywords([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            showToast?.('error', 'Title is required');
            return;
        }

        if (!formData.description.trim()) {
            showToast?.('error', 'Description is required');
            return;
        }

        // Include any remaining text in the keywords input
        const finalKeywords = [...keywords];
        if (formData.keywordsInput.trim()) {
            const extra = formData.keywordsInput
                .split(',')
                .map((k) => k.trim())
                .filter((k) => k.length > 0 && !finalKeywords.includes(k));
            finalKeywords.push(...extra);
        }

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            chapter1: formData.chapter1.trim() || undefined,
            chapter2: formData.chapter2.trim() || undefined,
            chapter3: formData.chapter3.trim() || undefined,
            keywords: finalKeywords.length > 0 ? finalKeywords : undefined,
            academicYear: formData.academicYear.trim() || undefined,
        };

        try {
            setSubmitting(true);
            await api.post('/topics', payload);
            showToast?.('success', 'Topic created successfully!');
            resetForm();
        } catch (err) {
            showToast?.(
                'error',
                err.response?.data?.message || 'Failed to create topic'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="tw-flex tw-items-center tw-gap-2">
                    <Plus className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                    Create New Topic
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="tw-space-y-5">
                    {/* Title */}
                    <div>
                        <label className="tw-text-sm tw-font-medium tw-text-foreground">
                            Title <span className="tw-text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter topic title"
                            className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="tw-text-sm tw-font-medium tw-text-foreground">
                            Description{' '}
                            <span className="tw-text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide a detailed description of the topic..."
                            rows={4}
                            className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm tw-min-h-[100px] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                        />
                    </div>

                    {/* Chapter Outlines */}
                    <div className="tw-space-y-3">
                        <label className="tw-text-sm tw-font-medium tw-text-foreground">
                            Suggested Chapter Outlines
                        </label>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
                            <div>
                                <label className="tw-text-xs tw-text-muted-foreground">
                                    Chapter 1
                                </label>
                                <input
                                    type="text"
                                    name="chapter1"
                                    value={formData.chapter1}
                                    onChange={handleChange}
                                    placeholder="e.g., Introduction & Background"
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1.5 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="tw-text-xs tw-text-muted-foreground">
                                    Chapter 2
                                </label>
                                <input
                                    type="text"
                                    name="chapter2"
                                    value={formData.chapter2}
                                    onChange={handleChange}
                                    placeholder="e.g., Review of Related Literature"
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1.5 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="tw-text-xs tw-text-muted-foreground">
                                    Chapter 3
                                </label>
                                <input
                                    type="text"
                                    name="chapter3"
                                    value={formData.chapter3}
                                    onChange={handleChange}
                                    placeholder="e.g., Methodology & Design"
                                    className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1.5 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="tw-text-sm tw-font-medium tw-text-foreground">
                            Keywords
                        </label>
                        <p className="tw-text-xs tw-text-muted-foreground tw-mb-1.5">
                            Type keywords separated by commas and press Enter or
                            click Add.
                        </p>
                        {keywords.length > 0 && (
                            <div className="tw-flex tw-flex-wrap tw-gap-1.5 tw-mb-2">
                                {keywords.map((keyword, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="tw-gap-1 tw-text-xs"
                                    >
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(idx)}
                                            className="tw-ml-0.5 tw-text-destructive hover:tw-text-destructive/80"
                                        >
                                            <X className="tw-w-3 tw-h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <div className="tw-flex tw-gap-2">
                            <input
                                type="text"
                                name="keywordsInput"
                                value={formData.keywordsInput}
                                onChange={handleKeywordsInputChange}
                                onKeyDown={handleKeywordsKeyDown}
                                placeholder="e.g., machine learning, web app, IoT"
                                className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1.5 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={processKeywords}
                            >
                                <Plus className="tw-w-4 tw-h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Academic Year */}
                    <div>
                        <label className="tw-text-sm tw-font-medium tw-text-foreground">
                            Academic Year
                        </label>
                        <input
                            type="text"
                            name="academicYear"
                            value={formData.academicYear}
                            onChange={handleChange}
                            placeholder="e.g., 2025-2026"
                            className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 md:tw-w-48"
                        />
                    </div>

                    {/* Submit */}
                    <div className="tw-flex tw-justify-end tw-pt-2">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white tw-gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="tw-w-4 tw-h-4" />
                                    Create Topic
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default TopicCreator;

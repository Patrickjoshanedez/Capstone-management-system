import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import api from '../../services/api';
import {
    Search,
    BookOpen,
    Tag,
    Check,
    Loader2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

const TopicMarketplace = ({ user, showToast }) => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [academicYearFilter, setAcademicYearFilter] = useState('');
    const [expandedOutlines, setExpandedOutlines] = useState({});

    const fetchTopics = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/topics');
            if (res.data?.success) {
                setTopics(res.data.data || res.data.topics || []);
            } else {
                setTopics(res.data?.topics || res.data?.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch topics:', err);
            showToast?.('error', 'Failed to load topics');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    const handleClaim = async (topicId) => {
        try {
            setClaimingId(topicId);
            await api.post(`/topics/${topicId}/claim`);
            showToast?.('success', 'Topic claimed successfully!');
            await fetchTopics();
        } catch (err) {
            showToast?.(
                'error',
                err.response?.data?.message || 'Failed to claim topic'
            );
        } finally {
            setClaimingId(null);
        }
    };

    const toggleOutline = (topicId) => {
        setExpandedOutlines((prev) => ({
            ...prev,
            [topicId]: !prev[topicId],
        }));
    };

    // Derive unique academic years for the filter dropdown
    const academicYears = [
        ...new Set(topics.map((t) => t.academicYear).filter(Boolean)),
    ].sort();

    // Filter topics by search query and academic year
    const filteredTopics = topics.filter((topic) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            !searchQuery ||
            topic.title?.toLowerCase().includes(query) ||
            topic.description?.toLowerCase().includes(query);
        const matchesYear =
            !academicYearFilter || topic.academicYear === academicYearFilter;
        return matchesSearch && matchesYear;
    });

    const isStudent = user?.role === 'student';

    const hasOutline = (topic) => {
        return topic.chapter1 || topic.chapter2 || topic.chapter3;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="tw-p-8">
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">
                            Loading topics...
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="tw-space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2">
                        <BookOpen className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        Topic Marketplace
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="tw-text-sm tw-text-muted-foreground tw-mb-4">
                        Browse pre-approved capstone topics and claim one for
                        your team.
                    </p>

                    {/* Search and Filter Bar */}
                    <div className="tw-flex tw-flex-col md:tw-flex-row tw-gap-3">
                        <div className="tw-relative tw-flex-1">
                            <Search className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search topics by title or description..."
                                className="tw-w-full tw-pl-10 tw-pr-3 tw-py-2 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                            />
                        </div>
                        <select
                            value={academicYearFilter}
                            onChange={(e) =>
                                setAcademicYearFilter(e.target.value)
                            }
                            className="tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 md:tw-w-48"
                        >
                            <option value="">All Academic Years</option>
                            {academicYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Topics Grid */}
            {filteredTopics.length === 0 ? (
                <Card>
                    <CardContent className="tw-p-8 tw-text-center">
                        <BookOpen className="tw-w-12 tw-h-12 tw-mx-auto tw-mb-3 tw-opacity-30 tw-text-muted-foreground" />
                        <p className="tw-text-lg tw-font-medium tw-text-foreground">
                            No topics found
                        </p>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                            {searchQuery || academicYearFilter
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No pre-approved topics are available at this time.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                    {filteredTopics.map((topic) => (
                        <Card
                            key={topic._id}
                            className="tw-flex tw-flex-col tw-bg-background tw-border-border"
                        >
                            <CardHeader className="tw-pb-3">
                                <div className="tw-flex tw-items-start tw-justify-between tw-gap-2">
                                    <CardTitle className="tw-text-base tw-leading-snug tw-text-foreground">
                                        {topic.title}
                                    </CardTitle>
                                    {topic.status === 'claimed' && (
                                        <Badge variant="secondary" className="tw-flex-shrink-0">
                                            Claimed
                                        </Badge>
                                    )}
                                </div>
                                {topic.academicYear && (
                                    <span className="tw-text-xs tw-text-muted-foreground">
                                        AY {topic.academicYear}
                                    </span>
                                )}
                            </CardHeader>
                            <CardContent className="tw-flex tw-flex-col tw-flex-1 tw-space-y-3">
                                {/* Description */}
                                <p className="tw-text-sm tw-text-muted-foreground tw-line-clamp-3">
                                    {topic.description || 'No description provided.'}
                                </p>

                                {/* Keywords */}
                                {topic.keywords && topic.keywords.length > 0 && (
                                    <div className="tw-flex tw-flex-wrap tw-gap-1.5">
                                        <Tag className="tw-w-3.5 tw-h-3.5 tw-text-muted-foreground tw-mt-0.5 tw-flex-shrink-0" />
                                        {topic.keywords.map((keyword, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="secondary"
                                                className="tw-text-xs"
                                            >
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Suggested Outline (expandable) */}
                                {hasOutline(topic) && (
                                    <div className="tw-border tw-border-border tw-rounded tw-overflow-hidden">
                                        <button
                                            onClick={() => toggleOutline(topic._id)}
                                            className="tw-w-full tw-flex tw-items-center tw-justify-between tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-text-foreground hover:tw-bg-muted tw-transition-colors"
                                        >
                                            <span>Suggested Outline</span>
                                            {expandedOutlines[topic._id] ? (
                                                <ChevronUp className="tw-w-4 tw-h-4 tw-text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="tw-w-4 tw-h-4 tw-text-muted-foreground" />
                                            )}
                                        </button>
                                        {expandedOutlines[topic._id] && (
                                            <div className="tw-px-3 tw-pb-3 tw-space-y-2 tw-border-t tw-border-border tw-pt-2">
                                                {topic.chapter1 && (
                                                    <div>
                                                        <span className="tw-text-xs tw-font-medium tw-text-foreground">
                                                            Chapter 1:
                                                        </span>
                                                        <p className="tw-text-xs tw-text-muted-foreground">
                                                            {topic.chapter1}
                                                        </p>
                                                    </div>
                                                )}
                                                {topic.chapter2 && (
                                                    <div>
                                                        <span className="tw-text-xs tw-font-medium tw-text-foreground">
                                                            Chapter 2:
                                                        </span>
                                                        <p className="tw-text-xs tw-text-muted-foreground">
                                                            {topic.chapter2}
                                                        </p>
                                                    </div>
                                                )}
                                                {topic.chapter3 && (
                                                    <div>
                                                        <span className="tw-text-xs tw-font-medium tw-text-foreground">
                                                            Chapter 3:
                                                        </span>
                                                        <p className="tw-text-xs tw-text-muted-foreground">
                                                            {topic.chapter3}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Spacer to push button to bottom */}
                                <div className="tw-flex-1" />

                                {/* Claim Button (students only, available topics) */}
                                {isStudent && topic.status !== 'claimed' && (
                                    <Button
                                        onClick={() => handleClaim(topic._id)}
                                        disabled={claimingId === topic._id}
                                        className="tw-w-full tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white tw-gap-2"
                                    >
                                        {claimingId === topic._id ? (
                                            <>
                                                <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin" />
                                                Claiming...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="tw-w-4 tw-h-4" />
                                                Claim This Topic
                                            </>
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopicMarketplace;

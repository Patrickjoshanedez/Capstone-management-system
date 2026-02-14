import React, { useState, useCallback } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Search,
    BookOpen,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react';

const RepositorySearch = ({ user, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [keywordFilter, setKeywordFilter] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);

    const fetchProjects = useCallback(async (pageNum = 1) => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (searchTerm) params.append('q', searchTerm);
            if (yearFilter) params.append('year', yearFilter);
            if (keywordFilter) params.append('keyword', keywordFilter);
            params.append('page', pageNum);

            const res = await api.get(`/repository/search?${params}`);

            if (res.data?.success) {
                const { projects: results, pagination } = res.data.data;
                setProjects(results || []);
                setTotalPages(pagination?.pages || 0);
                setTotal(pagination?.total || 0);
                setPage(pageNum);
            }
        } catch (err) {
            console.error('Repository search error:', err);
            showToast?.('error', 'Failed to search repository. Please try again.');
            setProjects([]);
            setTotalPages(0);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, yearFilter, keywordFilter, showToast]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProjects(1);
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            fetchProjects(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            fetchProjects(page + 1);
        }
    };

    const canViewAcademicVersion = user?.role === 'adviser' || user?.role === 'panelist' || user?.role === 'coordinator';

    return (
        <Card>
            <CardHeader className="tw-border-b tw-border-border">
                <CardTitle className="tw-flex tw-items-center tw-gap-2">
                    <BookOpen className="tw-w-5 tw-h-5" />
                    Capstone Repository
                </CardTitle>
                <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                    Browse and search archived capstone projects.
                </p>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="tw-mt-4 tw-space-y-3">
                    <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3">
                        <div className="tw-flex-1">
                            <div className="tw-relative">
                                <Search className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="tw-w-full tw-pl-10 tw-pr-4 tw-py-2 tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-text-sm placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent tw-transition-colors"
                                />
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Year (e.g., 2024-2025)"
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="tw-w-full sm:tw-w-40 tw-px-4 tw-py-2 tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-text-sm placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent tw-transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Keyword"
                            value={keywordFilter}
                            onChange={(e) => setKeywordFilter(e.target.value)}
                            className="tw-w-full sm:tw-w-40 tw-px-4 tw-py-2 tw-rounded-md tw-border tw-border-border tw-bg-background tw-text-foreground tw-text-sm placeholder:tw-text-muted-foreground focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent tw-transition-colors"
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-2" />
                            ) : (
                                <Search className="tw-w-4 tw-h-4 tw-mr-2" />
                            )}
                            Search
                        </Button>
                    </div>
                </form>
            </CardHeader>

            <CardContent className="tw-p-6">
                {/* Loading State */}
                {loading && (
                    <div className="tw-flex tw-justify-center tw-items-center tw-gap-2 tw-py-12">
                        <Loader2 className="tw-h-6 tw-w-6 tw-animate-spin tw-text-indigo-600" />
                        <span className="tw-text-muted-foreground">Searching repository...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <div className="tw-text-center tw-py-12 tw-text-muted-foreground">
                        <BookOpen className="tw-w-12 tw-h-12 tw-mx-auto tw-mb-3 tw-opacity-30" />
                        <p className="tw-text-lg tw-font-medium">No archived projects found.</p>
                        <p className="tw-text-sm tw-mt-1">Try adjusting your search criteria.</p>
                    </div>
                )}

                {/* Results */}
                {!loading && projects.length > 0 && (
                    <div className="tw-space-y-4">
                        <p className="tw-text-sm tw-text-muted-foreground">
                            Showing {total} result{total !== 1 ? 's' : ''}
                        </p>

                        <div className="tw-space-y-4">
                            {projects.map((project) => (
                                <Card key={project._id} className="tw-border tw-border-border">
                                    <CardContent className="tw-p-5">
                                        <div className="tw-flex tw-flex-col tw-gap-3">
                                            {/* Title */}
                                            <h3 className="tw-text-base tw-font-semibold tw-text-foreground tw-leading-snug">
                                                {project.title}
                                            </h3>

                                            {/* Members */}
                                            {project.members && project.members.length > 0 && (
                                                <div className="tw-text-sm tw-text-muted-foreground">
                                                    <span className="tw-font-medium tw-text-foreground">Members: </span>
                                                    {project.members.map((member, idx) => (
                                                        <span key={idx}>
                                                            {typeof member === 'object'
                                                                ? member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim()
                                                                : member}
                                                            {idx < project.members.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Adviser */}
                                            {project.adviser && (
                                                <div className="tw-text-sm tw-text-muted-foreground">
                                                    <span className="tw-font-medium tw-text-foreground">Adviser: </span>
                                                    {typeof project.adviser === 'object'
                                                        ? project.adviser.name || `${project.adviser.firstName || ''} ${project.adviser.lastName || ''}`.trim()
                                                        : project.adviser}
                                                </div>
                                            )}

                                            {/* Academic Year */}
                                            {project.academicYear && (
                                                <div className="tw-text-sm tw-text-muted-foreground">
                                                    <span className="tw-font-medium tw-text-foreground">Academic Year: </span>
                                                    {project.academicYear}
                                                </div>
                                            )}

                                            {/* Keywords */}
                                            {project.keywords && project.keywords.length > 0 && (
                                                <div className="tw-flex tw-flex-wrap tw-gap-2">
                                                    {project.keywords.map((keyword, idx) => (
                                                        <Badge key={idx} variant="secondary">
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Document Links */}
                                            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-1">
                                                {/* Journal version - visible to all users */}
                                                {project.journalVersionUrl && (
                                                    <a
                                                        href={project.journalVersionUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="outline" size="sm">
                                                            <ExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
                                                            View Journal Paper
                                                        </Button>
                                                    </a>
                                                )}

                                                {/* Academic version - visible only to adviser, panelist, coordinator */}
                                                {canViewAcademicVersion && project.academicVersionUrl && (
                                                    <a
                                                        href={project.academicVersionUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="outline" size="sm">
                                                            <ExternalLink className="tw-w-4 tw-h-4 tw-mr-2" />
                                                            View Academic Paper
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="tw-flex tw-items-center tw-justify-between tw-pt-4 tw-border-t tw-border-border">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={page <= 1}
                                >
                                    <ChevronLeft className="tw-w-4 tw-h-4 tw-mr-1" />
                                    Previous
                                </Button>

                                <span className="tw-text-sm tw-text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={page >= totalPages}
                                >
                                    Next
                                    <ChevronRight className="tw-w-4 tw-h-4 tw-ml-1" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RepositorySearch;

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Search, TrendingUp, BarChart3, Lightbulb } from 'lucide-react';
import api from '../../services/api';

const GapAnalysisDashboard = ({ showToast }) => {
    const [keywords, setKeywords] = useState([]);
    const [clusters, setClusters] = useState([]);
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState({ keywords: false, clusters: false, suggestions: false });
    const [searchKeywords, setSearchKeywords] = useState('');

    const loadKeywords = useCallback(async () => {
        setLoading(prev => ({ ...prev, keywords: true }));
        try {
            const response = await api.get('/gap-analysis/keywords');
            setKeywords(response.data?.keywords || []);
        } catch (err) {
            console.error('Failed to load keywords:', err);
        } finally {
            setLoading(prev => ({ ...prev, keywords: false }));
        }
    }, []);

    const loadClusters = useCallback(async () => {
        setLoading(prev => ({ ...prev, clusters: true }));
        try {
            const response = await api.get('/gap-analysis/clusters');
            setClusters(response.data?.clusters || []);
        } catch (err) {
            console.error('Failed to load clusters:', err);
        } finally {
            setLoading(prev => ({ ...prev, clusters: false }));
        }
    }, []);

    const handleSearchGaps = async () => {
        if (!searchKeywords.trim()) {
            showToast('error', 'Please enter keywords to analyze');
            return;
        }

        setLoading(prev => ({ ...prev, suggestions: true }));
        try {
            const keywordsArray = searchKeywords.split(',').map(k => k.trim()).filter(Boolean);
            const response = await api.post('/gap-analysis/suggestions', { keywords: keywordsArray });
            setSuggestions(response.data);
        } catch (err) {
            console.error('Failed to get suggestions:', err);
            showToast('error', 'Failed to analyze keywords');
        } finally {
            setLoading(prev => ({ ...prev, suggestions: false }));
        }
    };

    useEffect(() => {
        loadKeywords();
        loadClusters();
    }, [loadKeywords, loadClusters]);

    const maxCount = keywords.length > 0 ? Math.max(...keywords.map(k => k.count)) : 1;

    return (
        <div className="tw-space-y-6">
            {/* Header */}
            <div>
                <h2 className="tw-text-xl tw-font-semibold tw-text-foreground">Research Gap Analysis</h2>
                <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                    Explore keyword trends, topic clusters, and identify under-researched areas.
                </p>
            </div>

            {/* Gap Suggestion Search */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <Lightbulb className="tw-w-5 tw-h-5 tw-text-amber-500" />
                        Find Research Gaps
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-flex tw-gap-3">
                        <input
                            type="text"
                            value={searchKeywords}
                            onChange={(e) => setSearchKeywords(e.target.value)}
                            placeholder="Enter keywords (comma-separated, e.g. machine learning, health, IoT)"
                            className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-4 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 tw-transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchGaps()}
                        />
                        <Button
                            onClick={handleSearchGaps}
                            disabled={loading.suggestions}
                            className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                        >
                            {loading.suggestions ? (
                                <Loader2 className="tw-w-4 tw-h-4 tw-animate-spin tw-mr-2" />
                            ) : (
                                <Search className="tw-w-4 tw-h-4 tw-mr-2" />
                            )}
                            Analyze
                        </Button>
                    </div>

                    {suggestions && (
                        <div className="tw-mt-4 tw-space-y-4">
                            {/* Saturation Level */}
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                                {suggestions.keywordAnalysis?.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`tw-rounded-lg tw-p-4 tw-border ${
                                            item.saturation === 'high'
                                                ? 'tw-bg-red-500/10 tw-border-red-500/30'
                                                : item.saturation === 'medium'
                                                ? 'tw-bg-amber-500/10 tw-border-amber-500/30'
                                                : 'tw-bg-emerald-500/10 tw-border-emerald-500/30'
                                        }`}
                                    >
                                        <div className="tw-font-medium tw-text-foreground">{item.keyword}</div>
                                        <div className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                            {item.projectCount} existing project{item.projectCount !== 1 ? 's' : ''}
                                        </div>
                                        <Badge
                                            variant={item.saturation === 'high' ? 'destructive' : item.saturation === 'medium' ? 'secondary' : 'default'}
                                            className="tw-mt-2"
                                        >
                                            {item.saturation === 'high' ? 'Saturated' : item.saturation === 'medium' ? 'Moderate' : 'Unexplored'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>

                            {/* Suggestion text */}
                            {suggestions.suggestion && (
                                <div className="tw-bg-indigo-500/10 tw-border tw-border-indigo-500/30 tw-rounded-lg tw-p-4">
                                    <h4 className="tw-font-medium tw-text-foreground tw-mb-1">Suggestion</h4>
                                    <p className="tw-text-sm tw-text-muted-foreground">{suggestions.suggestion}</p>
                                </div>
                            )}

                            {/* Related projects */}
                            {suggestions.relatedProjects?.length > 0 && (
                                <div>
                                    <h4 className="tw-font-medium tw-text-foreground tw-mb-2">Related Projects</h4>
                                    <div className="tw-space-y-2">
                                        {suggestions.relatedProjects.map((project, idx) => (
                                            <div key={idx} className="tw-bg-muted/50 tw-border tw-border-border tw-rounded tw-p-3">
                                                <div className="tw-font-medium tw-text-sm tw-text-foreground">{project.title}</div>
                                                <div className="tw-flex tw-gap-1 tw-mt-1 tw-flex-wrap">
                                                    {project.keywords?.map((kw, ki) => (
                                                        <Badge key={ki} variant="outline" className="tw-text-xs">{kw}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Keyword Frequencies */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <BarChart3 className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                        Keyword Frequency
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading.keywords ? (
                        <div className="tw-flex tw-justify-center tw-py-8">
                            <Loader2 className="tw-w-6 tw-h-6 tw-animate-spin tw-text-muted-foreground" />
                        </div>
                    ) : keywords.length === 0 ? (
                        <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
                            No keywords found in archived projects yet.
                        </div>
                    ) : (
                        <div className="tw-space-y-3">
                            {keywords.slice(0, 20).map((kw, idx) => (
                                <div key={idx} className="tw-flex tw-items-center tw-gap-3">
                                    <div className="tw-w-32 tw-text-sm tw-font-medium tw-text-foreground tw-truncate">
                                        {kw._id}
                                    </div>
                                    <div className="tw-flex-1">
                                        <div className="tw-w-full tw-bg-muted tw-rounded-full tw-h-4">
                                            <div
                                                className="tw-h-4 tw-rounded-full tw-bg-indigo-500 tw-transition-all tw-duration-500 tw-flex tw-items-center tw-justify-end tw-pr-2"
                                                style={{ width: `${Math.max((kw.count / maxCount) * 100, 8)}%` }}
                                            >
                                                <span className="tw-text-xs tw-text-white tw-font-medium">
                                                    {kw.count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Topic Clusters */}
            <Card className="tw-bg-card tw-border-border">
                <CardHeader>
                    <CardTitle className="tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                        <TrendingUp className="tw-w-5 tw-h-5 tw-text-emerald-500" />
                        Topic Clusters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading.clusters ? (
                        <div className="tw-flex tw-justify-center tw-py-8">
                            <Loader2 className="tw-w-6 tw-h-6 tw-animate-spin tw-text-muted-foreground" />
                        </div>
                    ) : clusters.length === 0 ? (
                        <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
                            No topic clusters available yet.
                        </div>
                    ) : (
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                            {clusters.map((cluster, idx) => (
                                <div
                                    key={idx}
                                    className="tw-bg-muted/50 tw-border tw-border-border tw-rounded-lg tw-p-4"
                                >
                                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                                        <h4 className="tw-font-medium tw-text-foreground tw-capitalize">
                                            {cluster._id || 'General'}
                                        </h4>
                                        <Badge variant="secondary">{cluster.count} project{cluster.count !== 1 ? 's' : ''}</Badge>
                                    </div>
                                    {cluster.titles?.length > 0 && (
                                        <div className="tw-space-y-1">
                                            {cluster.titles.slice(0, 3).map((title, ti) => (
                                                <div key={ti} className="tw-text-xs tw-text-muted-foreground tw-truncate">
                                                    {title}
                                                </div>
                                            ))}
                                            {cluster.titles.length > 3 && (
                                                <div className="tw-text-xs tw-text-indigo-500">
                                                    +{cluster.titles.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GapAnalysisDashboard;

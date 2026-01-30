import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const ProgressTracker = ({ project }) => {
    // Define all workflow stages
    const stages = [
        { key: 'proposal', label: 'Proposal', icon: '📋' },
        { key: 'chapter_1', label: 'Chapter 1', icon: '📝' },
        { key: 'chapter_2', label: 'Chapter 2', icon: '📖' },
        { key: 'chapter_3', label: 'Chapter 3', icon: '📊' },
        { key: 'chapter_4', label: 'Chapter 4', icon: '🔬' },
        { key: 'chapter_5', label: 'Chapter 5', icon: '📑' },
        { key: 'final_defense', label: 'Final Defense', icon: '🎓' },
    ];

    // Map project status to stage index
    const statusToIndex = {
        proposal: 0,
        chapter_1: 1,
        chapter_2: 2,
        chapter_3: 3,
        chapter_4: 4,
        chapter_5: 5,
        final_defense: 6,
        completed: 7,
    };

    const currentIndex = project?.status ? statusToIndex[project.status] ?? 0 : 0;
    const progressPercentage = project?.status === 'completed' 
        ? 100 
        : Math.round((currentIndex / stages.length) * 100);

    const getStageStatus = (index) => {
        if (index < currentIndex) return 'completed';
        if (index === currentIndex) return 'current';
        return 'pending';
    };

    const getStageStyles = (status) => {
        switch (status) {
            case 'completed':
                return {
                    circle: 'tw-bg-emerald-500 tw-text-white tw-border-emerald-500',
                    line: 'tw-bg-emerald-500',
                    label: 'tw-text-emerald-700 dark:tw-text-emerald-400 tw-font-medium',
                };
            case 'current':
                return {
                    circle: 'tw-bg-indigo-500 tw-text-white tw-border-indigo-500 tw-ring-4 tw-ring-indigo-500/20',
                    line: 'tw-bg-muted',
                    label: 'tw-text-indigo-700 dark:tw-text-indigo-400 tw-font-semibold',
                };
            default:
                return {
                    circle: 'tw-bg-card tw-text-muted-foreground tw-border-border',
                    line: 'tw-bg-muted',
                    label: 'tw-text-muted-foreground',
                };
        }
    };

    if (!project) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Progress Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="tw-text-center tw-py-8 tw-text-muted-foreground">
                        <p className="tw-text-4xl tw-mb-2">📊</p>
                        <p>No project selected</p>
                        <p className="tw-text-sm">Create or select a project to track progress</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="tw-flex tw-justify-between tw-items-start">
                    <div>
                        <CardTitle>Progress Tracker</CardTitle>
                        <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                            {project.title}
                        </p>
                    </div>
                    <div className="tw-text-right">
                        <span className="tw-text-2xl tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400">
                            {progressPercentage}%
                        </span>
                        <p className="tw-text-xs tw-text-muted-foreground">Complete</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="tw-mt-4">
                    <div className="tw-w-full tw-bg-muted tw-rounded-full tw-h-2">
                        <div
                            className="tw-bg-indigo-600 dark:tw-bg-indigo-500 tw-h-2 tw-rounded-full tw-transition-all tw-duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {/* Timeline */}
                <div className="tw-relative">
                    {stages.map((stage, index) => {
                        const status = getStageStatus(index);
                        const styles = getStageStyles(status);
                        const isLast = index === stages.length - 1;

                        return (
                            <div
                                key={stage.key}
                                className="tw-flex tw-items-start tw-gap-4 tw-relative"
                            >
                                {/* Connector line */}
                                {!isLast && (
                                    <div
                                        className={`tw-absolute tw-left-5 tw-top-10 tw-w-0.5 tw-h-12 ${styles.line}`}
                                    ></div>
                                )}

                                {/* Circle indicator */}
                                <div
                                    className={`tw-w-10 tw-h-10 tw-rounded-full tw-border-2 tw-flex tw-items-center tw-justify-center tw-text-lg tw-flex-shrink-0 tw-transition-all ${styles.circle}`}
                                >
                                    {status === 'completed' ? '✓' : stage.icon}
                                </div>

                                {/* Stage info */}
                                <div className={`tw-flex-1 tw-pb-8 ${isLast ? 'tw-pb-0' : ''}`}>
                                    <h4 className={`tw-text-sm ${styles.label}`}>
                                        {stage.label}
                                    </h4>
                                    {status === 'current' && (
                                        <p className="tw-text-xs tw-text-indigo-500 dark:tw-text-indigo-400 tw-mt-0.5">
                                            In Progress
                                        </p>
                                    )}
                                    {status === 'completed' && (
                                        <p className="tw-text-xs tw-text-emerald-600 dark:tw-text-emerald-400 tw-mt-0.5">
                                            Completed
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Current status info */}
                {project.status === 'completed' ? (
                    <div className="tw-mt-6 tw-p-4 tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-rounded-lg tw-border tw-border-emerald-500/30">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <span className="tw-text-2xl">🎉</span>
                            <div>
                                <h4 className="tw-font-semibold tw-text-emerald-800 dark:tw-text-emerald-300">
                                    Capstone Completed!
                                </h4>
                                <p className="tw-text-sm tw-text-emerald-600 dark:tw-text-emerald-400">
                                    Congratulations on completing your capstone project!
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="tw-mt-6 tw-p-4 tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-rounded-lg tw-border tw-border-indigo-500/30">
                        <div className="tw-flex tw-items-center tw-gap-2">
                            <span className="tw-text-2xl">💡</span>
                            <div>
                                <h4 className="tw-font-semibold tw-text-indigo-800 dark:tw-text-indigo-300">
                                    Next Steps
                                </h4>
                                <p className="tw-text-sm tw-text-indigo-600 dark:tw-text-indigo-400">
                                    Complete your current stage and submit for adviser review to progress.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProgressTracker;

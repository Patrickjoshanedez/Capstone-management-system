import React, { useState } from 'react';
import { Columns, Maximize2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

const SplitScreenViewer = ({ documents }) => {
    const [isSplitView, setIsSplitView] = useState(true);
    const [leftDocIndex, setLeftDocIndex] = useState(0);
    const [rightDocIndex, setRightDocIndex] = useState(documents.length > 1 ? 1 : 0);

    const hasDocuments = documents && documents.length > 0;

    if (!hasDocuments) {
        return (
            <div className="tw-flex tw-items-center tw-justify-center tw-h-64 tw-text-muted-foreground">
                <p className="tw-text-sm">No documents available to display.</p>
            </div>
        );
    }

    const renderPaneHeader = (selectedIndex, onSelectChange, paneLabel) => {
        const selectedDoc = documents[selectedIndex];
        return (
            <div className="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-px-4 tw-py-2 tw-border-b tw-border-border tw-bg-muted/50">
                <div className="tw-flex tw-items-center tw-gap-2 tw-flex-1 tw-min-w-0">
                    <span className="tw-text-xs tw-font-medium tw-text-muted-foreground tw-uppercase tw-tracking-wide tw-flex-shrink-0">
                        {paneLabel}
                    </span>
                    <select
                        value={selectedIndex}
                        onChange={(e) => onSelectChange(Number(e.target.value))}
                        className="tw-flex-1 tw-min-w-0 tw-text-sm tw-font-medium tw-text-foreground tw-bg-transparent tw-border tw-border-border tw-rounded-md tw-px-2 tw-py-1 tw-truncate focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                    >
                        {documents.map((doc, idx) => (
                            <option key={idx} value={idx}>
                                {doc.label}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedDoc?.url && (
                    <a
                        href={selectedDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-text-indigo-600 dark:tw-text-indigo-400 tw-flex-shrink-0 hover:tw-underline"
                    >
                        Open in New Tab
                        <ExternalLink className="tw-w-3 tw-h-3" />
                    </a>
                )}
            </div>
        );
    };

    const renderPane = (selectedIndex) => {
        const selectedDoc = documents[selectedIndex];
        if (!selectedDoc?.url) {
            return (
                <div className="tw-flex tw-items-center tw-justify-center tw-h-full tw-text-muted-foreground">
                    <p className="tw-text-sm">No URL provided for this document.</p>
                </div>
            );
        }
        return (
            <iframe
                src={selectedDoc.url}
                title={selectedDoc.label}
                className="tw-w-full tw-h-full tw-border-0"
                allow="autoplay"
            />
        );
    };

    return (
        <div className="tw-flex tw-flex-col tw-h-full tw-border tw-border-border tw-rounded-xl tw-overflow-hidden tw-bg-card">
            {/* Toolbar */}
            <div className="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-2 tw-border-b tw-border-border tw-bg-muted/30">
                <h3 className="tw-text-sm tw-font-semibold tw-text-foreground">
                    Document Viewer
                </h3>
                <div className="tw-flex tw-items-center tw-gap-2">
                    <Button
                        variant={isSplitView ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsSplitView(true)}
                        className="tw-gap-1"
                    >
                        <Columns className="tw-w-4 tw-h-4" />
                        <span className="tw-hidden sm:tw-inline">Split</span>
                    </Button>
                    <Button
                        variant={!isSplitView ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsSplitView(false)}
                        className="tw-gap-1"
                    >
                        <Maximize2 className="tw-w-4 tw-h-4" />
                        <span className="tw-hidden sm:tw-inline">Single</span>
                    </Button>
                </div>
            </div>

            {/* Content area */}
            <div
                className={`tw-flex-1 tw-min-h-0 tw-grid ${
                    isSplitView
                        ? 'tw-grid-cols-1 md:tw-grid-cols-2'
                        : 'tw-grid-cols-1'
                }`}
            >
                {/* Left / Primary Pane */}
                <div className="tw-flex tw-flex-col tw-min-h-0 tw-border-r tw-border-border">
                    {renderPaneHeader(leftDocIndex, setLeftDocIndex, 'Left')}
                    <div className="tw-flex-1 tw-min-h-0">
                        {renderPane(leftDocIndex)}
                    </div>
                </div>

                {/* Right Pane (only in split view) */}
                {isSplitView && (
                    <div className="tw-flex tw-flex-col tw-min-h-0 tw-hidden md:tw-flex">
                        {renderPaneHeader(rightDocIndex, setRightDocIndex, 'Right')}
                        <div className="tw-flex-1 tw-min-h-0">
                            {renderPane(rightDocIndex)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SplitScreenViewer;

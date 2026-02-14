import React, { useState, useCallback, useEffect } from 'react';
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
import GoogleDocsPanel from '../googledocs/GoogleDocsPanel';
import {
    BookOpen,
    Target,
    ListChecks,
    Settings,
    Layout,
    Calendar,
    Users,
    User,
    Mail,
    Edit,
    Save,
    X,
    Plus,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    FileText,
} from 'lucide-react';

const ProposalDetails = ({ project, isOpen, onClose, onUpdate, canEdit = false, showToast }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        background: '',
        problemStatement: '',
        generalObjective: '',
        specificObjectives: [],
        scope: [],
        delimitations: [],
        methodology: {
            sdlc: '',
            requirementsAnalysis: '',
            techStack: {
                frontend: '',
                backend: '',
                database: '',
                tools: []
            }
        },
        architecture: {
            contextDiagram: '',
            useCaseDiagram: '',
            erdDiagram: ''
        },
        feasibility: {
            technical: '',
            timeline: ''
        }
    });

    // New item inputs
    const [newObjective, setNewObjective] = useState('');
    const [newScope, setNewScope] = useState('');
    const [newDelimitation, setNewDelimitation] = useState('');
    const [newTool, setNewTool] = useState('');

    useEffect(() => {
        if (project?.proposal) {
            setFormData({
                background: project.proposal.background || '',
                problemStatement: project.proposal.problemStatement || '',
                generalObjective: project.proposal.generalObjective || '',
                specificObjectives: project.proposal.specificObjectives || [],
                scope: project.proposal.scope || [],
                delimitations: project.proposal.delimitations || [],
                methodology: {
                    sdlc: project.proposal.methodology?.sdlc || '',
                    requirementsAnalysis: project.proposal.methodology?.requirementsAnalysis || '',
                    techStack: {
                        frontend: project.proposal.methodology?.techStack?.frontend || '',
                        backend: project.proposal.methodology?.techStack?.backend || '',
                        database: project.proposal.methodology?.techStack?.database || '',
                        tools: project.proposal.methodology?.techStack?.tools || []
                    }
                },
                architecture: {
                    contextDiagram: project.proposal.architecture?.contextDiagram || '',
                    useCaseDiagram: project.proposal.architecture?.useCaseDiagram || '',
                    erdDiagram: project.proposal.architecture?.erdDiagram || ''
                },
                feasibility: {
                    technical: project.proposal.feasibility?.technical || '',
                    timeline: project.proposal.feasibility?.timeline || ''
                }
            });
        }
    }, [project]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const response = await api.put(`/projects/${project._id}/proposal`, {
                proposal: formData
            });
            setIsEditing(false);
            if (onUpdate) onUpdate(response.data.project);
            if (showToast) showToast('success', 'Proposal updated successfully');
        } catch (error) {
            if (showToast) showToast('error', error.response?.data?.message || 'Failed to update proposal');
        } finally {
            setSaving(false);
        }
    }, [project?._id, formData, onUpdate, showToast]);

    const addListItem = (field, value, setter) => {
        if (!value.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], value.trim()]
        }));
        setter('');
    };

    const removeListItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const addTool = () => {
        if (!newTool.trim()) return;
        setFormData(prev => ({
            ...prev,
            methodology: {
                ...prev.methodology,
                techStack: {
                    ...prev.methodology.techStack,
                    tools: [...prev.methodology.techStack.tools, newTool.trim()]
                }
            }
        }));
        setNewTool('');
    };

    const removeTool = (index) => {
        setFormData(prev => ({
            ...prev,
            methodology: {
                ...prev.methodology,
                techStack: {
                    ...prev.methodology.techStack,
                    tools: prev.methodology.techStack.tools.filter((_, i) => i !== index)
                }
            }
        }));
    };

    const getFullName = (user) => {
        if (!user) return 'Not assigned';
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown';
    };

    const canEditProposal = canEdit && ['PROPOSED', 'REVISION_REQUIRED'].includes(project?.status);

    const hasProposalContent = () => {
        const p = project?.proposal;
        if (!p) return false;
        return p.background || p.problemStatement || p.generalObjective || 
               (p.specificObjectives && p.specificObjectives.length > 0) ||
               (p.scope && p.scope.length > 0);
    };

    if (!project) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="tw-max-w-4xl tw-max-h-[90vh] tw-overflow-y-auto tw-bg-card tw-border-border">
                <DialogHeader>
                    <div className="tw-flex tw-items-start tw-justify-between">
                        <div>
                            <DialogTitle className="tw-text-xl tw-text-foreground">{project.title}</DialogTitle>
                            <DialogDescription className="tw-text-muted-foreground tw-mt-1">
                                Capstone Project Proposal
                            </DialogDescription>
                        </div>
                        <Badge variant={getStatusVariant(project.status)} className="tw-ml-4">
                            {formatStatus(project.status)}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="tw-space-y-6 tw-mt-4">
                    {/* Team Information */}
                    <Card className="tw-bg-background tw-border-border">
                        <CardHeader className="tw-pb-3">
                            <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                <Users className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                                Team Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="tw-space-y-3">
                            <div className="tw-flex tw-items-start tw-gap-3">
                                <User className="tw-w-4 tw-h-4 tw-text-muted-foreground tw-mt-1" />
                                <div>
                                    <div className="tw-text-sm tw-font-medium tw-text-foreground">Adviser</div>
                                    <div className="tw-text-sm tw-text-muted-foreground">
                                        {getFullName(project.adviser)}
                                        {project.adviser?.email && (
                                            <span className="tw-flex tw-items-center tw-gap-1 tw-mt-0.5">
                                                <Mail className="tw-w-3 tw-h-3" />
                                                {project.adviser.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="tw-flex tw-items-start tw-gap-3">
                                <Users className="tw-w-4 tw-h-4 tw-text-muted-foreground tw-mt-1" />
                                <div>
                                    <div className="tw-text-sm tw-font-medium tw-text-foreground">Team Members</div>
                                    <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-1">
                                        {project.members?.map((member, idx) => (
                                            <Badge key={idx} variant="secondary" className="tw-text-xs">
                                                {getFullName(member)}
                                                {member.email && ` (${member.email})`}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Google Docs Integration */}
                    <GoogleDocsPanel 
                        project={project}
                        onUpdate={onUpdate}
                        showToast={showToast}
                        canManage={canEdit || project.adviser?._id === project.members?.[0]?._id}
                    />

                    {/* Show empty state or editing form */}
                    {!hasProposalContent() && !isEditing ? (
                        <Card className="tw-bg-background tw-border-border tw-border-dashed">
                            <CardContent className="tw-py-12 tw-text-center">
                                <FileText className="tw-w-12 tw-h-12 tw-text-muted-foreground tw-mx-auto tw-mb-4" />
                                <h3 className="tw-text-lg tw-font-medium tw-text-foreground tw-mb-2">
                                    No Proposal Details Yet
                                </h3>
                                <p className="tw-text-sm tw-text-muted-foreground tw-mb-4">
                                    Start building your capstone proposal by adding the required sections.
                                </p>
                                {canEditProposal && (
                                    <Button 
                                        onClick={() => setIsEditing(true)}
                                        className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                                    >
                                        <Edit className="tw-w-4 tw-h-4 tw-mr-2" />
                                        Start Writing Proposal
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Edit Toggle */}
                            {canEditProposal && !isEditing && (
                                <div className="tw-flex tw-justify-end">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsEditing(true)}
                                        className="tw-gap-2"
                                    >
                                        <Edit className="tw-w-4 tw-h-4" />
                                        Edit Proposal
                                    </Button>
                                </div>
                            )}

                            {/* 1. Introduction Section */}
                            <Card className="tw-bg-background tw-border-border">
                                <CardHeader className="tw-pb-3">
                                    <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                        <BookOpen className="tw-w-5 tw-h-5 tw-text-indigo-500" />
                                        1. Introduction
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="tw-space-y-4">
                                    {/* Background */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Background of the Study</label>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.background}
                                                onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
                                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-min-h-[100px] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                placeholder="Provide context about the current state of the industry or area you are looking at..."
                                            />
                                        ) : (
                                            <p className="tw-text-sm tw-text-muted-foreground tw-mt-1 tw-whitespace-pre-wrap">
                                                {formData.background || 'Not specified'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Problem Statement */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Problem Statement</label>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.problemStatement}
                                                onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 tw-min-h-[100px] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                placeholder="What specific pain point are you solving? Be precise..."
                                            />
                                        ) : (
                                            <p className="tw-text-sm tw-text-muted-foreground tw-mt-1 tw-whitespace-pre-wrap">
                                                {formData.problemStatement || 'Not specified'}
                                            </p>
                                        )}
                                    </div>

                                    {/* General Objective */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">General Objective</label>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.generalObjective}
                                                onChange={(e) => setFormData(prev => ({ ...prev, generalObjective: e.target.value }))}
                                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                placeholder="Your main goal..."
                                            />
                                        ) : (
                                            <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                                {formData.generalObjective || 'Not specified'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Specific Objectives */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Specific Objectives</label>
                                        <div className="tw-space-y-2 tw-mt-1">
                                            {formData.specificObjectives.map((obj, idx) => (
                                                <div key={idx} className="tw-flex tw-items-center tw-gap-2">
                                                    <CheckCircle2 className="tw-w-4 tw-h-4 tw-text-emerald-500 tw-flex-shrink-0" />
                                                    <span className="tw-text-sm tw-text-muted-foreground tw-flex-1">{obj}</span>
                                                    {isEditing && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeListItem('specificObjectives', idx)}
                                                            className="tw-h-6 tw-w-6 tw-p-0 tw-text-destructive"
                                                        >
                                                            <Trash2 className="tw-w-3 tw-h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {formData.specificObjectives.length === 0 && !isEditing && (
                                                <p className="tw-text-sm tw-text-muted-foreground">No specific objectives added</p>
                                            )}
                                            {isEditing && (
                                                <div className="tw-flex tw-gap-2 tw-mt-2">
                                                    <input
                                                        value={newObjective}
                                                        onChange={(e) => setNewObjective(e.target.value)}
                                                        className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="e.g., To implement a secure login system"
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('specificObjectives', newObjective, setNewObjective))}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => addListItem('specificObjectives', newObjective, setNewObjective)}
                                                    >
                                                        <Plus className="tw-w-4 tw-h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 2. Scope and Delimitation */}
                            <Card className="tw-bg-background tw-border-border">
                                <CardHeader className="tw-pb-3">
                                    <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                        <Target className="tw-w-5 tw-h-5 tw-text-amber-500" />
                                        2. Scope and Delimitation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="tw-space-y-4">
                                    {/* Scope */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Scope (What the system WILL do)</label>
                                        <div className="tw-space-y-2 tw-mt-1">
                                            {formData.scope.map((item, idx) => (
                                                <div key={idx} className="tw-flex tw-items-center tw-gap-2">
                                                    <CheckCircle2 className="tw-w-4 tw-h-4 tw-text-emerald-500 tw-flex-shrink-0" />
                                                    <span className="tw-text-sm tw-text-muted-foreground tw-flex-1">{item}</span>
                                                    {isEditing && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeListItem('scope', idx)}
                                                            className="tw-h-6 tw-w-6 tw-p-0 tw-text-destructive"
                                                        >
                                                            <Trash2 className="tw-w-3 tw-h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {formData.scope.length === 0 && !isEditing && (
                                                <p className="tw-text-sm tw-text-muted-foreground">No scope items added</p>
                                            )}
                                            {isEditing && (
                                                <div className="tw-flex tw-gap-2 tw-mt-2">
                                                    <input
                                                        value={newScope}
                                                        onChange={(e) => setNewScope(e.target.value)}
                                                        className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="e.g., User authentication, Data visualization"
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('scope', newScope, setNewScope))}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => addListItem('scope', newScope, setNewScope)}
                                                    >
                                                        <Plus className="tw-w-4 tw-h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delimitations */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Delimitations (What the system will NOT do)</label>
                                        <div className="tw-space-y-2 tw-mt-1">
                                            {formData.delimitations.map((item, idx) => (
                                                <div key={idx} className="tw-flex tw-items-center tw-gap-2">
                                                    <AlertTriangle className="tw-w-4 tw-h-4 tw-text-amber-500 tw-flex-shrink-0" />
                                                    <span className="tw-text-sm tw-text-muted-foreground tw-flex-1">{item}</span>
                                                    {isEditing && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeListItem('delimitations', idx)}
                                                            className="tw-h-6 tw-w-6 tw-p-0 tw-text-destructive"
                                                        >
                                                            <Trash2 className="tw-w-3 tw-h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {formData.delimitations.length === 0 && !isEditing && (
                                                <p className="tw-text-sm tw-text-muted-foreground">No delimitations specified</p>
                                            )}
                                            {isEditing && (
                                                <div className="tw-flex tw-gap-2 tw-mt-2">
                                                    <input
                                                        value={newDelimitation}
                                                        onChange={(e) => setNewDelimitation(e.target.value)}
                                                        className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="e.g., The system will not handle online payments in the initial version"
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('delimitations', newDelimitation, setNewDelimitation))}
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => addListItem('delimitations', newDelimitation, setNewDelimitation)}
                                                    >
                                                        <Plus className="tw-w-4 tw-h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. Methodology */}
                            <Card className="tw-bg-background tw-border-border">
                                <CardHeader className="tw-pb-3">
                                    <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                        <Settings className="tw-w-5 tw-h-5 tw-text-purple-500" />
                                        3. Methodology
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="tw-space-y-4">
                                    {/* SDLC */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Software Development Life Cycle (SDLC)</label>
                                        {isEditing ? (
                                            <select
                                                value={formData.methodology.sdlc}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    methodology: { ...prev.methodology, sdlc: e.target.value }
                                                }))}
                                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                            >
                                                <option value="">Select SDLC Model</option>
                                                <option value="Agile/Scrum">Agile/Scrum (Recommended)</option>
                                                <option value="Waterfall">Waterfall</option>
                                                <option value="V-Model">V-Model</option>
                                                <option value="Iterative">Iterative</option>
                                                <option value="Spiral">Spiral</option>
                                            </select>
                                        ) : (
                                            <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                                {formData.methodology.sdlc || 'Not specified'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Requirements Analysis */}
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Requirements Analysis</label>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.methodology.requirementsAnalysis}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    methodology: { ...prev.methodology, requirementsAnalysis: e.target.value }
                                                }))}
                                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                placeholder="How will you gather data? (Interviews, surveys, observing current workflows)"
                                            />
                                        ) : (
                                            <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                                {formData.methodology.requirementsAnalysis || 'Not specified'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tech Stack */}
                                    <div className="tw-space-y-3">
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Technical Stack</label>
                                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
                                            <div>
                                                <label className="tw-text-xs tw-text-muted-foreground">Frontend</label>
                                                {isEditing ? (
                                                    <input
                                                        value={formData.methodology.techStack.frontend}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            methodology: {
                                                                ...prev.methodology,
                                                                techStack: { ...prev.methodology.techStack, frontend: e.target.value }
                                                            }
                                                        }))}
                                                        className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="e.g., React, Vue"
                                                    />
                                                ) : (
                                                    <p className="tw-text-sm tw-text-muted-foreground">
                                                        {formData.methodology.techStack.frontend || 'Not specified'}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="tw-text-xs tw-text-muted-foreground">Backend</label>
                                                {isEditing ? (
                                                    <input
                                                        value={formData.methodology.techStack.backend}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            methodology: {
                                                                ...prev.methodology,
                                                                techStack: { ...prev.methodology.techStack, backend: e.target.value }
                                                            }
                                                        }))}
                                                        className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="e.g., Node.js, Django"
                                                    />
                                                ) : (
                                                    <p className="tw-text-sm tw-text-muted-foreground">
                                                        {formData.methodology.techStack.backend || 'Not specified'}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="tw-text-xs tw-text-muted-foreground">Database</label>
                                                {isEditing ? (
                                                    <input
                                                        value={formData.methodology.techStack.database}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            methodology: {
                                                                ...prev.methodology,
                                                                techStack: { ...prev.methodology.techStack, database: e.target.value }
                                                            }
                                                        }))}
                                                        className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="e.g., MySQL, MongoDB"
                                                    />
                                                ) : (
                                                    <p className="tw-text-sm tw-text-muted-foreground">
                                                        {formData.methodology.techStack.database || 'Not specified'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tools */}
                                        <div>
                                            <label className="tw-text-xs tw-text-muted-foreground">Tools</label>
                                            <div className="tw-flex tw-flex-wrap tw-gap-2 tw-mt-1">
                                                {formData.methodology.techStack.tools.map((tool, idx) => (
                                                    <Badge key={idx} variant="secondary" className="tw-gap-1">
                                                        {tool}
                                                        {isEditing && (
                                                            <button
                                                                onClick={() => removeTool(idx)}
                                                                className="tw-ml-1 tw-text-destructive hover:tw-text-destructive/80"
                                                            >
                                                                <X className="tw-w-3 tw-h-3" />
                                                            </button>
                                                        )}
                                                    </Badge>
                                                ))}
                                                {formData.methodology.techStack.tools.length === 0 && !isEditing && (
                                                    <span className="tw-text-sm tw-text-muted-foreground">No tools specified</span>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <div className="tw-flex tw-gap-2 tw-mt-2">
                                                    <input
                                                        value={newTool}
                                                        onChange={(e) => setNewTool(e.target.value)}
                                                        className="tw-flex-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="e.g., GitHub, Docker, Figma"
                                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool())}
                                                    />
                                                    <Button type="button" size="sm" onClick={addTool}>
                                                        <Plus className="tw-w-4 tw-h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 4. System Architecture */}
                            <Card className="tw-bg-background tw-border-border">
                                <CardHeader className="tw-pb-3">
                                    <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                        <Layout className="tw-w-5 tw-h-5 tw-text-cyan-500" />
                                        4. System Architecture & Design
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="tw-space-y-4">
                                    <p className="tw-text-sm tw-text-muted-foreground">
                                        Upload or link to your diagrams (Context Diagram, Use Case Diagram, ERD)
                                    </p>
                                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-3">
                                        {['contextDiagram', 'useCaseDiagram', 'erdDiagram'].map((field) => (
                                            <div key={field}>
                                                <label className="tw-text-xs tw-text-muted-foreground tw-capitalize">
                                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        value={formData.architecture[field]}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            architecture: { ...prev.architecture, [field]: e.target.value }
                                                        }))}
                                                        className="tw-w-full tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-1 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                        placeholder="Link to diagram"
                                                    />
                                                ) : (
                                                    <p className="tw-text-sm tw-text-muted-foreground">
                                                        {formData.architecture[field] ? (
                                                            <a href={formData.architecture[field]} target="_blank" rel="noreferrer" className="tw-text-indigo-500 hover:tw-underline">
                                                                View Diagram
                                                            </a>
                                                        ) : 'Not provided'}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 5. Feasibility & Timeline */}
                            <Card className="tw-bg-background tw-border-border">
                                <CardHeader className="tw-pb-3">
                                    <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                        <Calendar className="tw-w-5 tw-h-5 tw-text-emerald-500" />
                                        5. Feasibility and Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="tw-space-y-4">
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Technical Feasibility</label>
                                        {isEditing ? (
                                            <textarea
                                                value={formData.feasibility.technical}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    feasibility: { ...prev.feasibility, technical: e.target.value }
                                                }))}
                                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                placeholder="Do you have the skills and hardware to build this?"
                                            />
                                        ) : (
                                            <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                                {formData.feasibility.technical || 'Not specified'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="tw-text-sm tw-font-medium tw-text-foreground">Timeline / Gantt Chart</label>
                                        {isEditing ? (
                                            <input
                                                value={formData.feasibility.timeline}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    feasibility: { ...prev.feasibility, timeline: e.target.value }
                                                }))}
                                                className="tw-w-full tw-mt-1 tw-rounded tw-border tw-border-border tw-bg-background tw-text-foreground tw-px-3 tw-py-2 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500"
                                                placeholder="Link to Gantt chart or timeline document"
                                            />
                                        ) : (
                                            <p className="tw-text-sm tw-text-muted-foreground tw-mt-1">
                                                {formData.feasibility.timeline ? (
                                                    <a href={formData.feasibility.timeline} target="_blank" rel="noreferrer" className="tw-text-indigo-500 hover:tw-underline">
                                                        View Timeline
                                                    </a>
                                                ) : 'Not provided'}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Similarity Report Section */}
                    {project.plagiarismReport && (
                        <Card className="tw-bg-background tw-border-border">
                            <CardHeader className="tw-pb-3">
                                <CardTitle className="tw-text-lg tw-flex tw-items-center tw-gap-2 tw-text-foreground">
                                    <ListChecks className="tw-w-5 tw-h-5 tw-text-orange-500" />
                                    Similarity Report
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="tw-flex tw-items-center tw-gap-4">
                                    <div className="tw-text-3xl tw-font-bold tw-text-foreground">
                                        {project.plagiarismReport.score ?? 'N/A'}%
                                    </div>
                                    <div>
                                        <Badge variant={project.plagiarismReport.score > 30 ? 'destructive' : 'default'}>
                                            {project.plagiarismReport.status || 'Pending'}
                                        </Badge>
                                        {project.plagiarismReport.reportUrl && (
                                            <a
                                                href={project.plagiarismReport.reportUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="tw-block tw-text-sm tw-text-indigo-500 hover:tw-underline tw-mt-1"
                                            >
                                                View Full Report
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter className="tw-mt-6 tw-gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                                <X className="tw-w-4 tw-h-4 tw-mr-2" />
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="tw-bg-indigo-600 hover:tw-bg-indigo-700 tw-text-white"
                            >
                                <Save className="tw-w-4 tw-h-4 tw-mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Helper functions
const getStatusVariant = (status) => {
    const variants = {
        PROPOSED: 'secondary',
        ADVISER_REVIEW: 'default',
        REVISION_REQUIRED: 'destructive',
        APPROVED_FOR_DEFENSE: 'default',
        FINAL_SUBMITTED: 'default',
        ARCHIVED: 'outline',
    };
    return variants[status] || 'secondary';
};

const formatStatus = (status) => {
    const labels = {
        PROPOSED: 'Proposed',
        ADVISER_REVIEW: 'Under Review',
        REVISION_REQUIRED: 'Needs Revision',
        APPROVED_FOR_DEFENSE: 'Approved for Defense',
        FINAL_SUBMITTED: 'Final Submitted',
        ARCHIVED: 'Archived',
    };
    return labels[status] || status;
};

export default ProposalDetails;

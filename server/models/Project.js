const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    adviser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    panelists: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: [
            // Legacy statuses (backward compatible)
            'PROPOSED', 'ADVISER_REVIEW', 'REVISION_REQUIRED', 'APPROVED_FOR_DEFENSE', 'FINAL_SUBMITTED', 'ARCHIVED',
            // Capstone 1 (Proposal)
            'TOPIC_SELECTION',
            'CHAPTER_1_DRAFT', 'CHAPTER_1_REVIEW', 'CHAPTER_1_APPROVED',
            'CHAPTER_2_DRAFT', 'CHAPTER_2_REVIEW', 'CHAPTER_2_APPROVED',
            'CHAPTER_3_DRAFT', 'CHAPTER_3_REVIEW', 'CHAPTER_3_APPROVED',
            'PROPOSAL_CONSOLIDATION', 'PROPOSAL_DEFENSE', 'PROPOSAL_DEFENDED',
            // Capstone 2 (Design & Implementation)
            'CAPSTONE2_IN_PROGRESS', 'CAPSTONE2_REVIEW', 'CAPSTONE2_APPROVED',
            // Capstone 3 (Testing & Refinement)
            'CAPSTONE3_IN_PROGRESS', 'CAPSTONE3_REVIEW', 'CAPSTONE3_APPROVED',
            // Capstone 4 (Finalization)
            'FINAL_COMPILATION', 'PLAGIARISM_CHECK', 'FINAL_DEFENSE',
            'FINAL_APPROVED', 'CREDENTIAL_UPLOAD',
            // Special
            'PROJECT_RESET'
        ],
        default: 'PROPOSED'
    },
    capstonePhase: {
        type: Number,
        enum: [1, 2, 3, 4],
        default: 1
    },
    chapters: [{
        capstonePhase: { type: Number, required: true },
        chapterNumber: { type: Number, required: true },
        title: { type: String, default: '' },
        status: {
            type: String,
            enum: ['draft', 'submitted', 'under_review', 'revision_required', 'approved'],
            default: 'draft'
        },
        versions: [{
            fileId: String,
            webViewLink: String,
            uploadedAt: { type: Date, default: Date.now },
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            versionNumber: { type: Number, default: 1 },
            lateRemarks: {
                isLate: { type: Boolean, default: false },
                justification: String
            }
        }],
        adviserFeedback: [{
            content: { type: String, required: true },
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now },
            section: String,
            resolved: { type: Boolean, default: false }
        }],
        submittedAt: Date,
        approvedAt: Date,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    // Proposal Details - Introduction Section
    proposal: {
        // Background of the Study
        background: {
            type: String,
            default: ''
        },
        // Problem Statement
        problemStatement: {
            type: String,
            default: ''
        },
        // Objectives
        generalObjective: {
            type: String,
            default: ''
        },
        specificObjectives: [{
            type: String
        }],
        // Scope and Delimitation
        scope: [{
            type: String
        }],
        delimitations: [{
            type: String
        }],
        // Methodology
        methodology: {
            sdlc: {
                type: String,
                enum: ['Agile/Scrum', 'Waterfall', 'V-Model', 'Iterative', 'Spiral', ''],
                default: ''
            },
            requirementsAnalysis: {
                type: String,
                default: ''
            },
            techStack: {
                frontend: { type: String, default: '' },
                backend: { type: String, default: '' },
                database: { type: String, default: '' },
                tools: [{ type: String }]
            }
        },
        // System Architecture
        architecture: {
            contextDiagram: { type: String, default: '' },
            useCaseDiagram: { type: String, default: '' },
            erdDiagram: { type: String, default: '' }
        },
        // Feasibility
        feasibility: {
            technical: { type: String, default: '' },
            timeline: { type: String, default: '' }
        }
    },
    document: {
        fileId: String,
        webViewLink: String,
        uploadedAt: Date
    },
    // Google Docs Integration
    googleDocs: {
        documentId: { type: String, default: '' },
        documentUrl: { type: String, default: '' },
        createdAt: { type: Date },
        lastSyncedAt: { type: Date }
    },
    plagiarismReport: {
        score: Number,
        status: String,
        reportUrl: String
    },
    // Comments and Feedback System
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        section: {
            type: String,
            enum: ['general', 'background', 'problemStatement', 'objectives', 'scope', 'methodology', 'architecture', 'feasibility'],
            default: 'general'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Status History for Audit Trail
    statusHistory: [{
        fromStatus: String,
        toStatus: String,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        comment: String,
        changedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Revision Feedback (for tracking revision requests)
    revisionFeedback: {
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        feedback: String,
        requestedAt: Date,
        addressedAt: Date
    },
    // Pessimistic Document Locking
    documentLock: {
        isLocked: { type: Boolean, default: false },
        lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lockedAt: Date,
        chapterId: String,
        unlockRequests: [{
            requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            requestedAt: { type: Date, default: Date.now },
            status: { type: String, enum: ['pending', 'granted', 'denied'], default: 'pending' }
        }]
    },
    // Title management
    titleLocked: { type: Boolean, default: false },
    titleHistory: [{
        title: String,
        changedAt: { type: Date, default: Date.now },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    // Searchability
    keywords: [{ type: String }],
    academicYear: { type: String, default: '' },
    // Capstone 4 (Finalization)
    capstone4: {
        academicVersion: {
            fileId: String,
            webViewLink: String,
            uploadedAt: Date
        },
        journalVersion: {
            fileId: String,
            webViewLink: String,
            uploadedAt: Date
        },
        compiledReferences: { type: String, default: '' },
        plagiarismReport: {
            score: { type: Number },
            status: { type: String, enum: ['pending', 'clear', 'flagged'], default: 'pending' },
            reportUrl: String,
            checkedAt: Date
        },
        credentials: [{
            type: { type: String, enum: ['clearance', 'panel_approval', 'ethics_review', 'hardbound_receipt', 'other'] },
            name: String,
            fileId: String,
            webViewLink: String,
            uploadedAt: { type: Date, default: Date.now },
            uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }],
        defenseVerdict: {
            result: { type: String, enum: ['passed', 'failed', 'conditional'] },
            remarks: String,
            evaluatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            evaluatedAt: Date
        }
    },
    // Prototypes (screenshots, videos, links)
    prototypes: [{
        type: { type: String, enum: ['image', 'video', 'link'] },
        title: String,
        description: String,
        fileId: String,
        webViewLink: String,
        externalUrl: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// State Machine Validation
ProjectSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        // Logic to validate transitions can be added here or in the controller/service layer
        // For strict schema validation, we rely on the enum.
        // Complex role-based transition checks are better handled in the controller.
    }
    next();
});

module.exports = mongoose.model('Project', ProjectSchema);

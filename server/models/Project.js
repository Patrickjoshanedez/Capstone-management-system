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
    status: {
        type: String,
        enum: ['PROPOSED', 'ADVISER_REVIEW', 'REVISION_REQUIRED', 'APPROVED_FOR_DEFENSE', 'FINAL_SUBMITTED', 'ARCHIVED'],
        default: 'PROPOSED'
    },
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
    plagiarismReport: {
        score: Number,
        status: String,
        reportUrl: String
    }
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

/**
 * Google Docs Service
 * 
 * Provides integration with Google Docs API for collaborative document editing.
 * Supports OAuth2 (recommended) or Service Account authentication.
 * 
 * OAUTH2 SETUP (Recommended - uses your own Drive storage):
 * 1. Go to Google Cloud Console (https://console.cloud.google.com)
 * 2. Create OAuth2 credentials (Web application)
 * 3. Get a refresh token using OAuth2 Playground
 * 4. Set CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN in .env
 * 
 * SERVICE ACCOUNT SETUP (Alternative - has limited storage):
 * 1. Create a Service Account and download JSON key
 * 2. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env
 */

const { google } = require('googleapis');

class GoogleDocsService {
    constructor() {
        this.docs = null;
        this.drive = null;
        this.auth = null;
        this.isInitialized = false;
        this.initError = null;
        this.authMethod = null; // 'oauth2' or 'service_account'
    }

    /**
     * Initialize the Google APIs with OAuth2 or Service Account credentials
     * @returns {Promise<boolean>} Whether initialization was successful
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            // Priority 1: OAuth2 with refresh token (uses user's Drive storage quota)
            if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.REFRESH_TOKEN) {
                this.auth = new google.auth.OAuth2(
                    process.env.CLIENT_ID,
                    process.env.CLIENT_SECRET
                );
                
                this.auth.setCredentials({
                    refresh_token: process.env.REFRESH_TOKEN
                });
                
                // Test the credentials by getting a new access token
                await this.auth.getAccessToken();
                
                this.authMethod = 'oauth2';
                console.log('GoogleDocsService: Using OAuth2 authentication (your Drive storage)');
            }
            // Priority 2: Service Account (has limited/no storage quota)
            else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
                this.auth = new google.auth.JWT({
                    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                    scopes: [
                        'https://www.googleapis.com/auth/documents',
                        'https://www.googleapis.com/auth/drive',
                        'https://www.googleapis.com/auth/drive.file'
                    ]
                });
                
                await this.auth.authorize();
                this.authMethod = 'service_account';
                console.log('GoogleDocsService: Using Service Account authentication');
            }
            // Priority 3: Service Account from JSON string
            else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
                try {
                    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
                    this.auth = new google.auth.JWT({
                        email: credentials.client_email,
                        key: credentials.private_key,
                        scopes: [
                            'https://www.googleapis.com/auth/documents',
                            'https://www.googleapis.com/auth/drive',
                            'https://www.googleapis.com/auth/drive.file'
                        ]
                    });
                    await this.auth.authorize();
                    this.authMethod = 'service_account';
                } catch (parseError) {
                    console.error('GoogleDocsService: Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', parseError.message);
                    this.initError = 'Invalid GOOGLE_SERVICE_ACCOUNT_KEY format';
                    return false;
                }
            }
            else {
                console.warn('GoogleDocsService: No Google credentials configured. Google Docs integration disabled.');
                console.warn('  Set CLIENT_ID + CLIENT_SECRET + REFRESH_TOKEN (OAuth2), or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY');
                this.initError = 'No Google credentials configured';
                return false;
            }

            // Initialize API clients
            this.docs = google.docs({ version: 'v1', auth: this.auth });
            this.drive = google.drive({ version: 'v3', auth: this.auth });

            this.isInitialized = true;
            console.log('GoogleDocsService: Initialized successfully');
            return true;
        } catch (error) {
            console.error('GoogleDocsService: Initialization failed:', error.message);
            this.initError = error.message;
            return false;
        }
    }

    /**
     * Check if the service is available
     * @returns {object} Status object with isAvailable and error message
     */
    getStatus() {
        return {
            isAvailable: this.isInitialized,
            authMethod: this.authMethod,
            error: this.initError
        };
    }

    /**
     * Create a new Google Doc for a project
     * @param {string} title - Document title
     * @param {string} projectId - Project ID for organizing
     * @param {Array<string>} editorEmails - Email addresses to share with (edit access)
     * @returns {Promise<object>} Document details including ID and URL
     */
    async createDocument(title, projectId, editorEmails = []) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Google Docs service not available: ' + this.initError);
            }
        }

        try {
            const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
            const ownerEmail = process.env.GOOGLE_DRIVE_OWNER_EMAIL;
            let documentId;
            
            // Create document directly in the shared folder
            if (folderId) {
                const createResponse = await this.drive.files.create({
                    requestBody: {
                        name: `[Capstone] ${title}`,
                        mimeType: 'application/vnd.google-apps.document',
                        parents: [folderId],
                        // Set writersCanShare to allow editors to share
                        writersCanShare: true
                    },
                    fields: 'id',
                    supportsAllDrives: true
                });
                documentId = createResponse.data.id;
                
                // Make the document accessible to anyone with the link for editing
                // This is needed because service accounts can't transfer ownership to personal Gmail
                try {
                    await this.drive.permissions.create({
                        fileId: documentId,
                        requestBody: {
                            type: 'anyone',
                            role: 'writer'
                        }
                    });
                    console.log('GoogleDocsService: Set document to anyone with link can edit');
                } catch (permError) {
                    console.warn('GoogleDocsService: Could not set link sharing:', permError.message);
                }
                
                // Also share with specific editors if provided
                for (const email of editorEmails) {
                    try {
                        await this.drive.permissions.create({
                            fileId: documentId,
                            requestBody: {
                                type: 'user',
                                role: 'writer',
                                emailAddress: email
                            },
                            sendNotificationEmail: false
                        });
                    } catch (shareError) {
                        console.warn(`GoogleDocsService: Could not share with ${email}:`, shareError.message);
                    }
                }
            } else {
                // Fallback: Create via Docs API
                const createResponse = await this.docs.documents.create({
                    requestBody: {
                        title: `[Capstone] ${title}`
                    }
                });
                documentId = createResponse.data.documentId;
            }

            const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

            // Add initial content/template
            try {
                await this.addInitialTemplate(documentId, title);
            } catch (templateError) {
                console.warn('GoogleDocsService: Could not add template:', templateError.message);
            }

            return {
                documentId,
                documentUrl,
                title: `[Capstone] ${title}`,
                createdAt: new Date()
            };
        } catch (error) {
            console.error('GoogleDocsService: Failed to create document:', error.message);
            throw error;
        }
    }

    /**
     * Add initial template content to a document
     * @param {string} documentId - Google Doc ID
     * @param {string} projectTitle - Project title
     */
    async addInitialTemplate(documentId, projectTitle) {
        if (!this.isInitialized) return;

        try {
            const requests = [
                // Title
                {
                    insertText: {
                        location: { index: 1 },
                        text: `${projectTitle}\n\nCapstone Project Proposal\n\n`
                    }
                },
                // Format title as heading
                {
                    updateParagraphStyle: {
                        range: { startIndex: 1, endIndex: projectTitle.length + 1 },
                        paragraphStyle: {
                            namedStyleType: 'HEADING_1',
                            alignment: 'CENTER'
                        },
                        fields: 'namedStyleType,alignment'
                    }
                },
                // Section headers
                {
                    insertText: {
                        location: { index: projectTitle.length + 30 },
                        text: `1. BACKGROUND OF THE STUDY\n\n[Enter the background of your study here...]\n\n` +
                              `2. PROBLEM STATEMENT\n\n[Describe the problem your project addresses...]\n\n` +
                              `3. OBJECTIVES\n\n3.1 General Objective\n[Enter general objective...]\n\n` +
                              `3.2 Specific Objectives\n• [Specific objective 1]\n• [Specific objective 2]\n• [Specific objective 3]\n\n` +
                              `4. SCOPE AND DELIMITATIONS\n\n4.1 Scope\n[Define the scope...]\n\n` +
                              `4.2 Delimitations\n[Define the delimitations...]\n\n` +
                              `5. METHODOLOGY\n\n5.1 Development Approach\n[Describe your SDLC model...]\n\n` +
                              `5.2 Technology Stack\n• Frontend: \n• Backend: \n• Database: \n• Tools: \n\n` +
                              `6. SYSTEM ARCHITECTURE\n\n[Include system diagrams and descriptions...]\n\n` +
                              `7. FEASIBILITY\n\n7.1 Technical Feasibility\n[Discuss technical feasibility...]\n\n` +
                              `7.2 Timeline\n[Provide project timeline...]\n\n`
                    }
                }
            ];

            await this.docs.documents.batchUpdate({
                documentId,
                requestBody: { requests }
            });
        } catch (error) {
            console.warn('GoogleDocsService: Could not add template:', error.message);
            // Non-critical error, document still created
        }
    }

    /**
     * Share a document with a user
     * @param {string} documentId - Google Doc ID
     * @param {string} email - Email address to share with
     * @param {string} role - 'reader', 'writer', or 'commenter'
     */
    async shareDocument(documentId, email, role = 'writer') {
        if (!this.isInitialized) {
            throw new Error('Google Docs service not initialized');
        }

        try {
            await this.drive.permissions.create({
                fileId: documentId,
                requestBody: {
                    type: 'user',
                    role: role,
                    emailAddress: email
                },
                sendNotificationEmail: true,
                emailMessage: 'You have been granted access to edit this Capstone project document.'
            });

            return true;
        } catch (error) {
            console.error(`GoogleDocsService: Failed to share document with ${email}:`, error.message);
            throw error;
        }
    }

    /**
     * Get document content/text
     * @param {string} documentId - Google Doc ID
     * @returns {Promise<string>} Document text content
     */
    async getDocumentContent(documentId) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Google Docs service not available: ' + this.initError);
            }
        }

        try {
            const response = await this.docs.documents.get({
                documentId: documentId
            });

            // Extract text content from document
            let text = '';
            const content = response.data.body?.content || [];

            for (const element of content) {
                if (element.paragraph) {
                    for (const textRun of element.paragraph.elements || []) {
                        if (textRun.textRun) {
                            text += textRun.textRun.content || '';
                        }
                    }
                }
            }

            return text;
        } catch (error) {
            console.error('GoogleDocsService: Failed to get document content:', error.message);
            throw error;
        }
    }

    /**
     * Get document metadata
     * @param {string} documentId - Google Doc ID
     * @returns {Promise<object>} Document metadata
     */
    async getDocumentInfo(documentId) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Google Docs service not available: ' + this.initError);
            }
        }

        try {
            const [docResponse, driveResponse] = await Promise.all([
                this.docs.documents.get({ documentId }),
                this.drive.files.get({
                    fileId: documentId,
                    fields: 'id,name,modifiedTime,createdTime,webViewLink,owners,lastModifyingUser'
                })
            ]);

            return {
                documentId: documentId,
                title: docResponse.data.title,
                url: driveResponse.data.webViewLink,
                createdTime: driveResponse.data.createdTime,
                modifiedTime: driveResponse.data.modifiedTime,
                lastModifiedBy: driveResponse.data.lastModifyingUser?.emailAddress || 'Unknown'
            };
        } catch (error) {
            console.error('GoogleDocsService: Failed to get document info:', error.message);
            throw error;
        }
    }

    /**
     * Delete a document
     * @param {string} documentId - Google Doc ID
     */
    async deleteDocument(documentId) {
        if (!this.isInitialized) {
            throw new Error('Google Docs service not initialized');
        }

        try {
            await this.drive.files.delete({
                fileId: documentId
            });
            return true;
        } catch (error) {
            console.error('GoogleDocsService: Failed to delete document:', error.message);
            throw error;
        }
    }

    /**
     * Update document permissions (add or remove editors)
     * @param {string} documentId - Google Doc ID
     * @param {Array<string>} currentEmails - Current list of editor emails
     * @param {Array<string>} newEmails - New list of editor emails
     */
    async updateDocumentPermissions(documentId, currentEmails, newEmails) {
        if (!this.isInitialized) {
            throw new Error('Google Docs service not initialized');
        }

        // Find emails to add and remove
        const toAdd = newEmails.filter(e => !currentEmails.includes(e));
        const toRemove = currentEmails.filter(e => !newEmails.includes(e));

        // Add new permissions
        for (const email of toAdd) {
            try {
                await this.shareDocument(documentId, email, 'writer');
            } catch (error) {
                console.warn(`Could not add ${email}:`, error.message);
            }
        }

        // Remove old permissions
        if (toRemove.length > 0) {
            try {
                const permissions = await this.drive.permissions.list({
                    fileId: documentId,
                    fields: 'permissions(id,emailAddress,role)'
                });

                for (const permission of permissions.data.permissions || []) {
                    if (toRemove.includes(permission.emailAddress)) {
                        await this.drive.permissions.delete({
                            fileId: documentId,
                            permissionId: permission.id
                        });
                    }
                }
            } catch (error) {
                console.warn('Could not remove permissions:', error.message);
            }
        }
    }

    /**
     * Sync document content to project proposal fields
     * This is a placeholder - would need NLP/parsing to extract sections
     * @param {string} documentId - Google Doc ID
     * @returns {Promise<object>} Extracted proposal data
     */
    async syncToProposal(documentId) {
        if (!this.isInitialized) {
            throw new Error('Google Docs service not initialized');
        }

        try {
            const content = await this.getDocumentContent(documentId);
            const info = await this.getDocumentInfo(documentId);

            // For now, return the raw content
            // Future: Implement section parsing
            return {
                documentId,
                title: info.title,
                rawContent: content,
                lastSyncedAt: new Date(),
                // Placeholder for parsed sections
                sections: {
                    background: '',
                    problemStatement: '',
                    generalObjective: '',
                    specificObjectives: [],
                    scope: [],
                    delimitations: [],
                    methodology: '',
                    architecture: '',
                    feasibility: ''
                }
            };
        } catch (error) {
            console.error('GoogleDocsService: Failed to sync document:', error.message);
            throw error;
        }
    }
}

// Export singleton instance
const googleDocsService = new GoogleDocsService();
module.exports = googleDocsService;

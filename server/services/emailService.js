const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        const smtpConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

        // Only initialize if SMTP credentials are configured
        if (smtpConfig.auth.user && smtpConfig.auth.pass) {
            this.transporter = nodemailer.createTransport(smtpConfig);
            this.initialized = true;
            console.log('📧 Email service initialized');
        } else {
            console.warn('⚠️ Email service not configured - SMTP credentials missing');
        }
    }

    async sendEmail(to, subject, html, text = null) {
        if (!this.initialized || !this.transporter) {
            console.warn('Email service not initialized, skipping email to:', to);
            return { success: false, reason: 'Email service not configured' };
        }

        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to,
                subject,
                html,
                text: text || this.stripHtml(html)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent to:', to);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Email send failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    // Email Templates

    async sendProposalSubmitted(adviserEmail, adviserName, projectTitle, studentNames) {
        const subject = `[Capstone] New Proposal Submitted: ${projectTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📋 New Proposal Submission</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
                    <p style="color: #334155;">Dear ${adviserName},</p>
                    <p style="color: #334155;">A new capstone proposal has been submitted for your review:</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 15px 0;">
                        <h3 style="color: #1e293b; margin: 0 0 10px 0;">${projectTitle}</h3>
                        <p style="color: #64748b; margin: 0;">Team Members: ${studentNames}</p>
                    </div>
                    
                    <p style="color: #334155;">Please review the proposal and provide your feedback.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px;">
                        Review Proposal
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">This is an automated message from Project Workspace.</p>
                </div>
            </div>
        `;
        return this.sendEmail(adviserEmail, subject, html);
    }

    async sendRevisionRequested(recipientEmails, recipientNames, projectTitle, comment, reviewerName) {
        const subject = `[Capstone] Revision Required: ${projectTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📝 Revision Required</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
                    <p style="color: #334155;">Dear Team,</p>
                    <p style="color: #334155;">Your capstone proposal requires revisions:</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 15px 0;">
                        <h3 style="color: #1e293b; margin: 0 0 10px 0;">${projectTitle}</h3>
                        <p style="color: #64748b; margin: 0;">Reviewed by: ${reviewerName}</p>
                    </div>
                    
                    ${comment ? `
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h4 style="color: #92400e; margin: 0 0 8px 0;">Feedback:</h4>
                        <p style="color: #78350f; margin: 0;">${comment}</p>
                    </div>
                    ` : ''}
                    
                    <p style="color: #334155;">Please address the feedback and resubmit your proposal.</p>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px;">
                        View Details
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">This is an automated message from Project Workspace.</p>
                </div>
            </div>
        `;
        
        // Send to all recipients
        const results = [];
        for (const email of recipientEmails) {
            results.push(await this.sendEmail(email, subject, html));
        }
        return results;
    }

    async sendProposalApproved(recipientEmails, projectTitle, approverName, newStatus) {
        const statusMessages = {
            'ADVISER_APPROVED': 'Your proposal has been approved by your adviser!',
            'APPROVED_FOR_DEFENSE': 'Your proposal has been approved for defense!',
            'COMPLETED': 'Congratulations! Your capstone project has been marked as completed!',
            'ARCHIVED': 'Your capstone project has been archived.'
        };

        const subject = `[Capstone] ✅ Proposal Approved: ${projectTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">✅ Proposal Approved</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
                    <p style="color: #334155;">Dear Team,</p>
                    <p style="color: #334155;">${statusMessages[newStatus] || 'Your proposal status has been updated.'}</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 15px 0;">
                        <h3 style="color: #1e293b; margin: 0 0 10px 0;">${projectTitle}</h3>
                        <p style="color: #64748b; margin: 0;">Approved by: ${approverName}</p>
                        <p style="color: #64748b; margin: 5px 0 0 0;">New Status: <strong>${newStatus.replace(/_/g, ' ')}</strong></p>
                    </div>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px;">
                        View Project
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">This is an automated message from Project Workspace.</p>
                </div>
            </div>
        `;

        const results = [];
        for (const email of recipientEmails) {
            results.push(await this.sendEmail(email, subject, html));
        }
        return results;
    }

    async sendStatusChanged(recipientEmails, projectTitle, fromStatus, toStatus, changedBy) {
        const subject = `[Capstone] Status Update: ${projectTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📊 Status Update</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
                    <p style="color: #334155;">The status of your capstone project has been updated:</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <h3 style="color: #1e293b; margin: 0 0 15px 0;">${projectTitle}</h3>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="background: #fee2e2; color: #991b1b; padding: 5px 10px; border-radius: 4px; font-size: 12px;">${fromStatus.replace(/_/g, ' ')}</span>
                            <span style="color: #64748b;">→</span>
                            <span style="background: #dcfce7; color: #166534; padding: 5px 10px; border-radius: 4px; font-size: 12px;">${toStatus.replace(/_/g, ' ')}</span>
                        </div>
                        <p style="color: #64748b; margin: 10px 0 0 0; font-size: 13px;">Changed by: ${changedBy}</p>
                    </div>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px;">
                        View Project
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">This is an automated message from Project Workspace.</p>
                </div>
            </div>
        `;

        const results = [];
        for (const email of recipientEmails) {
            results.push(await this.sendEmail(email, subject, html));
        }
        return results;
    }

    async sendDocumentUploaded(recipientEmails, projectTitle, documentName, uploaderName) {
        const subject = `[Capstone] New Document Uploaded: ${projectTitle}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">📄 Document Uploaded</h1>
                </div>
                <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
                    <p style="color: #334155;">A new document has been uploaded to your capstone project:</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 15px 0;">
                        <h3 style="color: #1e293b; margin: 0 0 10px 0;">${projectTitle}</h3>
                        <p style="color: #64748b; margin: 0;">Document: ${documentName}</p>
                        <p style="color: #64748b; margin: 5px 0 0 0;">Uploaded by: ${uploaderName}</p>
                    </div>
                    
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 15px;">
                        View Document
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px;">This is an automated message from Project Workspace.</p>
                </div>
            </div>
        `;

        const results = [];
        for (const email of recipientEmails) {
            results.push(await this.sendEmail(email, subject, html));
        }
        return results;
    }
}

// Export singleton instance
const emailService = new EmailService();
module.exports = emailService;

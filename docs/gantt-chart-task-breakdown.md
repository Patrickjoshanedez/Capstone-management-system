# Capstone Management System - Gantt Chart Task Breakdown

## Project: Project Workspace (Capstone Management System)
**Institution:** Bukidnon State University (BukSU)
**Program:** BSIT / BSEMC
**Tech Stack:** MERN (React + Vite, Node.js + Express, MongoDB, Google Drive/Docs API)
**Deployment:** Render (Backend), Vercel (Frontend), MongoDB Atlas M0

---

## How to Read This Document

Each phase is broken into **specific, actionable tasks** suitable for a Gantt chart. Each task includes:
- **Task ID** for tracking and dependencies
- **Task Name** and description
- **Deliverables** expected output
- **Dependencies** (prerequisite tasks)

Use this breakdown to populate your Gantt chart tool (MS Project, GanttPro, TeamGantt, or Google Sheets).

---

## PHASE 1: DATA GATHERING & ANALYSIS

### 1.1 Document Analysis

| Task ID | Task Name | Description | Deliverables |
|---------|-----------|-------------|--------------|
| 1.1.1 | Review BukSU Capstone Guidelines | Obtain and analyze the official BukSU capstone/thesis manual covering format requirements, approval workflows, and grading rubrics. | Annotated summary of capstone guidelines |
| 1.1.2 | Review BSIT Curriculum Requirements | Analyze the BSIT curriculum for Capstone 1 and Capstone 2 course requirements, prerequisites, and expected deliverables per phase. | Curriculum requirements matrix |
| 1.1.3 | Review BSEMC Curriculum Requirements | Analyze the BSEMC curriculum for capstone-related courses, identifying differences from BSIT in deliverables and grading. | BSEMC-specific requirements document |
| 1.1.4 | Analyze Existing Capstone Workflow | Map the current manual/paper-based capstone workflow from topic approval through final defense, identifying bottlenecks and pain points. | Current workflow flowchart with identified pain points |
| 1.1.5 | Review University Data Privacy Policy | Examine BukSU's data privacy and academic records policies to ensure the system complies with institutional data handling rules. | Data privacy compliance checklist |
| 1.1.6 | Analyze Defense Evaluation Criteria | Study the grading rubrics used by panelists during proposal and final defense, identifying fields and scoring metrics needed in the system. | Defense evaluation criteria specification |
| 1.1.7 | Document Chapter Submission Requirements | Catalog the required chapters (1-5), their expected content, formatting rules, and the review/approval process for each. | Chapter requirements specification |
| 1.1.8 | Compile Document Analysis Report | Consolidate all findings from tasks 1.1.1-1.1.7 into a unified document analysis report. | Comprehensive document analysis report |

### 1.2 Key Informant Interviews

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 1.2.1 | Prepare Interview Questionnaire for Advisers | Design structured interview questions targeting adviser workflows: how they review chapters, provide feedback, track student progress, and communicate revisions. | Adviser interview questionnaire | 1.1.4 |
| 1.2.2 | Prepare Interview Questionnaire for Panel Members | Design questions targeting panel evaluation processes: how they review proposals, conduct defense evaluations, and provide verdict/feedback. | Panel member interview questionnaire | 1.1.6 |
| 1.2.3 | Prepare Interview Questionnaire for Coordinators | Design questions targeting coordination tasks: managing deadlines, assigning advisers, monitoring overall progress, handling title changes, and archiving final manuscripts. | Coordinator interview questionnaire | 1.1.4 |
| 1.2.4 | Conduct Adviser Interviews (Min. 3) | Interview at least 3 capstone advisers to gather insights on their review workflow, pain points with the current process, and desired system features. | Transcribed interview notes and thematic analysis |
| 1.2.5 | Conduct Panel Member Interviews (Min. 3) | Interview at least 3 panel members to understand their evaluation criteria, defense procedures, and desired improvements. | Transcribed interview notes and thematic analysis |
| 1.2.6 | Conduct Coordinator Interviews (Min. 2) | Interview at least 2 capstone coordinators to understand administrative workflows, deadline management, and reporting needs. | Transcribed interview notes and thematic analysis |
| 1.2.7 | Analyze Interview Themes and Findings | Perform thematic analysis across all interviews to identify common requirements, feature requests, and priority areas. | Interview analysis summary with prioritized requirements | 1.2.4, 1.2.5, 1.2.6 |

### 1.3 User Surveys

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 1.3.1 | Design Student Survey Instrument | Create a survey covering current capstone workflow experience, technology usage habits, desired features, and usability expectations. Target: 3rd and 4th-year BSIT/BSEMC students. | Validated survey questionnaire | 1.1.4 |
| 1.3.2 | Validate Survey Instrument | Submit survey for content validation by a research adviser or subject-matter expert. Perform pilot testing with 5 respondents. | Validated and pilot-tested survey | 1.3.1 |
| 1.3.3 | Identify and Contact Survey Respondents | Identify the target population of 3rd and 4th-year BSIT/BSEMC students. Determine sample size and sampling technique. | Respondent list and sampling documentation | 1.3.2 |
| 1.3.4 | Distribute and Collect Surveys | Distribute surveys via Google Forms or printed copies. Monitor completion rates and follow up for adequate response rate. | Raw survey response data | 1.3.3 |
| 1.3.5 | Tabulate and Analyze Survey Results | Use statistical tools (weighted mean, frequency distribution) to analyze responses. Identify top-requested features and usability priorities. | Statistical analysis report with charts | 1.3.4 |
| 1.3.6 | Compile User Needs Assessment | Synthesize interview findings (1.2.7) and survey results (1.3.5) into a comprehensive user needs assessment. | User needs assessment document | 1.2.7, 1.3.5 |

### 1.4 System Requirements Specification (SRS)

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 1.4.1 | Define Functional Requirements | Catalog all functional requirements based on user needs, organized by module: Authentication, Project Management, Chapter Submission, Adviser Review, Panel Defense, Coordinator Dashboard, Notifications, Document Vault, Google Docs Integration, Plagiarism Checking (placeholder), Reports. | Functional requirements document | 1.3.6 |
| 1.4.2 | Define Non-Functional Requirements | Specify performance targets (response time <2s), security requirements (JWT, bcrypt, HTTPS), scalability constraints (512MB RAM limit), availability targets, and browser compatibility. | Non-functional requirements document | 1.3.6 |
| 1.4.3 | Define System Constraints | Document constraints: zero-cost deployment (Render Free Tier, Vercel, MongoDB Atlas M0), 512MB RAM limit, 25MB file upload limit, Google Drive 15GB storage, and streaming-only file handling. | Constraints specification | 1.4.1 |
| 1.4.4 | Define Use Cases and User Stories | Write detailed use cases for each role (Student, Adviser, Panelist, Coordinator) covering all major workflows. Include preconditions, postconditions, and alternate flows. | Use case diagrams and user story catalog | 1.4.1 |
| 1.4.5 | Define Data Dictionary | Create a data dictionary mapping all entities (User, Project, Team, Chapter, Notification, Topic, Deadline, etc.) with their attributes, data types, and relationships. Reference: `server/models/` schemas. | Data dictionary document | 1.4.1 |
| 1.4.6 | Finalize and Sign-Off SRS Document | Compile all requirements into a formal SRS document following IEEE 830 or equivalent standard. Obtain sign-off from capstone adviser. | Final SRS document (signed off) | 1.4.1, 1.4.2, 1.4.3, 1.4.4, 1.4.5 |

---

## PHASE 2: SYSTEM DESIGN

### 2.1 System Architecture Design

Reference: `docs/architecture/system-architecture.md`, `docs/architecture/README.md`

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 2.1.1 | Design High-Level System Architecture | Define the overall MERN stack architecture: React+Vite frontend on Vercel, Express.js backend on Render, MongoDB Atlas database, Google Drive/Docs API integrations. Create architecture diagram showing all components and data flows. | System architecture diagram (C4 Level 1) | 1.4.6 |
| 2.1.2 | Design Backend Architecture (MVC) | Detail the Express.js backend structure following MVC pattern: 17 controllers (`authController`, `projectController`, `chapterController`, `googleDocsController`, `teamController`, `titleController`, `topicController`, `lockController`, `deadlineController`, `capstone4Controller`, `repositoryController`, `reportController`, `legacyController`, `gapAnalysisController`, `userManagementController`, `notificationController`, `uploadController`), models, routes, middleware, and services. | Backend architecture diagram and module dependency chart | 2.1.1 |
| 2.1.3 | Design Frontend Architecture | Detail the React application structure: 8 pages (`LandingPage`, `Login`, `Register`, `Dashboard`, `StudentDashboard`, `AdviserDashboard`, `PanelistDashboard`, `CoordinatorDashboard`), 30+ components organized by feature, Context API for state management (`AuthContext`, `ThemeContext`), Axios service layer. | Frontend architecture diagram and component hierarchy | 2.1.1 |
| 2.1.4 | Design API Architecture | Plan the RESTful API structure with 80+ endpoints across 14 route groups: Auth, Projects, Chapters, Google Docs, Teams, Titles, Topics, Locks, Deadlines, Capstone 4, Repository, Reports, Legacy, User Management, Notifications, Gap Analysis. Define request/response contracts. Reference: `docs/02-api-contracts.md`. | API route map and contract specifications | 2.1.2 |
| 2.1.5 | Design Authentication & Authorization Flow | Detail JWT-based authentication (30-day token expiry), OTP registration verification, password reset flow, and RBAC middleware (`protect()`, `verifyRole()`) for 4 roles: Student, Adviser, Panelist, Coordinator. Reference: `server/middleware/authMiddleware.js`. | Auth flow sequence diagrams | 2.1.2 |
| 2.1.6 | Design File Upload & Storage Architecture | Plan the document upload pipeline: Multer memory storage -> Google Drive API streaming (to stay within 512MB RAM). Define 25MB file size limit, supported file types, Google Drive folder structure, and shareable link generation. Reference: `server/controllers/uploadController.js`. | File management architecture diagram | 2.1.2 |
| 2.1.7 | Design Notification System Architecture | Plan the notification system: 25+ notification types (PROPOSAL_SUBMITTED, REVISION_REQUESTED, STATUS_CHANGED, COMMENT_ADDED, DEADLINE_REMINDER, etc.), in-app notifications via MongoDB, email notifications via Nodemailer/Gmail SMTP. Reference: `server/models/Notification.js`. | Notification system design document | 2.1.2 |
| 2.1.8 | Design Project State Machine | Define the complete capstone project lifecycle states and transitions: TOPIC_SELECTION -> CHAPTER drafts/reviews -> PROPOSAL_DEFENSE -> CAPSTONE phases -> FINAL_COMPILATION -> PLAGIARISM_CHECK -> FINAL_DEFENSE -> FINAL_APPROVED -> ARCHIVED. Include guard conditions and role-based transition permissions. Reference: `docs/01-workflow-diagrams.md`. | State machine diagram with transition rules | 2.1.2 |
| 2.1.9 | Design Security Architecture | Specify all security measures: Helmet.js headers, CORS whitelist, bcrypt password hashing (salt rounds=10), JWT token management, input validation, XSS protection, rate limiting, and audit logging (`WorkflowLog`, `AuthLog`). | Security architecture document | 2.1.5 |
| 2.1.10 | Design Deployment Architecture | Plan the deployment topology: Vercel (frontend CI/CD), Render (backend with 512MB limit), MongoDB Atlas M0 (shared cluster), Google Drive API (15GB storage). Include environment variable management and CORS configuration. Reference: `docs/deployment-guide.md`. | Deployment architecture diagram | 2.1.1 |

### 2.2 Database Schema Design

Reference: `docs/architecture/database-schema.md`, `server/models/`

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 2.2.1 | Design User Collection Schema | Define the User model: firstName, lastName, email (unique), password (hashed), role (student/adviser/panelist/coordinator), profile fields (gender, avatar, skills, yearLevel, department), password reset fields, timestamps. Reference: `server/models/User.js`. | User collection schema document | 2.1.2 |
| 2.2.2 | Design Project Collection Schema | Define the Project model: title, members[], adviser, panelists[], status (state machine), capstonePhase, nested chapters[] with versioning, proposal details (background, problemStatement, objectives, scope, methodology, architecture, feasibility), Google Docs fields (documentId, documentUrl), plagiarism fields, comments[], statusHistory[], document locking fields, title management, Capstone 4 fields. Reference: `server/models/Project.js`. | Project collection schema document | 2.1.8 |
| 2.2.3 | Design Team Collection Schema | Define the Team model: name, members[] (user ref, role, joinedAt), maxSize, status (forming/locked/dissolved), invitations[] (invitee, invitedBy, status), project reference. Reference: `server/models/Team.js`. | Team collection schema document | 2.2.1 |
| 2.2.4 | Design Topic Collection Schema | Define the Topic model: title, description, suggestedOutline (chapter1-3), keywords[], createdBy, status (available/claimed/archived). Reference: `server/models/Topic.js`. | Topic collection schema document | 2.2.1 |
| 2.2.5 | Design Notification Collection Schema | Define the Notification model: recipient, type (25+ types), title, message, read status, actionUrl, emailSent flag, metadata (fromStatus, toStatus, actionBy). Reference: `server/models/Notification.js`. | Notification collection schema document | 2.2.1 |
| 2.2.6 | Design Deadline Collection Schema | Define the Deadline model: title, description, phase, targetStatus, dueDate, createdBy, isActive, academicYear. Reference: `server/models/Deadline.js`. | Deadline collection schema document | 2.2.2 |
| 2.2.7 | Design Title Change Request Schema | Define the TitleChangeRequest model: project ref, requestedBy, currentTitle, proposedTitle, rationale, status (pending/approved/rejected), reviewer fields. Reference: `server/models/TitleChangeRequest.js`. | Title change request schema document | 2.2.2 |
| 2.2.8 | Design Audit Log Schemas | Define WorkflowLog (project, user, action, fromStatus, toStatus, timestamp) and AuthLog (user, email, eventType, IP, userAgent). Reference: `server/models/WorkflowLog.js`, `server/models/AuthLog.js`. | Audit log schemas document | 2.2.1 |
| 2.2.9 | Design PendingRegistration Schema | Define the temporary collection for OTP verification with TTL auto-deletion (10 minutes). Reference: `server/models/PendingRegistration.js`. | PendingRegistration schema document | 2.2.1 |
| 2.2.10 | Create Entity Relationship Diagram | Produce a complete ERD showing all 10 collections and their relationships: User->Project (member/adviser), Team->Project, Topic->Project, Notification->User, Deadline->Phase, TitleChangeRequest->Project, WorkflowLog->Project, AuthLog->User. | Entity Relationship Diagram (ERD) | 2.2.1-2.2.9 |
| 2.2.11 | Define Indexing Strategy | Plan MongoDB indexes for performance: email (unique), role, status, project references, timestamps, compound indexes for common query patterns. | Index specification document | 2.2.10 |

### 2.3 UI/UX Design

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 2.3.1 | Create Design System / Style Guide | Define the visual language: Tailwind CSS utility classes, Shadcn UI component library, color palette, typography, spacing, dark/light mode theming (`ThemeContext`). | Design system / style guide document | 2.1.3 |
| 2.3.2 | Design Landing Page Wireframe | Create wireframe for the public landing page with authentication entry points. Reference: `client/src/pages/LandingPage.jsx`. | Landing page wireframe (Figma) | 2.3.1 |
| 2.3.3 | Design Authentication Pages Wireframes | Create wireframes for Login, Register (with OTP step), and Password Reset pages. Reference: `client/src/pages/Login.jsx`, `Register.jsx`. | Auth pages wireframes (Figma) | 2.3.1 |
| 2.3.4 | Design Student Dashboard Wireframe | Create wireframe for the student dashboard including: project overview, progress tracker, chapter submission portal, team formation, topic marketplace, Google Docs panel, notifications, similarity report, deadline tracker, prototype viewer, final submission. Reference: `client/src/pages/StudentDashboard.jsx`. | Student dashboard wireframe (Figma) | 2.3.1 |
| 2.3.5 | Design Adviser Dashboard Wireframe | Create wireframe for the adviser dashboard: project list, chapter review interface, feedback submission, status approval controls, comment system. Reference: `client/src/pages/AdviserDashboard.jsx`. | Adviser dashboard wireframe (Figma) | 2.3.1 |
| 2.3.6 | Design Panelist Dashboard Wireframe | Create wireframe for the panelist dashboard: assigned projects list, evaluation interface, defense scoring, feedback submission. Reference: `client/src/pages/PanelistDashboard.jsx`. | Panelist dashboard wireframe (Figma) | 2.3.1 |
| 2.3.7 | Design Coordinator Dashboard Wireframe | Create wireframe for the coordinator dashboard: all projects overview, deadline management, user management, adviser assignments, report generation, legacy uploads, gap analysis, repository search. Reference: `client/src/pages/CoordinatorDashboard.jsx`. | Coordinator dashboard wireframe (Figma) | 2.3.1 |
| 2.3.8 | Design Shared Component Wireframes | Create wireframes for shared components: Sidebar navigation, NotificationPanel, ProfileSection, ProgressTracker, DeadlineManager. Reference: `client/src/components/`. | Shared component wireframes (Figma) | 2.3.1 |
| 2.3.9 | Create Interactive Prototype | Link all wireframes into a clickable Figma prototype demonstrating the complete user flow for each role. | Interactive Figma prototype | 2.3.2-2.3.8 |
| 2.3.10 | Conduct UI/UX Review with Stakeholders | Present prototype to adviser and/or capstone coordinator for feedback. Document requested changes. | UI/UX review feedback document | 2.3.9 |
| 2.3.11 | Revise Designs Based on Feedback | Incorporate stakeholder feedback into final wireframes and prototypes. | Revised wireframes and prototype (Figma) | 2.3.10 |

### 2.4 API Integration Design

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 2.4.1 | Design Google Drive API Integration | Plan the Google Drive integration: Service Account authentication, folder structure for organizing uploads, file upload streaming (Multer memory -> Drive), shareable link generation, file metadata storage in MongoDB. Reference: `server/controllers/uploadController.js`. | Google Drive integration design document | 2.1.6 |
| 2.4.2 | Design Google Docs API Integration | Plan the Google Docs integration: OAuth2 and Service Account dual-auth approach, document creation from templates, real-time sharing with team members (edit/comment access), content syncing, document deletion. Reference: `server/services/googleDocsService.js`, `docs/07-google-docs-integration.md`. | Google Docs integration design document | 2.1.2 |
| 2.4.3 | Design Copyleaks API Integration (Placeholder) | Plan the plagiarism detection integration architecture: submission flow, API call structure, result storage (score, status, reportUrl), and UI for displaying similarity reports. System currently uses mock implementation. Reference: `server/services/plagiarismService.js`. | Copyleaks integration design document (placeholder) | 2.1.2 |
| 2.4.4 | Design Email Notification Integration | Plan the Nodemailer/Gmail SMTP integration: email templates for each notification type (OTP, proposal submission, revision request, approval, deadline reminder, status change), queue management, error handling. Reference: `server/services/emailService.js`. | Email notification integration design document | 2.1.7 |
| 2.4.5 | Design API Error Handling Strategy | Plan centralized error handling: Express error middleware, HTTP status code mapping, error response format, Google API error recovery, and client-side error display patterns. | API error handling specification | 2.1.4 |

---

## PHASE 3: DEVELOPMENT

### 3.1 Backend Development

Reference: `server/` directory

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 3.1.1 | Initialize Node.js/Express Project | Set up the Express.js project: package.json, dependencies (express, mongoose, jsonwebtoken, bcryptjs, multer, helmet, cors, dotenv, nodemailer, googleapis), folder structure (controllers/, models/, routes/, middleware/, services/), environment configuration. Reference: `server/package.json`. | Initialized backend project with dependencies | 2.1.2 |
| 3.1.2 | Configure MongoDB Connection | Set up Mongoose connection to MongoDB Atlas M0 with connection pooling, error handling, and environment-based URI configuration. Reference: `server/index.js`. | Database connection module | 3.1.1 |
| 3.1.3 | Implement User Model | Create the User Mongoose schema with all fields: personal info, authentication, profile, password reset, timestamps, and indexes. Reference: `server/models/User.js`. | `server/models/User.js` | 3.1.2, 2.2.1 |
| 3.1.4 | Implement Project Model | Create the Project Mongoose schema with nested chapters, versioning, proposal details, Google Docs fields, plagiarism fields, comments, status history, document locking, title management, and Capstone 4 fields. Reference: `server/models/Project.js`. | `server/models/Project.js` | 3.1.2, 2.2.2 |
| 3.1.5 | Implement Team Model | Create the Team Mongoose schema with members, invitations, and status. Reference: `server/models/Team.js`. | `server/models/Team.js` | 3.1.2, 2.2.3 |
| 3.1.6 | Implement Supporting Models | Create remaining models: Topic, Deadline, Notification, TitleChangeRequest, WorkflowLog, AuthLog, PendingRegistration. References: `server/models/`. | All 10 model files | 3.1.2, 2.2.4-2.2.9 |
| 3.1.7 | Implement Authentication Middleware | Create JWT verification middleware (`protect()`) and role-based access control (`verifyRole()`). Reference: `server/middleware/authMiddleware.js`. | `server/middleware/authMiddleware.js` | 3.1.3 |
| 3.1.8 | Implement Auth Controller | Build registration (with OTP), login, OTP verification, password reset (request + verify code + set new password), profile management (get/update). Reference: `server/controllers/authController.js`. | `server/controllers/authController.js` | 3.1.7, 3.1.3 |
| 3.1.9 | Implement Email Service | Build the Nodemailer service with Gmail SMTP: connection setup, HTML email templates for all notification types, send methods with error handling. Reference: `server/services/emailService.js`. | `server/services/emailService.js` | 3.1.1, 2.4.4 |
| 3.1.10 | Implement Project Controller | Build CRUD operations, status management (state machine transitions), comments, proposal details, status history tracking. Reference: `server/controllers/projectController.js`. | `server/controllers/projectController.js` | 3.1.4, 3.1.7 |
| 3.1.11 | Implement Chapter Controller | Build chapter management: create chapters, upload new versions with file metadata, adviser feedback submission, late submission handling. Reference: `server/controllers/chapterController.js`. | `server/controllers/chapterController.js` | 3.1.4, 3.1.7 |
| 3.1.12 | Implement Upload Controller | Build file upload pipeline: Multer memory storage configuration, Google Drive API upload (streaming), shareable link generation, file metadata storage. Reference: `server/controllers/uploadController.js`. | `server/controllers/uploadController.js` | 3.1.4, 2.4.1 |
| 3.1.13 | Implement Google Docs Service | Build the Google Docs API service: OAuth2/Service Account authentication, document creation, sharing with team members, content syncing, document deletion. Reference: `server/services/googleDocsService.js`. | `server/services/googleDocsService.js` | 3.1.1, 2.4.2 |
| 3.1.14 | Implement Google Docs Controller | Build endpoints for creating, syncing, sharing, and deleting Google Docs documents linked to projects. Reference: `server/controllers/googleDocsController.js`. | `server/controllers/googleDocsController.js` | 3.1.13, 3.1.4 |
| 3.1.15 | Implement Team Controller | Build team formation, member invitations (send/accept/decline), team locking, and dissolution. Reference: `server/controllers/teamController.js`. | `server/controllers/teamController.js` | 3.1.5, 3.1.7 |
| 3.1.16 | Implement Topic Controller | Build the topic marketplace: CRUD for pre-approved topics, claiming mechanism, keyword search. Reference: `server/controllers/topicController.js`. | `server/controllers/topicController.js` | 3.1.6, 3.1.7 |
| 3.1.17 | Implement Lock Controller | Build document pessimistic locking: lock acquisition, unlock requests, coordinator override. Reference: `server/controllers/lockController.js`. | `server/controllers/lockController.js` | 3.1.4, 3.1.7 |
| 3.1.18 | Implement Deadline Controller | Build deadline management: CRUD for coordinator-managed deadlines, deadline checking, phase-based filtering. Reference: `server/controllers/deadlineController.js`. | `server/controllers/deadlineController.js` | 3.1.6, 3.1.7 |
| 3.1.19 | Implement Title Change Controller | Build title change request workflow: submission by students, coordinator review (approve/reject), title history tracking. Reference: `server/controllers/titleController.js`. | `server/controllers/titleController.js` | 3.1.6, 3.1.7 |
| 3.1.20 | Implement Capstone 4 Controller | Build final phase management: academic/journal version uploads, credential management, defense verdict recording, final compilation. Reference: `server/controllers/capstone4Controller.js`. | `server/controllers/capstone4Controller.js` | 3.1.4, 3.1.12 |
| 3.1.21 | Implement Notification Controller | Build notification management: retrieval with pagination, mark as read, mark all as read, unread count, cleanup. Reference: `server/controllers/notificationController.js`. | `server/controllers/notificationController.js` | 3.1.6, 3.1.9 |
| 3.1.22 | Implement Report Controller | Build analytics and reporting: overview statistics, project status breakdowns, adviser workload, CSV exports. Reference: `server/controllers/reportController.js`. | `server/controllers/reportController.js` | 3.1.4, 3.1.7 |
| 3.1.23 | Implement Repository Controller | Build project repository search: keyword search across archived projects, statistical summaries. Reference: `server/controllers/repositoryController.js`. | `server/controllers/repositoryController.js` | 3.1.4, 3.1.7 |
| 3.1.24 | Implement Gap Analysis Controller | Build keyword frequency analysis, topic clustering, and research gap identification. Reference: `server/controllers/gapAnalysisController.js`. | `server/controllers/gapAnalysisController.js` | 3.1.4, 3.1.7 |
| 3.1.25 | Implement User Management Controller | Build admin user management: user listing, role assignment, adviser assignment to projects. Reference: `server/controllers/userManagementController.js`. | `server/controllers/userManagementController.js` | 3.1.3, 3.1.7 |
| 3.1.26 | Implement Legacy Upload Controller | Build legacy project import for historical data migration. Reference: `server/controllers/legacyController.js`. | `server/controllers/legacyController.js` | 3.1.4, 3.1.12 |
| 3.1.27 | Implement Plagiarism Service (Placeholder) | Build the placeholder plagiarism service that returns mock results. Architecture ready for future Copyleaks integration. Reference: `server/services/plagiarismService.js`. | `server/services/plagiarismService.js` | 3.1.1, 2.4.3 |
| 3.1.28 | Configure API Routes | Wire all controllers to the Express router with proper middleware (authentication, role verification) for 80+ endpoints across 14 route groups. Reference: `server/routes/api.js`. | `server/routes/api.js` | 3.1.8-3.1.27 |
| 3.1.29 | Implement Server Entry Point | Configure Express app: middleware stack (helmet, cors, json parser), database connection, route mounting, error handling middleware, server startup. Reference: `server/index.js`. | `server/index.js` | 3.1.28 |
| 3.1.30 | Create Database Seed Script | Build seeder for initial data: default coordinator account, sample topics, test users per role. Reference: `server/seed.js`. | `server/seed.js` | 3.1.6 |
| 3.1.31 | Implement Security Middleware | Configure Helmet.js security headers, CORS with CLIENT_URL whitelist (comma-separated support), rate limiting. | Security middleware configuration | 3.1.29 |

### 3.2 Frontend Development

Reference: `client/` directory

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 3.2.1 | Initialize React + Vite Project | Set up the React project with Vite: Tailwind CSS, Shadcn UI, Axios, React Router v6, Lucide React icons. Reference: `client/package.json`. | Initialized frontend project with dependencies | 2.1.3 |
| 3.2.2 | Configure Tailwind CSS and Shadcn UI | Set up Tailwind configuration, install and configure Shadcn UI base components (badge, button, card, dialog, etc.). Reference: `client/src/components/ui/`. | Tailwind + Shadcn setup | 3.2.1, 2.3.1 |
| 3.2.3 | Implement Auth Context | Build the AuthContext provider: login/logout state, JWT token management, user profile storage, auto-redirect on auth state changes. Reference: `client/src/context/AuthContext.jsx`. | `client/src/context/AuthContext.jsx` | 3.2.1 |
| 3.2.4 | Implement Theme Context | Build the ThemeContext provider: dark/light mode toggle, persistence in localStorage, Tailwind dark mode class management. Reference: `client/src/context/ThemeContext.jsx`. | `client/src/context/ThemeContext.jsx` | 3.2.1 |
| 3.2.5 | Implement API Service Layer | Build the Axios-based API service: base URL configuration, JWT token auto-injection, response/error interceptors, endpoint method groups (authAPI, projectAPI, notificationAPI, etc.). Reference: `client/src/services/api.js`. | `client/src/services/api.js` | 3.2.3 |
| 3.2.6 | Build Landing Page | Implement the public landing page with authentication links and system overview. Reference: `client/src/pages/LandingPage.jsx`. | `LandingPage.jsx` | 3.2.2, 2.3.2 |
| 3.2.7 | Build Login Page | Implement the login form with validation, error handling, and redirect on success. Reference: `client/src/pages/Login.jsx`. | `Login.jsx` | 3.2.5, 2.3.3 |
| 3.2.8 | Build Registration Page | Implement the registration form with OTP verification step and role selection. Reference: `client/src/pages/Register.jsx`. | `Register.jsx` | 3.2.5, 2.3.3 |
| 3.2.9 | Build Sidebar Navigation | Implement the responsive sidebar component with role-based menu items, dark mode toggle, profile link. Reference: `client/src/components/Sidebar.jsx`. | `Sidebar.jsx` | 3.2.3, 3.2.4, 2.3.8 |
| 3.2.10 | Build Notification Panel Component | Implement the notification dropdown/panel: real-time notification list, unread count badge, mark as read, notification type icons. Reference: `client/src/components/NotificationPanel.jsx`. | `NotificationPanel.jsx` | 3.2.5, 2.3.8 |
| 3.2.11 | Build Profile Section Component | Implement user profile view and edit: personal info, avatar, skills, department. Reference: `client/src/components/ProfileSection.jsx`. | `ProfileSection.jsx` | 3.2.5, 2.3.8 |
| 3.2.12 | Build Progress Tracker Component | Implement the visual progress tracking component showing project state machine position and completion percentage. Reference: `client/src/components/ProgressTracker.jsx`. | `ProgressTracker.jsx` | 3.2.5 |
| 3.2.13 | Build Team Formation Component | Implement team creation, member search, invitation sending, invitation acceptance/decline. Reference: `client/src/components/TeamFormation.jsx`. | `TeamFormation.jsx` | 3.2.5, 2.3.4 |
| 3.2.14 | Build Topic Marketplace Component | Implement the pre-approved topic browsing, keyword search, and topic claiming interface. Reference: `client/src/components/TopicMarketplace.jsx`. | `TopicMarketplace.jsx` | 3.2.5, 2.3.4 |
| 3.2.15 | Build Submission Portal Component | Implement file upload interface: drag-and-drop, file type validation, upload progress, Google Drive link display. Reference: `client/src/components/SubmissionPortal.jsx`. | `SubmissionPortal.jsx` | 3.2.5, 2.3.4 |
| 3.2.16 | Build Chapter Submission Component | Implement chapter-specific submission: version history display, upload new version, view adviser feedback, late submission justification. Reference: `client/src/components/ChapterSubmission.jsx`. | `ChapterSubmission.jsx` | 3.2.15, 2.3.4 |
| 3.2.17 | Build Proposal Details Component | Implement the proposal form: background, problem statement, objectives, scope, methodology, architecture, feasibility sections. Reference: `client/src/components/ProposalDetails.jsx`. | `ProposalDetails.jsx` | 3.2.5, 2.3.4 |
| 3.2.18 | Build Google Docs Panel Component | Implement the Google Docs integration UI: create document, open in new tab, sync status, share controls. Reference: `client/src/components/GoogleDocsPanel.jsx`. | `GoogleDocsPanel.jsx` | 3.2.5, 2.3.4 |
| 3.2.19 | Build Similarity Report Component | Implement plagiarism detection results display: similarity score, report link, status indicator. Reference: `client/src/components/SimilarityReport.jsx`. | `SimilarityReport.jsx` | 3.2.5 |
| 3.2.20 | Build Deadline Manager Component | Implement deadline display: upcoming deadlines with countdown, phase filtering, status indicators. Reference: `client/src/components/DeadlineManager.jsx`. | `DeadlineManager.jsx` | 3.2.5, 2.3.8 |
| 3.2.21 | Build Final Submission Component | Implement Capstone 4 final submission: academic/journal version upload, credential management, defense verdict display. Reference: `client/src/components/FinalSubmission.jsx`. | `FinalSubmission.jsx` | 3.2.15, 2.3.4 |
| 3.2.22 | Build Repository Search Component | Implement archived project search: keyword search, filters, result listing. Reference: `client/src/components/RepositorySearch.jsx`. | `RepositorySearch.jsx` | 3.2.5, 2.3.7 |
| 3.2.23 | Build Reports Dashboard Component | Implement analytics display: charts, status breakdowns, export options. Reference: `client/src/components/ReportsDashboard.jsx`. | `ReportsDashboard.jsx` | 3.2.5, 2.3.7 |
| 3.2.24 | Build Gap Analysis Dashboard Component | Implement research gap visualization: keyword frequency, topic clustering, suggestion generation. Reference: `client/src/components/GapAnalysisDashboard.jsx`. | `GapAnalysisDashboard.jsx` | 3.2.5, 2.3.7 |
| 3.2.25 | Build User Management Component | Implement admin user management: user list, role editing, adviser assignment. Reference: `client/src/components/UserManagement.jsx`. | `UserManagement.jsx` | 3.2.5, 2.3.7 |
| 3.2.26 | Build Legacy Upload Component | Implement historical project import interface for coordinators. Reference: `client/src/components/LegacyUpload.jsx`. | `LegacyUpload.jsx` | 3.2.5, 2.3.7 |
| 3.2.27 | Build Prototype Viewer Component | Implement prototype gallery: screenshots, videos, external links display. Reference: `client/src/components/PrototypeViewer.jsx`. | `PrototypeViewer.jsx` | 3.2.5 |
| 3.2.28 | Build Split Screen Viewer Component | Implement side-by-side document comparison viewer. Reference: `client/src/components/SplitScreenViewer.jsx`. | `SplitScreenViewer.jsx` | 3.2.5 |
| 3.2.29 | Build Student Dashboard Page | Assemble the student dashboard integrating: ProgressTracker, TeamFormation, TopicMarketplace, ChapterSubmission, GoogleDocsPanel, SubmissionPortal, SimilarityReport, DeadlineManager, NotificationPanel, FinalSubmission, PrototypeViewer. Reference: `client/src/pages/StudentDashboard.jsx`. | `StudentDashboard.jsx` | 3.2.12-3.2.21, 2.3.4 |
| 3.2.30 | Build Adviser Dashboard Page | Assemble the adviser dashboard: assigned projects list, chapter review interface, feedback forms, status action buttons. Reference: `client/src/pages/AdviserDashboard.jsx`. | `AdviserDashboard.jsx` | 3.2.10, 3.2.12, 2.3.5 |
| 3.2.31 | Build Panelist Dashboard Page | Assemble the panelist dashboard: assigned defense projects, evaluation interface, scoring forms. Reference: `client/src/pages/PanelistDashboard.jsx`. | `PanelistDashboard.jsx` | 3.2.10, 2.3.6 |
| 3.2.32 | Build Coordinator Dashboard Page | Assemble the coordinator dashboard integrating: ReportsDashboard, UserManagement, DeadlineManager, GapAnalysisDashboard, RepositorySearch, LegacyUpload. Reference: `client/src/pages/CoordinatorDashboard.jsx`. | `CoordinatorDashboard.jsx` | 3.2.22-3.2.26, 2.3.7 |
| 3.2.33 | Configure React Router | Set up all application routes with role-based protected routes, redirects for unauthenticated users, and dashboard routing based on user role. Reference: `client/src/App.jsx`. | `App.jsx` with routing | 3.2.29-3.2.32 |
| 3.2.34 | Implement Responsive Design | Ensure all pages and components are fully responsive across mobile, tablet, and desktop breakpoints using Tailwind responsive utilities. | Responsive layout verification | 3.2.33 |

### 3.3 API Integration (Connect External Services)

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 3.3.1 | Set Up Google Cloud Project | Create Google Cloud project, enable Drive API and Docs API, create Service Account and OAuth2 credentials, configure consent screen. | Google Cloud project with API credentials | 2.4.1, 2.4.2 |
| 3.3.2 | Implement Google Drive Upload Integration | Connect the upload controller to Google Drive API: authenticate via Service Account, upload files to designated folder, return shareable links, store file metadata in MongoDB. | Working file upload to Google Drive | 3.1.12, 3.3.1 |
| 3.3.3 | Implement Google Docs Creation Integration | Connect Google Docs service: create new documents, set initial content from templates, store document IDs in project records. | Working Google Docs document creation | 3.1.13, 3.3.1 |
| 3.3.4 | Implement Google Docs Sharing Integration | Connect sharing functionality: grant edit/comment access to team members and advisers via email, manage permission levels. | Working Google Docs sharing | 3.3.3 |
| 3.3.5 | Implement Google Docs Sync Integration | Connect content syncing: pull latest document content from Google Docs API, update local metadata (lastSyncedAt). | Working Google Docs synchronization | 3.3.3 |
| 3.3.6 | Implement Email Notification Integration | Connect Nodemailer with Gmail SMTP: configure credentials, test email delivery for all notification templates (OTP, proposal, revision, approval, deadline). | Working email notification system | 3.1.9, 3.1.21 |
| 3.3.7 | Implement Plagiarism Detection Placeholder | Wire the placeholder plagiarism service to return mock results when called from Capstone 4 controller. Structure ready for future Copyleaks API key insertion. | Working plagiarism placeholder | 3.1.27, 3.1.20 |
| 3.3.8 | Integrate Frontend with Backend API | Connect all frontend API service calls to backend endpoints: verify each endpoint group (auth, projects, chapters, teams, notifications, etc.) works end-to-end. | Fully connected frontend-backend | 3.2.5, 3.1.28 |

### 3.4 Document Vault Implementation

Reference: `docs/05-document-vault.md`

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 3.4.1 | Implement Secure Document Storage | Build the document vault system: encrypted metadata storage in MongoDB, Google Drive as secure file backend, access control per role. | Document vault backend | 3.3.2, 3.1.4 |
| 3.4.2 | Implement Version Control for Submissions | Build chapter versioning: automatic version numbering, version history with timestamps and uploader tracking, previous version retrieval. | Version control system | 3.1.11, 3.4.1 |
| 3.4.3 | Implement Document Locking Mechanism | Build pessimistic locking: lock acquisition, lock status display, unlock request workflow, coordinator override capability. Reference: `server/controllers/lockController.js`. | Document locking system | 3.1.17, 3.4.1 |
| 3.4.4 | Implement Read-Only Archive Mode | Build the final archiving mechanism: tag approved manuscripts as official read-only copies, prevent further modifications, generate permanent shareable links. | Archive mode functionality | 3.1.20, 3.4.1 |
| 3.4.5 | Implement Document Access Audit Trail | Ensure all document access (view, download, upload) is logged in WorkflowLog with user, action, and timestamp. | Document audit logging | 3.4.1, 3.1.6 |

---

## PHASE 4: TESTING

### 4.1 Unit & Integration Testing

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 4.1.1 | Set Up Jest Testing Framework | Configure Jest for backend testing: test environment, MongoDB memory server for isolated tests, test scripts in package.json. | Jest configuration and test setup | 3.1.29 |
| 4.1.2 | Write Unit Tests for User Model | Test User model: creation, validation (required fields, email format, enum values), password hashing, uniqueness constraints. | `tests/models/user.test.js` | 4.1.1, 3.1.3 |
| 4.1.3 | Write Unit Tests for Project Model | Test Project model: creation, status transitions, chapter versioning, nested document operations, virtual fields. | `tests/models/project.test.js` | 4.1.1, 3.1.4 |
| 4.1.4 | Write Unit Tests for Auth Controller | Test authentication flows: registration, OTP verification, login (success/failure), password reset (request/verify/set), token generation. | `tests/controllers/auth.test.js` | 4.1.1, 3.1.8 |
| 4.1.5 | Write Unit Tests for Project Controller | Test project CRUD: create, read, update, delete, status transitions, comment operations, role-based access restrictions. | `tests/controllers/project.test.js` | 4.1.1, 3.1.10 |
| 4.1.6 | Write Unit Tests for Chapter Controller | Test chapter operations: creation, version upload, feedback submission, late submission handling. | `tests/controllers/chapter.test.js` | 4.1.1, 3.1.11 |
| 4.1.7 | Write Unit Tests for Team Controller | Test team operations: formation, invitation send/accept/decline, locking, member removal. | `tests/controllers/team.test.js` | 4.1.1, 3.1.15 |
| 4.1.8 | Write Unit Tests for Auth Middleware | Test JWT verification: valid token, expired token, missing token, invalid token format. Test role verification: authorized role, unauthorized role, multiple roles. | `tests/middleware/auth.test.js` | 4.1.1, 3.1.7 |
| 4.1.9 | Write Unit Tests for Email Service | Test email service: template rendering, SMTP connection, send method calls, error handling on SMTP failure. | `tests/services/email.test.js` | 4.1.1, 3.1.9 |
| 4.1.10 | Write Unit Tests for Google Docs Service | Test Google Docs service: document creation, sharing, syncing, deletion (using mocked Google API). | `tests/services/googleDocs.test.js` | 4.1.1, 3.1.13 |
| 4.1.11 | Write Integration Tests for Auth API | Test complete auth flow end-to-end: register -> verify OTP -> login -> access protected route -> password reset cycle. | `tests/integration/auth.test.js` | 4.1.4, 4.1.8 |
| 4.1.12 | Write Integration Tests for Project Lifecycle | Test the full project lifecycle: create project -> submit proposal -> adviser review -> revision -> approve -> chapter submissions -> final submission -> archive. | `tests/integration/projectLifecycle.test.js` | 4.1.5, 4.1.6 |
| 4.1.13 | Write Integration Tests for Team Workflow | Test team workflow: create team -> invite member -> accept -> form project -> lock team. | `tests/integration/teamWorkflow.test.js` | 4.1.7 |
| 4.1.14 | Write Integration Tests for Role-Based Access | Test that each role (Student, Adviser, Panelist, Coordinator) can only access their authorized endpoints and are blocked from unauthorized ones. | `tests/integration/rbac.test.js` | 4.1.8, 4.1.11 |

### 4.2 Functional Testing

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 4.2.1 | Create Functional Test Plan | Document all functional test cases organized by feature module, including inputs, expected outputs, and pass/fail criteria. | Functional test plan document | 4.1.1 |
| 4.2.2 | Conduct Black-Box Testing: Authentication | Test all auth endpoints without knowledge of internals: valid/invalid credentials, token expiry, OTP flow, password reset. | Auth black-box test results | 4.2.1, 3.1.8 |
| 4.2.3 | Conduct Black-Box Testing: Project Management | Test project CRUD and status transitions from a user perspective: create, edit, view, status changes, comment system. | Project management test results | 4.2.1, 3.1.10 |
| 4.2.4 | Conduct Black-Box Testing: File Upload | Test document upload: valid files, oversized files (>25MB), invalid file types, upload to Google Drive verification, link generation. | File upload test results | 4.2.1, 3.3.2 |
| 4.2.5 | Conduct Black-Box Testing: Team Management | Test team workflows: creation, invitations, acceptance, decline, locking, edge cases (full team, duplicate invite). | Team management test results | 4.2.1, 3.1.15 |
| 4.2.6 | Conduct Black-Box Testing: Notifications | Test notification delivery: trigger events, verify in-app notifications appear, verify email delivery, read/unread status. | Notification test results | 4.2.1, 3.3.6 |
| 4.2.7 | API Validation via Postman | Create Postman collection for all 80+ API endpoints with test scripts. Validate response schemas, status codes, error messages, and auth requirements. Reference: `docs/02-api-contracts.md`. | Postman collection with test results | 4.2.1, 3.1.28 |
| 4.2.8 | Conduct API Endpoint Coverage Test | Verify every documented endpoint responds correctly: success cases, error cases, edge cases, missing parameters, invalid data. | API coverage test report | 4.2.7 |
| 4.2.9 | Conduct Cross-Browser Testing | Test the frontend in Chrome, Firefox, Safari, and Edge. Verify layout, functionality, and responsiveness across browsers. | Cross-browser test report | 3.2.34 |
| 4.2.10 | Conduct Mobile Responsiveness Testing | Test on various mobile screen sizes (320px, 375px, 414px, 768px, 1024px) to verify responsive design. | Mobile responsiveness test report | 3.2.34 |

### 4.3 Plagiarism Detection Testing

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 4.3.1 | Prepare Controlled Test Corpus | Create a set of test documents with known similarity levels: 0% original, 25% similar, 50% similar, 75% similar, 100% copied. Include paraphrased content. | Test corpus (10+ documents) | 3.3.7 |
| 4.3.2 | Test Placeholder Plagiarism Flow | Verify the placeholder service returns mock results correctly, results are stored in the Project model, and the SimilarityReport component displays them. | Placeholder flow test results | 4.3.1, 3.3.7 |
| 4.3.3 | Validate Result Storage and Display | Confirm plagiarism results (score, status, reportUrl) persist correctly in MongoDB and display accurately in the frontend SimilarityReport component. | Data integrity verification report | 4.3.2 |
| 4.3.4 | Document Future Copyleaks Integration Plan | Write documentation for replacing the placeholder with actual Copyleaks API: API key configuration, endpoint mapping, response parsing, error handling. | Copyleaks integration readiness document | 4.3.2, 2.4.3 |

### 4.4 Documentation & Final Presentation Preparation

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 4.4.1 | Compile Test Results Summary | Aggregate all testing results (unit, integration, functional, API, cross-browser) into a comprehensive test summary report. | Test results summary report | 4.1.14, 4.2.10, 4.3.3 |
| 4.4.2 | Update System Documentation | Ensure all docs are current: architecture diagrams, API contracts, user roles, setup guide, deployment guide. Reference: `docs/` folder. | Updated documentation set | 4.4.1 |
| 4.4.3 | Prepare User Manual | Write end-user documentation for each role: Student Guide, Adviser Guide, Coordinator Guide. Include screenshots and step-by-step instructions. | User manual document | 4.4.2 |
| 4.4.4 | Create System Demo Script | Write a structured demo script covering key workflows: registration, project creation, chapter submission, adviser review, coordinator management, Google Docs collaboration. | Demo script document | 4.4.2 |
| 4.4.5 | Prepare Final Presentation Slides | Create presentation covering: problem statement, objectives, system architecture, demo screenshots, testing results, conclusions, and recommendations. | Presentation slide deck | 4.4.1, 4.4.2 |
| 4.4.6 | Rehearse System Demonstration | Practice the live demo following the demo script, verify all features work on the deployed version (Render + Vercel). | Rehearsal completion (ready for defense) | 4.4.4 |

---

## PHASE 5: EVALUATION & CLOSING

### 5.1 User Acceptance Testing (UAT)

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 5.1.1 | Prepare UAT Test Plan | Design the UAT methodology: define test scenarios for each role, create test account credentials, prepare task instructions for 37 respondents. | UAT test plan document | 4.4.1 |
| 5.1.2 | Prepare UAT Environment | Deploy the latest stable version to Render (backend) and Vercel (frontend). Seed test data: sample projects, teams, submissions at various stages. Create 37 test user accounts. | Production-ready UAT environment | 5.1.1, 3.1.30 |
| 5.1.3 | Create UAT Task Sheets | Write detailed task sheets for each respondent role: Students perform project creation, chapter submission, team formation; Faculty perform project review, feedback submission, deadline management. | UAT task sheets per role | 5.1.1 |
| 5.1.4 | Prepare UAT Evaluation Questionnaire | Design the post-UAT survey based on ISO 25010 quality characteristics. Include Likert-scale questions for each quality attribute and open-ended feedback sections. | UAT evaluation questionnaire | 5.1.1, 5.2.1 |
| 5.1.5 | Recruit and Brief 37 Respondents | Select respondents: mix of 3rd/4th-year BSIT/BSEMC students, advisers, and coordinators. Conduct orientation on how to access and use the system for testing. | Respondent roster and briefing completion | 5.1.3 |
| 5.1.6 | Conduct UAT Sessions (Batch 1 - Students) | Execute UAT with student respondents. Monitor their task execution, note any issues or confusion, and collect completed task sheets and questionnaires. | Student UAT results and observations | 5.1.2, 5.1.5 |
| 5.1.7 | Conduct UAT Sessions (Batch 2 - Faculty) | Execute UAT with adviser, panelist, and coordinator respondents. Monitor task execution and collect feedback. | Faculty UAT results and observations | 5.1.2, 5.1.5 |
| 5.1.8 | Log UAT Defects and Issues | Document all bugs, usability issues, and feature requests identified during UAT sessions. Categorize by severity (critical, major, minor). | UAT defect log | 5.1.6, 5.1.7 |
| 5.1.9 | Fix Critical UAT Defects | Address all critical and major defects discovered during UAT. Redeploy fixed version. | Bug fix commits and redeployment | 5.1.8 |
| 5.1.10 | Compile UAT Completion Report | Summarize UAT outcomes: completion rates, defects found/fixed, respondent satisfaction scores, pass/fail determination. | UAT completion report | 5.1.8, 5.1.9 |

### 5.2 Usability Evaluation (ISO 25010)

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 5.2.1 | Define ISO 25010 Evaluation Framework | Map the ISO 25010 quality model characteristics to specific evaluation criteria for the capstone system: Functional Suitability, Performance Efficiency, Compatibility, Usability, Reliability, Security, Maintainability, Portability. | ISO 25010 evaluation framework document | 1.4.6 |
| 5.2.2 | Design Usability Evaluation Instrument | Create a survey instrument with Likert-scale questions (1-5) mapped to each ISO 25010 sub-characteristic. Include sections for: Functional completeness, accuracy, appropriateness; Time behavior, resource utilization; Learnability, operability, aesthetics; Fault tolerance, recoverability. | Validated usability evaluation survey | 5.2.1 |
| 5.2.3 | Collect Evaluation Responses | Distribute the usability evaluation survey to all 37 respondents after UAT completion. Ensure complete response collection. | Raw evaluation response data | 5.1.7, 5.2.2 |
| 5.2.4 | Tabulate Quantitative Results | Calculate weighted means for each ISO 25010 characteristic and sub-characteristic. Determine overall system quality score. Use appropriate statistical tools. | Statistical analysis tables and computations | 5.2.3 |
| 5.2.5 | Analyze Qualitative Feedback | Review and categorize open-ended responses. Identify recurring themes, strengths, and improvement areas. | Qualitative analysis summary | 5.2.3 |
| 5.2.6 | Interpret Results Against Benchmarks | Compare calculated quality scores against acceptable thresholds. Determine if the system meets "Acceptable," "Good," or "Excellent" ratings per ISO 25010. | Benchmark comparison analysis | 5.2.4 |
| 5.2.7 | Compile Usability Evaluation Report | Write the complete evaluation report including: methodology, respondent demographics, per-characteristic scores, interpretation, strengths, weaknesses, and recommendations. | Final usability evaluation report | 5.2.4, 5.2.5, 5.2.6 |

### 5.3 Final Archiving

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 5.3.1 | Implement Final Archive Workflow | Build or verify the archive mechanism: approved manuscripts are tagged as "FINAL_APPROVED" status, locked from further edits, stored as read-only copies in Google Drive. | Working archive workflow | 3.4.4, 5.1.9 |
| 5.3.2 | Archive Approved Test Projects | Using the system, mark all approved test/sample projects as archived to verify the workflow end-to-end. | Archived test projects | 5.3.1 |
| 5.3.3 | Generate Permanent Read-Only Links | Verify that archived projects generate permanent, shareable, read-only Google Drive links accessible to authorized users. | Permanent archive links verified | 5.3.2 |
| 5.3.4 | Document Archiving Procedures | Write the standard operating procedure (SOP) for coordinators to archive approved manuscripts, including step-by-step instructions. | Archiving SOP document | 5.3.3 |

### 5.4 Project Closure

| Task ID | Task Name | Description | Deliverables | Dependencies |
|---------|-----------|-------------|--------------|--------------|
| 5.4.1 | Compile Final Capstone Document | Assemble the complete capstone manuscript: Chapters 1-5 incorporating all research, design, development, testing, and evaluation results. | Final capstone manuscript | 5.2.7, 5.1.10, 4.4.1 |
| 5.4.2 | Prepare Final Defense Presentation | Create the final defense presentation incorporating: complete project overview, evaluation results, ISO 25010 analysis, live demo plan, conclusions, and recommendations. | Final defense presentation | 5.4.1 |
| 5.4.3 | Conduct Final Defense Rehearsal | Practice the final defense presentation and live demo. Time the presentation and prepare for anticipated panel questions. | Rehearsal completion | 5.4.2, 4.4.6 |
| 5.4.4 | Submit Source Code Repository | Prepare the final source code submission: clean repository, updated README, environment setup instructions, deployment guide. | Final GitHub repository | 5.1.9 |
| 5.4.5 | Submit Final Documentation Package | Compile and submit all deliverables: capstone manuscript, source code, deployment guide, user manual, test reports, evaluation reports. | Complete documentation package | 5.4.1, 5.4.4, 4.4.3 |

---

## TASK SUMMARY

| Phase | Task Count | Key Milestones |
|-------|-----------|----------------|
| Phase 1: Data Gathering & Analysis | 27 tasks | SRS Sign-Off (1.4.6) |
| Phase 2: System Design | 37 tasks | Interactive Prototype Approved (2.3.11), ERD Complete (2.2.10) |
| Phase 3: Development | 78 tasks | Backend Complete (3.1.31), Frontend Complete (3.2.34), Integrations Working (3.3.8), Document Vault (3.4.5) |
| Phase 4: Testing | 24 tasks | All Tests Passing (4.4.1), Presentation Ready (4.4.6) |
| Phase 5: Evaluation & Closing | 22 tasks | UAT Complete (5.1.10), ISO 25010 Report (5.2.7), Final Defense (5.4.3) |
| **TOTAL** | **188 tasks** | |

---

## DEPENDENCY CHAIN (CRITICAL PATH)

The critical path through the project follows this sequence:

```
1.1.1-1.1.8 (Document Analysis)
    |
    v
1.2.1-1.2.7 (Key Informant Interviews)  +  1.3.1-1.3.6 (User Surveys)  [parallel]
    |                                          |
    +------------------------------------------+
    |
    v
1.4.1-1.4.6 (SRS Finalization) --- MILESTONE: SRS SIGN-OFF
    |
    v
2.1.1-2.1.10 (System Architecture)  +  2.2.1-2.2.11 (Database Design)  +  2.3.1-2.3.11 (UI/UX)  [parallel]
    |                                     |                                    |
    +-------------------------------------+------------------------------------+
    |
    v
2.4.1-2.4.5 (API Integration Design) --- MILESTONE: DESIGN COMPLETE
    |
    v
3.1.1-3.1.31 (Backend Dev)  +  3.2.1-3.2.34 (Frontend Dev)  [parallel]
    |                             |
    +-----------------------------+
    |
    v
3.3.1-3.3.8 (API Integration)  +  3.4.1-3.4.5 (Document Vault)  [parallel]
    |
    v
--- MILESTONE: DEVELOPMENT COMPLETE ---
    |
    v
4.1.1-4.1.14 (Unit/Integration Tests)  +  4.2.1-4.2.10 (Functional Tests)  [parallel]
    |                                        |
    +----------------------------------------+
    |
    v
4.3.1-4.3.4 (Plagiarism Testing)
    |
    v
4.4.1-4.4.6 (Documentation & Presentation) --- MILESTONE: TESTING COMPLETE
    |
    v
5.1.1-5.1.10 (UAT with 37 respondents)
    |
    v
5.2.1-5.2.7 (ISO 25010 Usability Evaluation)
    |
    v
5.3.1-5.3.4 (Final Archiving)
    |
    v
5.4.1-5.4.5 (Project Closure) --- MILESTONE: FINAL DEFENSE
```

---

## GANTT CHART VISUAL LAYOUT GUIDE

When entering these tasks into your Gantt chart tool, use this layout:

| Phase | Color Code | Parallel Tracks |
|-------|-----------|-----------------|
| Phase 1 | Blue | Interviews + Surveys run in parallel |
| Phase 2 | Green | Architecture + Database + UI/UX in parallel |
| Phase 3 | Orange | Backend + Frontend in parallel, then Integration |
| Phase 4 | Red | Unit/Integration + Functional in parallel |
| Phase 5 | Purple | UAT -> Evaluation -> Archiving -> Closure (sequential) |

### Key Milestones to Mark on Gantt Chart
1. **SRS Sign-Off** (end of Phase 1)
2. **Design Review Approved** (end of Phase 2)
3. **Development Complete** (end of Phase 3)
4. **Testing Complete** (end of Phase 4)
5. **UAT Complete** (Phase 5 midpoint)
6. **Final Defense** (end of Phase 5)

---

*Document generated for BukSU Capstone Management System - Project Workspace*
*Total Tasks: 188 | Phases: 5 | Milestones: 6*

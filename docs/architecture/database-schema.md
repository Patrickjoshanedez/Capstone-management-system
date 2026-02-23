# Database Schema Design - Capstone Management System

## Overview
This document details the MongoDB database schema for the BukSU Capstone Management System. All collections use Mongoose ODM for data validation and relationship management.

---

## Collections

### 1. Users Collection
**Purpose:** Store user accounts with role-based access

```javascript
{
  _id: ObjectId,
  firstName: String (required, trim),
  lastName: String (required, trim),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  role: String (enum: ['student', 'adviser', 'panel', 'coordinator'], required),

  // Student-specific fields
  studentId: String (unique, sparse),
  department: String (enum: ['BSIT', 'BSEMC']),
  yearLevel: Number (enum: [3, 4]),

  // Account management
  isVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Profile
  avatar: String (URL),
  phoneNumber: String,

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

**Indexes:**
- `email` (unique)
- `studentId` (unique, sparse)
- `role`
- `isActive`

**Relationships:**
- One user can have many projects (as student)
- One user can advise many projects (as adviser)
- One user can be panel member for many projects

---

### 2. Projects Collection
**Purpose:** Store capstone project metadata

```javascript
{
  _id: ObjectId,
  title: String (required, unique, trim),
  description: String (required),
  abstract: String,
  keywords: [String],

  // Project metadata
  status: String (
    enum: [
      'draft',
      'proposal_submitted',
      'under_adviser_review',
      'revision_requested',
      'approved_by_adviser',
      'under_panel_review',
      'approved_by_panel',
      'rejected',
      'archived'
    ],
    default: 'draft'
  ),

  // Team members
  students: [{
    type: ObjectId,
    ref: 'User',
    required: true
  }],

  // Advisers and panel
  adviser: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  panelMembers: [{
    type: ObjectId,
    ref: 'User'
  }],

  // Academic details
  academicYear: String (e.g., '2024-2025'),
  semester: String (enum: ['1st', '2nd', 'Summer']),
  department: String (enum: ['BSIT', 'BSEMC']),

  // Submission tracking
  proposalSubmittedAt: Date,
  approvedByAdviserAt: Date,
  approvedByPanelAt: Date,
  archivedAt: Date,

  // Grading
  adviserGrade: Number (0-100),
  panelGrades: [{
    panelMember: { type: ObjectId, ref: 'User' },
    grade: Number (0-100),
    gradedAt: Date
  }],
  finalGrade: Number (0-100),

  // Google Drive integration
  googleDriveFolderId: String,
  googleDriveFolderUrl: String,

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (soft delete)
}
```

**Indexes:**
- `title` (unique)
- `status`
- `students`
- `adviser`
- `academicYear`
- `department`
- `createdAt` (descending)

**Virtual Fields:**
- `studentNames`: Get student names from populated students
- `averagePanelGrade`: Calculate average of panel grades

---

### 3. Documents Collection
**Purpose:** Store document metadata (files stored in Google Drive)

```javascript
{
  _id: ObjectId,
  project: {
    type: ObjectId,
    ref: 'Project',
    required: true
  },

  // File metadata
  fileName: String (required, trim),
  originalName: String (required),
  fileType: String (required, enum: ['docx', 'pdf', 'pptx', 'xlsx']),
  fileSize: Number (in bytes),
  mimeType: String,

  // Document type
  documentType: String (
    enum: [
      'proposal',
      'chapter_1',
      'chapter_2',
      'chapter_3',
      'chapter_4',
      'chapter_5',
      'final_manuscript',
      'presentation',
      'other'
    ],
    required: true
  ),

  // Google Drive integration
  googleDriveFileId: String (required, unique),
  googleDriveUrl: String (required),
  googleDriveViewUrl: String,
  googleDriveDownloadUrl: String,

  // Versioning
  version: Number (default: 1),
  previousVersion: {
    type: ObjectId,
    ref: 'Document'
  },

  // Tracking
  uploadedBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: Date (default: Date.now),

  // Status
  isLatest: Boolean (default: true),
  isDeleted: Boolean (default: false),

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `project`
- `googleDriveFileId` (unique)
- `documentType`
- `version`
- `isLatest`
- `uploadedAt` (descending)

---

### 4. Submissions Collection
**Purpose:** Track project submissions with plagiarism reports

```javascript
{
  _id: ObjectId,
  project: {
    type: ObjectId,
    ref: 'Project',
    required: true
  },
  document: {
    type: ObjectId,
    ref: 'Document',
    required: true
  },

  // Submission details
  submittedBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: Date (default: Date.now),

  // Version tracking
  version: Number (default: 1),

  // Status
  status: String (
    enum: [
      'pending',
      'under_review',
      'revision_requested',
      'approved',
      'rejected'
    ],
    default: 'pending'
  ),

  // Plagiarism check (placeholder)
  plagiarismCheckStatus: String (
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  ),
  plagiarismReportUrl: String,
  plagiarismScore: Number (0-100),
  plagiarismCheckDate: Date,

  // Review
  reviewedBy: {
    type: ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,

  // Immutability flag
  isImmutable: Boolean (default: false),

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `project`
- `document`
- `submittedBy`
- `status`
- `plagiarismCheckStatus`
- `submittedAt` (descending)

---

### 5. Comments Collection
**Purpose:** Store feedback from advisers and panel members

```javascript
{
  _id: ObjectId,
  project: {
    type: ObjectId,
    ref: 'Project',
    required: true
  },
  document: {
    type: ObjectId,
    ref: 'Document'
  },

  // Comment details
  content: String (required, maxlength: 2000),
  commentType: String (
    enum: ['general', 'revision', 'approval', 'rejection'],
    default: 'general'
  ),

  // Author
  author: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  authorRole: String (enum: ['adviser', 'panel', 'coordinator']),

  // Threading
  parentComment: {
    type: ObjectId,
    ref: 'Comment'
  },
  replies: [{
    type: ObjectId,
    ref: 'Comment'
  }],

  // Status
  isResolved: Boolean (default: false),
  resolvedBy: {
    type: ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  editedAt: Date
}
```

**Indexes:**
- `project`
- `document`
- `author`
- `parentComment`
- `isResolved`
- `createdAt` (descending)

---

### 6. Notifications Collection
**Purpose:** Store system notifications for users

```javascript
{
  _id: ObjectId,
  recipient: {
    type: ObjectId,
    ref: 'User',
    required: true
  },

  // Notification content
  type: String (
    enum: [
      'project_submitted',
      'comment_added',
      'status_changed',
      'document_uploaded',
      'project_assigned',
      'project_approved',
      'project_rejected',
      'grade_assigned'
    ],
    required: true
  ),
  title: String (required, maxlength: 100),
  message: String (required, maxlength: 500),

  // Context
  project: {
    type: ObjectId,
    ref: 'Project'
  },
  document: {
    type: ObjectId,
    ref: 'Document'
  },
  comment: {
    type: ObjectId,
    ref: 'Comment'
  },
  actionUrl: String,

  // Actor (who triggered the notification)
  actor: {
    type: ObjectId,
    ref: 'User'
  },

  // Status
  isRead: Boolean (default: false),
  readAt: Date,

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date (auto-delete old notifications)
}
```

**Indexes:**
- `recipient`
- `isRead`
- `type`
- `createdAt` (descending)
- `expiresAt` (TTL index for auto-deletion)

---

### 7. AuditLogs Collection
**Purpose:** Track all critical system actions for auditing

```javascript
{
  _id: ObjectId,

  // User who performed the action
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  userRole: String (enum: ['student', 'adviser', 'panel', 'coordinator']),

  // Action details
  action: String (
    enum: [
      'user_login',
      'user_logout',
      'user_register',
      'project_create',
      'project_update',
      'project_delete',
      'project_submit',
      'project_approve',
      'project_reject',
      'document_upload',
      'document_delete',
      'comment_create',
      'comment_update',
      'comment_delete',
      'grade_assign',
      'status_change'
    ],
    required: true
  ),

  // Context
  entityType: String (enum: ['user', 'project', 'document', 'comment']),
  entityId: ObjectId,

  // Details
  description: String (required),
  metadata: Object (flexible for storing action-specific data),

  // Request info
  ipAddress: String,
  userAgent: String,

  // Timestamps
  timestamp: Date (default: Date.now, indexed)
}
```

**Indexes:**
- `user`
- `action`
- `entityType`
- `entityId`
- `timestamp` (descending)

---

### 8. GoogleDocsIntegration Collection
**Purpose:** Track Google Docs created for projects

```javascript
{
  _id: ObjectId,
  project: {
    type: ObjectId,
    ref: 'Project',
    required: true
  },

  // Google Docs details
  googleDocId: String (required, unique),
  googleDocUrl: String (required),
  googleDocTitle: String (required),

  // Document type
  docType: String (
    enum: [
      'proposal',
      'chapter_1',
      'chapter_2',
      'chapter_3',
      'chapter_4',
      'chapter_5',
      'final_manuscript'
    ],
    required: true
  ),

  // Permissions
  sharedWith: [{
    user: { type: ObjectId, ref: 'User' },
    permission: String (enum: ['edit', 'comment', 'view']),
    sharedAt: Date
  }],

  // Sync status
  lastSyncedAt: Date,
  syncStatus: String (enum: ['synced', 'pending', 'failed'], default: 'synced'),

  // Tracking
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `project`
- `googleDocId` (unique)
- `docType`
- `lastSyncedAt`

---

## Relationships Summary

### User Relationships
- User ↔ Projects (many-to-many: students)
- User → Projects (one-to-many: adviser)
- User ↔ Projects (many-to-many: panel members)
- User → Documents (one-to-many: uploads)
- User → Comments (one-to-many: author)
- User → Notifications (one-to-many: recipient)
- User → AuditLogs (one-to-many: actions)

### Project Relationships
- Project → Documents (one-to-many)
- Project → Submissions (one-to-many)
- Project → Comments (one-to-many)
- Project → Notifications (one-to-many)
- Project → GoogleDocsIntegration (one-to-many)

### Document Relationships
- Document → Submissions (one-to-many)
- Document → Comments (one-to-many)
- Document → Document (self-referencing for versioning)

---

## Data Integrity Rules

### 1. Cascade Deletion
- When a Project is deleted (soft delete):
  - Documents remain but are marked as deleted
  - Submissions remain for auditing
  - Comments remain for auditing
  - Notifications can be deleted

### 2. Referential Integrity
- All references to Users must exist
- Documents must reference valid Projects
- Submissions must reference valid Projects and Documents
- Comments must reference valid Projects

### 3. Validation Rules
- Email must be valid format and unique
- Student ID must be unique (when provided)
- Project title must be unique
- File size must not exceed 10MB for uploads
- Plagiarism score must be between 0-100
- Grades must be between 0-100

### 4. Soft Delete
- Projects, Documents, and Users use soft delete
- Set `isDeleted: true` or `deletedAt: Date`
- Exclude soft-deleted records from normal queries

---

## Performance Optimization

### 1. Indexing Strategy
- Create compound indexes for frequently queried combinations:
  - `{ project: 1, status: 1 }`
  - `{ recipient: 1, isRead: 1, createdAt: -1 }`
  - `{ user: 1, action: 1, timestamp: -1 }`

### 2. Data Archiving
- Archive old notifications after 90 days (TTL index)
- Archive audit logs after 2 years (move to cold storage)
- Archive completed projects after 3 years

### 3. Query Optimization
- Use `.select()` to retrieve only required fields
- Use `.lean()` for read-only queries
- Implement pagination for large result sets
- Cache frequently accessed data (user profiles, project lists)

---

## Migration Scripts

### Initial Setup
```javascript
// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ studentId: 1 }, { unique: true, sparse: true });
db.projects.createIndex({ title: 1 }, { unique: true });
db.documents.createIndex({ googleDriveFileId: 1 }, { unique: true });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
```

### Sample Seed Data
```javascript
// Create default coordinator
{
  firstName: 'System',
  lastName: 'Administrator',
  email: 'admin@buksu.edu.ph',
  password: hashedPassword,
  role: 'coordinator',
  isVerified: true,
  isActive: true
}
```

---

**Document Version:** 1.0
**Last Updated:** February 15, 2026

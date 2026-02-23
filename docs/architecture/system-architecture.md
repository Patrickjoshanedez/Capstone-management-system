# System Architecture - Capstone Management System

## 1. System Overview

**Project Name:** Project Workspace - Capstone Management System
**Institution:** Bukidnon State University (BukSU)
**Target Users:** BSIT/BSEMC 3rd and 4th Year Students, Advisers, Panel Members, Coordinators
**Technology Stack:** MERN (MongoDB, Express.js, React, Node.js)
**Deployment:** Zero-cost (Render Free Tier, Vercel, MongoDB Atlas M0)

## 2. Architectural Principles

### 2.1 Core Design Principles
- **Cost Efficiency:** All services must be deployable on free tier
- **Resource Optimization:** Backend must operate within 512MB RAM limit
- **Scalability:** System should handle 37+ concurrent users for UAT
- **Security:** JWT-based authentication with role-based access control
- **Maintainability:** Clear separation of concerns (MVC pattern)

### 2.2 Deployment Constraints
- **RAM Limit:** 512MB maximum
- **File Handling:** Stream files to Google Drive, no in-memory buffering
- **Database:** MongoDB Atlas M0 (free tier)
- **Storage:** Google Drive API with Service Account
- **Plagiarism Detection:** Placeholder only (Copyleaks integration deferred)

## 3. System Components

### 3.1 Frontend (React + Vite)
```
client/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Role-specific dashboards
│   │   ├── projects/         # Project management components
│   │   └── documents/        # Document management components
│   ├── pages/                # Route-level pages
│   ├── context/              # React Context for state management
│   ├── services/             # API service layer (Axios)
│   ├── utils/                # Utility functions
│   ├── hooks/                # Custom React hooks
│   └── styles/               # Tailwind CSS configurations
```

**Key Technologies:**
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** Context API
- **HTTP Client:** Axios
- **Routing:** React Router v6

### 3.2 Backend (Node.js + Express)
```
server/
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── projectController.js
│   ├── documentController.js
│   └── notificationController.js
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── Project.js
│   ├── Document.js
│   └── Notification.js
├── routes/                   # API route definitions
│   ├── auth.js
│   ├── projects.js
│   ├── documents.js
│   └── notifications.js
├── middleware/               # Custom middleware
│   ├── auth.js              # JWT verification
│   ├── errorHandler.js      # Centralized error handling
│   └── validation.js        # Input validation
├── services/                 # Business logic layer
│   ├── googleDriveService.js
│   ├── emailService.js
│   └── notificationService.js
└── index.js                 # Server entry point
```

**Key Technologies:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database ODM:** Mongoose
- **Authentication:** JWT + bcrypt
- **Validation:** Joi
- **Email:** Nodemailer (SMTP)

### 3.3 Database (MongoDB)
**Collections:**
- `users` - User accounts with role-based access
- `projects` - Capstone project metadata
- `documents` - Document metadata (storage in Google Drive)
- `submissions` - Project submissions with version control
- `comments` - Adviser/panel feedback
- `notifications` - System notifications
- `audit_logs` - Activity tracking

### 3.4 External Services
- **Google Drive API:** Document storage and collaborative editing
- **Google Docs API:** Real-time document collaboration
- **Nodemailer:** Email notifications (SMTP)
- **Copyleaks API (Deferred):** Plagiarism detection placeholder

## 4. Architecture Patterns

### 4.1 Backend Architecture (MVC Pattern)
```
Request Flow:
Client → Routes → Middleware → Controllers → Services → Models → Database
                                                      ↓
                                              External APIs
```

**Layers:**
1. **Routes:** Define API endpoints and map to controllers
2. **Middleware:** Authentication, validation, error handling
3. **Controllers:** Handle HTTP requests/responses
4. **Services:** Business logic and external API integration
5. **Models:** Data structure and database operations

### 4.2 Frontend Architecture (Component-Based)
```
Component Hierarchy:
App
├── Layout
│   ├── Header (Navigation)
│   └── Sidebar (Role-based menu)
└── Pages
    ├── Dashboard (Role-specific)
    ├── Projects
    │   ├── ProjectList
    │   ├── ProjectDetails
    │   └── ProjectForm
    └── Documents
        ├── DocumentList
        └── DocumentViewer
```

### 4.3 State Management Strategy
- **Local State:** Component-level state with useState
- **Global State:** Context API for auth, user, theme
- **Server State:** React Query for API data caching
- **Form State:** Controlled components with validation

## 5. Security Architecture

### 5.1 Authentication Flow
```
1. User Login (email + password)
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT token (expires 24h)
   ↓
4. Return token to client
   ↓
5. Client stores token (localStorage)
   ↓
6. Include token in Authorization header for subsequent requests
```

### 5.2 Authorization (RBAC)
**Roles:**
- **Student:** View projects, submit documents, receive feedback
- **Adviser:** Review assigned projects, provide comments, approve submissions
- **Panel Member:** Evaluate projects, provide scores
- **Coordinator:** Manage all projects, generate reports, system administration

**Permission Matrix:**
| Action | Student | Adviser | Panel | Coordinator |
|--------|---------|---------|-------|-------------|
| Create Project | ✓ | ✗ | ✗ | ✓ |
| Submit Document | ✓ | ✗ | ✗ | ✗ |
| Review Project | ✗ | ✓ | ✓ | ✓ |
| Approve Project | ✗ | ✓ | ✗ | ✓ |
| Grade Project | ✗ | ✗ | ✓ | ✓ |
| Export Reports | ✗ | ✗ | ✗ | ✓ |

### 5.3 Security Measures
- **Password Hashing:** bcrypt with salt rounds = 10
- **JWT Secret:** Stored in environment variables
- **Input Validation:** Joi schemas on all endpoints
- **SQL Injection Prevention:** Mongoose ODM parameterized queries
- **XSS Protection:** Input sanitization, Content Security Policy
- **CORS:** Whitelist allowed origins
- **Rate Limiting:** Prevent brute force attacks
- **Secure Headers:** Helmet.js middleware

## 6. Data Flow

### 6.1 Project Submission Flow
```
1. Student creates project proposal
   ↓
2. System checks title uniqueness
   ↓
3. Student uploads document to Google Drive via backend
   ↓
4. Backend stores metadata in MongoDB
   ↓
5. System notifies assigned adviser
   ↓
6. Adviser reviews and provides feedback
   ↓
7. Student revises and resubmits (version control)
   ↓
8. Adviser approves submission
   ↓
9. System triggers panel evaluation
   ↓
10. Panel members grade project
    ↓
11. Coordinator archives approved manuscript
```

### 6.2 Google Drive Integration Flow
```
1. Student requests document creation
   ↓
2. Backend calls Google Drive API (Service Account)
   ↓
3. Create document in tenant-specific folder
   ↓
4. Share document with student (edit access)
   ↓
5. Share document with adviser (comment access)
   ↓
6. Store document metadata in MongoDB
   ↓
7. Return document URL to client
   ↓
8. Student edits document in Google Docs
   ↓
9. Backend syncs changes periodically
   ↓
10. Adviser provides inline comments
```

## 7. API Architecture

### 7.1 API Design Principles
- **RESTful:** Standard HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Versioning:** `/api/v1/` prefix for future compatibility
- **Consistent Response Format:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### 7.2 Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  }
}
```

### 7.3 Status Codes
- **200 OK:** Successful GET request
- **201 Created:** Successful POST request
- **204 No Content:** Successful DELETE request
- **400 Bad Request:** Invalid input
- **401 Unauthorized:** Missing or invalid token
- **403 Forbidden:** Insufficient permissions
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server error

## 8. Deployment Architecture

### 8.1 Production Environment
```
Client (Vercel)
    ↓ HTTPS
Backend (Render Free Tier)
    ↓
MongoDB Atlas M0 (Free)
    ↓
Google Drive API
```

### 8.2 Environment Variables
**Backend (.env):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRE=24h
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_DRIVE_FOLDER_ID=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
CLIENT_URL=https://...
```

**Frontend (.env):**
```
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Project Workspace
```

### 8.3 CI/CD Pipeline (GitHub Actions)
```
1. Push to main branch
   ↓
2. Run tests (Jest + Supertest)
   ↓
3. Build frontend (Vite)
   ↓
4. Deploy backend to Render
   ↓
5. Deploy frontend to Vercel
   ↓
6. Run smoke tests
   ↓
7. Notify team (success/failure)
```

## 9. Performance Optimization

### 9.1 Backend Optimizations
- **Database Indexing:** Index frequently queried fields
- **Connection Pooling:** Reuse MongoDB connections
- **Caching:** Redis for session storage (if budget allows)
- **Streaming:** Stream large files instead of buffering
- **Compression:** gzip middleware for responses

### 9.2 Frontend Optimizations
- **Code Splitting:** Dynamic imports for routes
- **Lazy Loading:** Load components on demand
- **Image Optimization:** Compress and lazy load images
- **Bundle Size:** Tree shaking and minification
- **CDN:** Serve static assets from CDN

## 10. Monitoring & Logging

### 10.1 Logging Strategy
- **Application Logs:** Winston logger
- **Error Tracking:** Sentry (optional)
- **Access Logs:** Morgan middleware
- **Audit Logs:** Database logging for critical actions

### 10.2 Monitoring Metrics
- **Uptime:** Monitor server availability
- **Response Time:** Track API latency
- **Error Rate:** Monitor 500 errors
- **Database Performance:** Query execution time
- **Memory Usage:** Track RAM consumption (512MB limit)

## 11. Disaster Recovery

### 11.1 Backup Strategy
- **Database Backups:** MongoDB Atlas automated backups
- **Document Backups:** Google Drive retention policies
- **Code Repository:** GitHub with protected branches

### 11.2 Recovery Procedures
1. Database restore from MongoDB Atlas snapshots
2. Re-deploy backend from GitHub main branch
3. Re-deploy frontend from GitHub main branch
4. Verify all services operational
5. Notify users of restoration

## 12. Future Enhancements
- Implement Copyleaks API for real plagiarism detection
- Add real-time notifications with WebSockets
- Implement file version comparison
- Add analytics dashboard for coordinators
- Integrate with university LDAP for SSO
- Add mobile app support (React Native)

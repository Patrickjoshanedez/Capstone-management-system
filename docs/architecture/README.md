# Architecture Documentation

This folder contains comprehensive architecture documentation for the BukSU Capstone Management System.

## Documents

### 1. [System Architecture](./system-architecture.md)
**Purpose:** Complete system architecture overview

**Contents:**
- System overview and design principles
- Component architecture (Frontend, Backend, Database, External Services)
- Architecture patterns (MVC, Component-based)
- Security architecture
- Data flow diagrams
- API architecture
- Deployment architecture
- Performance optimization strategies
- Monitoring and disaster recovery

**Audience:** Developers, system architects, technical stakeholders

---

### 2. [Database Schema](./database-schema.md)
**Purpose:** Detailed MongoDB database design

**Contents:**
- Collection schemas (8 collections)
- Field definitions and validation rules
- Relationships and foreign keys
- Indexes for performance optimization
- Data integrity rules
- Performance optimization strategies
- Migration scripts

**Collections Documented:**
1. Users - User accounts with roles
2. Projects - Capstone project metadata
3. Documents - Document metadata (Google Drive storage)
4. Submissions - Project submissions with version control
5. Comments - Feedback from advisers and panel
6. Notifications - System notifications
7. AuditLogs - Activity tracking
8. GoogleDocsIntegration - Google Docs collaboration

**Audience:** Backend developers, database administrators

---

## Related Documentation

### System Design Documents
- [API Contracts](../02-api-contracts.md) - REST API endpoint definitions
- [User Roles](../03-user-roles.md) - Role-based access control
- [Workflow Diagrams](../01-workflow-diagrams.md) - System workflows

### Development Guides
- [Setup Guide](../04-setup-guide.md) - Development environment setup
- [Deployment Guide](../deployment-guide.md) - Production deployment
- [Google Docs Integration](../07-google-docs-integration.md) - Google APIs integration

### Project Management
- [Project Task Breakdown](../project-task-breakdown.md) - 118 detailed tasks across 5 phases
- [Quick Reference Guide](../quick-reference-guide.md) - Summary of phases and deliverables

---

## Architecture Principles

### 1. Cost Efficiency
- All services deployable on free tier (Render, Vercel, MongoDB Atlas M0)
- Backend operates within 512MB RAM limit
- Optimized resource usage

### 2. Scalability
- Designed for 100+ concurrent users
- Horizontal scaling support
- Database indexing for performance

### 3. Security
- JWT-based authentication
- bcrypt password hashing
- Role-based access control (RBAC)
- Input validation and sanitization
- HTTPS enforcement

### 4. Maintainability
- MVC pattern for clear separation of concerns
- Comprehensive documentation
- Automated testing (70% backend, 60% frontend coverage)
- Version control with Git

### 5. User Experience
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Real-time notifications
- Fast response times (< 2 seconds for 90% of requests)

---

## Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS + Shadcn UI
- Context API for state management
- Axios for HTTP requests

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT + bcrypt for authentication
- Joi for input validation

### External Services
- Google Drive API - File storage
- Google Docs API - Collaborative editing
- Nodemailer - Email notifications

### Deployment
- **Frontend:** Vercel
- **Backend:** Render Free Tier
- **Database:** MongoDB Atlas M0
- **CI/CD:** GitHub Actions

---

## Key Design Decisions

### 1. Why MERN Stack?
- **Cost:** All components have robust free tiers
- **Familiarity:** Team expertise with JavaScript ecosystem
- **Ecosystem:** Rich library ecosystem for rapid development
- **Performance:** Suitable for academic project scale

### 2. Why Google Drive for Storage?
- **Cost:** Free tier sufficient for project needs (15GB per account)
- **Reliability:** Google's infrastructure ensures high availability
- **Integration:** Google Docs API for collaborative editing
- **Familiarity:** Users already familiar with Google ecosystem

### 3. Why MongoDB?
- **Flexibility:** Schema-less design suits evolving requirements
- **Scalability:** Horizontal scaling support
- **Free Tier:** MongoDB Atlas M0 sufficient for development and testing
- **Developer Experience:** Mongoose ODM simplifies database operations

### 4. Why Context API (not Redux)?
- **Simplicity:** Lower learning curve
- **Bundle Size:** No additional dependencies
- **Sufficient:** Simple state management needs
- **React Built-in:** Native React solution

---

## System Constraints

### Resource Constraints
- **RAM:** 512MB maximum on Render Free Tier
- **Database:** 512MB storage on MongoDB Atlas M0
- **Storage:** Google Drive free tier (15GB)
- **API Calls:** Google APIs daily quotas

### Implementation Constraints
- **Plagiarism Detection:** Copyleaks integration not implemented (placeholder only)
- **Real-time Updates:** Polling-based (not WebSockets) to reduce server load
- **File Size:** 10MB maximum per upload
- **Concurrent Users:** Optimized for 100 concurrent users

---

## Future Enhancements

### Planned for Version 2.0
1. **Copyleaks Integration:** Real plagiarism detection
2. **WebSocket Support:** Real-time notifications
3. **Mobile App:** React Native implementation
4. **Advanced Analytics:** Project progress dashboards
5. **LDAP Integration:** University SSO
6. **File Comparison:** Side-by-side version comparison
7. **Email Scheduling:** Automated reminder emails

---

## How to Use This Documentation

### For New Developers
1. Start with [System Architecture](./system-architecture.md) to understand the big picture
2. Review [Database Schema](./database-schema.md) to understand data structures
3. Refer to [API Contracts](../02-api-contracts.md) for endpoint details
4. Follow [Setup Guide](../04-setup-guide.md) to configure your environment

### For Stakeholders
1. Review [System Architecture](./system-architecture.md) sections 1-5 for system overview
2. Check [Project Task Breakdown](../project-task-breakdown.md) for project timeline
3. Refer to [Quick Reference Guide](../quick-reference-guide.md) for summary

### For Thesis Documentation
1. Use [System Architecture](./system-architecture.md) for Chapter 3 (Methodology)
2. Use [Database Schema](./database-schema.md) for detailed schema discussion
3. Reference architecture diagrams in thesis manuscript

---

## Diagram Sources

All diagrams can be recreated or edited using:
- **Architecture Diagrams:** Draw.io, Lucidchart
- **Database ERD:** Draw.io, dbdiagram.io
- **Workflow Diagrams:** Draw.io, Lucidchart
- **API Documentation:** Swagger UI, Postman

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 15, 2026 | Initial architecture documentation | Development Team |

---

## Questions or Feedback?

For questions about the architecture or to suggest improvements:
- Open an issue in the GitHub repository
- Contact the development team
- Discuss in team meetings

---

**Last Updated:** February 15, 2026
**Maintained By:** Development Team

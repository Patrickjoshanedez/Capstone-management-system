# API Contracts

## Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/resend-otp
POST   /api/v1/auth/login
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
PUT    /api/v1/auth/profile

## Projects
POST   /api/v1/projects/check-title
GET    /api/v1/projects
GET    /api/v1/projects/:projectId
POST   /api/v1/projects
POST   /api/v1/projects/:projectId/upload
PATCH  /api/v1/projects/:projectId/status
GET    /api/v1/projects/:projectId/logs
PUT    /api/v1/projects/:projectId/proposal
POST   /api/v1/projects/:projectId/comments
GET    /api/v1/projects/:projectId/comments

## Google Docs
GET    /api/v1/google-docs/status
POST   /api/v1/projects/:projectId/docs/create
GET    /api/v1/projects/:projectId/docs
POST   /api/v1/projects/:projectId/docs/sync
POST   /api/v1/projects/:projectId/docs/share
DELETE /api/v1/projects/:projectId/docs

## Notifications
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/mark-all-read
DELETE /api/v1/notifications/:id
DELETE /api/v1/notifications/clear-read

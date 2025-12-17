# Document Vault (Google Drive Integration)

This feature stores capstone manuscript uploads in Google Drive (via a Service Account) to keep the system **zero-cost deployable** and within the backend **512MB RAM** constraint.

## Summary

- Uploads are streamed to Google Drive using the Drive API.
- The database stores only:
  - `fileId`
  - `webViewLink`
  - `uploadedAt`
- Uploads are allowed only when a project status is `PROPOSED` or `REVISION_REQUIRED`.

## Backend

- Endpoint: `POST /api/v1/projects/:projectId/upload`
- Auth: required
- Roles: `student`
- Upload middleware:
  - `multer` with `memoryStorage`
  - max file size: 25MB

Implementation files:
- [server/controllers/uploadController.js](server/controllers/uploadController.js)
- [server/routes/api.js](server/routes/api.js)

## Frontend

- The Dashboard project details view provides:
  - a "View Document" link when available
  - a Student-only upload control when status is `PROPOSED` or `REVISION_REQUIRED`

Implementation file:
- [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx)

## Notes

- Plagiarism checking is currently a placeholder only (see [server/services/plagiarismService.js](server/services/plagiarismService.js)).

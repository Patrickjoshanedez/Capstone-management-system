# Completed Sprints (Status + Delivered Details)

This page tracks which sprints are completed in the current codebase and what was delivered.
It is meant to be read alongside [docs/sprints/sprint-plan.md](docs/sprints/sprint-plan.md).

---

## Sprint 1: Foundation & Authentication (Weeks 1-2)

**Status:** Completed

**Scope delivered (mapped to sprint-plan cards):**

- **[ARCH001] MERN structure**
  - `client/` (React + Vite) and `server/` (Express + Mongoose) exist and run.
  - Frontend uses Tailwind with `tw-` prefix and shadcn-style UI primitives.

- **[BACK001] MongoDB connection**
  - Backend connects using `process.env.MONGO_URI` (with a local fallback in dev).
  - Implemented in: [server/index.js](server/index.js)

- **[BACK002] JWT authentication**
  - Implemented:
    - `POST /api/v1/auth/register`
    - `POST /api/v1/auth/login`
    - `GET /api/v1/auth/me` (protected)
  - Controller: [server/controllers/authController.js](server/controllers/authController.js)
  - Route wiring: [server/routes/api.js](server/routes/api.js)
  - Middleware: [server/middleware/authMiddleware.js](server/middleware/authMiddleware.js)

- **[FRONT001] Login/Register UI**
  - Pages:
    - [client/src/pages/Login.jsx](client/src/pages/Login.jsx)
    - [client/src/pages/Register.jsx](client/src/pages/Register.jsx)
  - API client (shared axios instance, JWT header injection):
    - [client/src/services/api.js](client/src/services/api.js)

- **[COORD001] Seed users**
  - Seed script creates default Coordinator/Adviser/Student users for testing.
  - Script: [server/seed.js](server/seed.js)

**Notes / deviations from acceptance criteria:**
- Some UI error feedback is currently inline (and may not always use toasts).

---

## Sprint 2: Project Proposal & Workflow Engine (Weeks 3-4)

**Status:** Completed

**Scope delivered (mapped to sprint-plan cards):**

- **[BACK003] Project state machine**
  - Enforced transitions and role restrictions server-side.
  - Controller: [server/controllers/projectController.js](server/controllers/projectController.js)
  - Model: [server/models/Project.js](server/models/Project.js)

- **[SYS001] Workflow logging (audit trail)**
  - `WorkflowLog` model exists and is written on status transitions.
  - Model: [server/models/WorkflowLog.js](server/models/WorkflowLog.js)
  - Endpoint:
    - `GET /api/v1/projects/:projectId/logs`

- **Projects API (core endpoints present)**
  - Routes wired in: [server/routes/api.js](server/routes/api.js)
  - Implemented endpoints:
    - `GET /api/v1/projects`
    - `GET /api/v1/projects/:projectId`
    - `POST /api/v1/projects`
    - `PATCH /api/v1/projects/:projectId/status`
    - `GET /api/v1/projects/:projectId/logs`

- **Minimal dashboard to exercise Sprint 2**
  - Page: [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx)

- **Sprint 2 UX requirements now covered**
  - Students create proposals via a “New Project” modal.
  - Advisers can open project details and approve/request revision.
  - Project details view displays workflow logs as “From [Old] To [New]”.

**Notes / deviations from acceptance criteria:**
- Members are entered as comma-separated MongoDB user IDs (no user search UI yet).

---

## Sprint 3: Document Vault & Google Drive Integration (Weeks 5-6)

**Status:** Completed

**Scope delivered (mapped to sprint-plan cards):**

- **[BACK004] Google Service Account configuration**
  - Drive client initializes using env-based Service Account credentials.
  - Controller: [server/controllers/uploadController.js](server/controllers/uploadController.js)

- **[BACK005] Stream uploads to Drive + persist file link**
  - Upload endpoint stores only `fileId` and `webViewLink` in MongoDB.
  - Endpoint:
    - `POST /api/v1/projects/:projectId/upload`
  - Route wiring: [server/routes/api.js](server/routes/api.js)

- **[STUD002] Student upload UX (status-gated)**
  - Upload control is available only when status is `PROPOSED` or `REVISION_REQUIRED`.
  - UI disables upload when not allowed.
  - Page: [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx)

- **[ADV003] Adviser view/download**
  - "View Document" link is displayed when a document is present.
  - Page: [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx)

**Docs:**
- Overview: [docs/05-document-vault.md](docs/05-document-vault.md)

---

## Sprint 4: Plagiarism Service & Final Polish (Weeks 7-8)

**Status:** Completed

**Scope delivered (mapped to sprint-plan cards):**

- **[BACK006] Plagiarism placeholder integration (already wired on upload)**
  - Upload triggers the mock plagiarism check and persists `plagiarismReport` on the project.
  - Service: [server/services/plagiarismService.js](server/services/plagiarismService.js)
  - Upload controller: [server/controllers/uploadController.js](server/controllers/uploadController.js)

- **[ADV004] Plagiarism report summary badge**
  - Project list + project details show a plagiarism summary badge (handles pending statuses).
  - Page: [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx)

- **[FRONT002] Responsive + polished UI**
  - Dashboard header and project rows stack on mobile.
  - Loading state uses skeleton placeholders.
  - User-friendly toast messages appear for create/status/upload outcomes.
  - Page: [client/src/pages/Dashboard.jsx](client/src/pages/Dashboard.jsx)

---

## Sprint 5: Password Reset via Email Code (Weeks 9-10)

**Status:** Completed

**Scope delivered (mapped to sprint-plan cards):**

- **[AUTH003] Request reset code via email**
  - Endpoint: `POST /api/v1/auth/forgot-password` (generic response; anti-enumeration)
  - UI: [client/src/pages/Login.jsx](client/src/pages/Login.jsx)

- **[BACK007] Secure code storage + expiry**
  - Reset code is stored as a hash + expiry timestamp on the user record.
  - Model: [server/models/User.js](server/models/User.js)

- **[BACK008] Zero-cost email delivery**
  - Implemented via Gmail SMTP (App Password) using Nodemailer.
  - Controller: [server/controllers/authController.js](server/controllers/authController.js)

- **[AUTH004] Verify code + set new password**
  - Endpoint: `POST /api/v1/auth/reset-password`
  - Controller: [server/controllers/authController.js](server/controllers/authController.js)

- **[SEC001] Anti-enumeration + throttling + audit trail**
  - Requests return a generic message regardless of account existence.
  - Rate limits return `429` (request + verify attempts).
  - Audit trail model: [server/models/AuthLog.js](server/models/AuthLog.js)

**Docs:**
- Setup: [docs/04-setup-guide.md](docs/04-setup-guide.md)
- Feature notes: [docs/06-password-reset.md](docs/06-password-reset.md)

---

## Reference

- API contract source of truth: [docs/02-api-contracts.md](docs/02-api-contracts.md)
- Sprint backlog: [docs/sprints/sprint-plan.md](docs/sprints/sprint-plan.md)

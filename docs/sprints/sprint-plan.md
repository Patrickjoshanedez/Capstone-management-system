# Project Workspace Sprint Plan

This document outlines the agile sprint plan for the "Project Workspace" Capstone Management System.
All tasks follow the Trello Kanban format: `[CODENAME] As a <role>, I want to <action> So that <benefit>`.

See also: [docs/sprints/completed-sprints.md](docs/sprints/completed-sprints.md)

## Sprint 1: Foundation & Authentication (Weeks 1-2)
**Goal:** Establish the core infrastructure, database connections, and secure user authentication.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[ARCH001]** | **As a System Architect, I want to set up the MERN stack structure So that the team has a standardized development environment.** | 1. Given a fresh repository, When I clone it, Then I see `client` and `server` folders with `package.json` initialized.<br>2. Given the backend, When I run `npm install`, Then `express`, `mongoose`, and `cors` are installed.<br>3. Given the frontend, When I run `npm run dev`, Then the Vite React app loads successfully. |
| **[BACK001]** | **As a Developer, I want to connect the application to MongoDB Atlas So that data can be persisted.** | 1. Given a `.env` file, When I add `MONGO_URI`, Then the server connects to Atlas without errors.<br>2. Given a connection failure, When the server starts, Then it logs a clear error message. |
| **[BACK002]** | **As a Developer, I want to implement JWT Authentication So that users can securely log in.** | 1. Given a valid email/password, When I POST to `/auth/login`, Then I receive a JWT token.<br>2. Given an invalid password, When I POST to `/auth/login`, Then I receive a 401 Unauthorized error.<br>3. Given a protected route, When I request without a token, Then I receive a 403 Forbidden error. |
| **[FRONT001]** | **As a User, I want a Login/Register page So that I can access the system.** | 1. Given the login page, When I enter credentials, Then I am redirected to the dashboard.<br>2. Given the login form, When I submit, Then a loading spinner is shown.<br>3. Given an error, When login fails, Then a toast notification displays the error message. |
| **[COORD001]** | **As a Coordinator, I want to seed initial user accounts So that the system is ready for testing.** | 1. Given an empty database, When I run the seed script, Then default Coordinator, Adviser, and Student accounts are created.<br>2. Given existing accounts, When I run the seed script, Then it does not duplicate users. |

## Sprint 2: Project Proposal & Workflow Engine (Weeks 3-4)
**Goal:** Enable students to propose projects and implement the core state machine logic.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[BACK003]** | **As a Developer, I want to implement the Project State Machine So that project status transitions are strictly controlled.** | 1. Given a project, When status is `PROPOSED`, Then it cannot jump to `ARCHIVED`.<br>2. Given a status change, When saved, Then a `WorkflowLog` entry is created automatically.<br>3. Given a non-adviser user, When trying to approve, Then the API returns 403 Forbidden. |
| **[STUD001]** | **As a Student, I want to create a Project Proposal So that I can start my capstone journey.** | 1. Given the dashboard, When I click "New Project", Then a modal opens.<br>2. Given the form, When I submit a title and members, Then a new project is created with status `PROPOSED`.<br>3. Given a created project, When I view the dashboard, Then I see it listed. |
| **[ADV001]** | **As an Adviser, I want to view assigned projects So that I can review proposals.** | 1. Given I am an Adviser, When I log in, Then I see a list of projects assigned to me.<br>2. Given a project list, When I click a project, Then I see its details and current status. |
| **[ADV002]** | **As an Adviser, I want to Approve or Request Revision on a proposal So that the workflow advances.** | 1. Given a project in `ADVISER_REVIEW` status, When I click "Approve", Then status changes to `APPROVED_FOR_DEFENSE`.<br>2. Given a project in `ADVISER_REVIEW` status, When I click "Request Revision", Then status changes to `REVISION_REQUIRED`.<br>3. Given a status change, When completed, Then the UI updates the status badge color immediately. |

| **[SYS001]** | **As a System, I want to log every status change So that there is an audit trail.** | 1. Given a status update, When I query `/projects/:id/logs`, Then I see who changed the status and when.<br>2. Given a log entry, When displayed, Then it shows "From [Old] To [New]". |

## Sprint 3: Document Vault & Google Drive Integration (Weeks 5-6)
**Goal:** Implement the zero-cost storage solution using Google Drive API.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[BACK004]** | **As a Developer, I want to configure the Google Service Account So that the app can upload files on behalf of the system.** | 1. Given valid credentials, When the server starts, Then the Google Drive client initializes.<br>2. Given a file upload request, When processed, Then it uses the Service Account to authenticate. |
| **[BACK005]** | **As a Developer, I want to stream file uploads directly to Drive So that I don't exceed the 512MB RAM limit.** | 1. Given a large file (20MB), When uploaded, Then the server RAM usage does not spike significantly.<br>2. Given a successful upload, When finished, Then the Google Drive File ID is returned.<br>3. Given a network error, When upload fails, Then the stream is properly closed. |
| **[STUD002]** | **As a Student, I want to upload my manuscript PDF So that my adviser can review it.** | 1. Given a project in `PROPOSED` status, When I upload a PDF, Then it is accepted.<br>2. Given a project in `APPROVED_FOR_DEFENSE` status, When I try to upload, Then the button is disabled.<br>3. Given a successful upload, When the page reloads, Then I see the "View Document" link. |
| **[ADV003]** | **As an Adviser, I want to view/download the uploaded PDF So that I can read the content.** | 1. Given a project with a document, When I click the link, Then it opens the Google Drive viewer.<br>2. Given a project without a document, When viewed, Then the link is hidden. |

## Sprint 4: Plagiarism Service & Final Polish (Weeks 7-8)
**Goal:** Integrate the mock plagiarism checker and finalize the UI/UX.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[BACK006]** | **As a Developer, I want to implement the Plagiarism Service placeholder So that the architecture is ready for the future AI engine.** | 1. Given a file upload, When completed, Then the `plagiarismService` is called.<br>2. Given the service response, When saved, Then the project `plagiarismReport` field is updated.<br>3. Given the mock service, When called, Then it returns `score: 0` and `status: pending_implementation`. |
| **[ADV004]** | **As an Adviser, I want to see a Plagiarism Report summary So that I can check for originality.** | 1. Given a project with a report, When viewed, Then a badge shows the plagiarism score.<br>2. Given a pending report, When viewed, Then it shows "Processing" or "Pending". |
| **[COORD002]** | **As a Coordinator, I want to Archive completed projects So that the active list remains clean.** | 1. Given an `APPROVED_FOR_DEFENSE` project, When I click "Archive", Then status changes to `ARCHIVED`.<br>2. Given an archived project, When viewed by students, Then it is read-only. |
| **[FRONT002]** | **As a User, I want a responsive and polished UI So that the system is easy to use on all devices.** | 1. Given a mobile device, When I view the dashboard, Then the layout stacks vertically.<br>2. Given an API error, When an action fails, Then a user-friendly toast message appears.<br>3. Given a loading state, When waiting, Then skeletons or spinners are shown. |

## Sprint 5: Password Reset via Email Code (Weeks 9-10)
**Goal:** Allow any user (Student/Adviser/Coordinator) to request a reset code via Gmail, verify it, and set a new password.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[AUTH003]** | **As a User, I want to request a password reset code via email So that I can regain access if I forget my password.** | 1. Given the login page, When I click "Forgot password?", Then I can enter my email and submit.<br>2. Given any email address, When I submit a reset request, Then the UI shows a generic success message that does not reveal whether the account exists.<br>3. Given a valid account email, When I request a reset, Then the system generates a one-time code and emails it to the user’s Gmail inbox (or configured SMTP inbox). |
| **[BACK007]** | **As a Developer, I want to generate and store a secure reset code with expiry So that password reset can be verified safely.** | 1. Given a reset request, When the server processes it, Then it stores a hashed reset code + expiry timestamp on the user (or in a separate ResetToken collection).<br>2. Given a code older than the expiry window (e.g., 10–15 minutes), When it is submitted, Then the API rejects it with 400.<br>3. Given repeated requests, When a new code is generated, Then previous codes are invalidated. |
| **[BACK008]** | **As a Developer, I want to send reset codes using a zero-cost email method So that the feature works on the free tier.** | 1. Given SMTP credentials in env (e.g., Gmail SMTP + App Password), When the server sends an email, Then it succeeds without blocking the request thread excessively.<br>2. Given missing/invalid SMTP credentials, When a reset is requested, Then the server responds with 500 and logs a clear error, while the UI shows a user-friendly message.<br>3. Given rate limits, When too many requests occur, Then the API responds with 429 (simple per-email throttling). |
| **[AUTH004]** | **As a User, I want to verify the reset code and set a new password So that I can log in again.** | 1. Given a reset code emailed to me, When I submit the code + new password, Then my password is updated and the reset code is invalidated immediately.<br>2. Given an invalid or expired code, When I submit it, Then I see an error and the password is not changed.<br>3. Given a successful reset, When I go back to login, Then I can log in with my new password. |
| **[SEC001]** | **As a System, I want password reset flows to avoid account enumeration So that user privacy is protected.** | 1. Given an email not registered, When a reset is requested, Then the response is the same as if it were registered (same status code and message).<br>2. Given repeated failed code attempts, When the threshold is exceeded, Then the API temporarily blocks attempts for that email/user.<br>3. Given reset activity, When an admin reviews logs, Then there is an audit trail (event type, timestamp, target user) without storing the plaintext code. |

## Sprint 6: Email Collaborators & Final Submission (Weeks 11-12)
**Goal:** Allow students to add members/adviser by Gmail (email) instead of MongoDB ObjectIds, and extend the workflow so an Adviser can mark `FINAL_SUBMITTED` only after `APPROVED_FOR_DEFENSE`.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[BACK009]** | **As a Developer, I want to create projects using member/adviser emails So that users can add collaborators without MongoDB IDs.** | 1. Given a create-project request with `memberEmails`, When the emails match existing student users, Then the server resolves them to ObjectIds and stores them in `members`.<br>2. Given `adviserEmail`, When it matches an existing adviser user, Then the server stores the adviser reference.<br>3. Given any missing/invalid emails, When the request is submitted, Then the server returns `400` with details for correction. |
| **[FRONT003]** | **As a Student, I want to enter member/adviser Gmail addresses So that I can create a project like adding collaborators on GitHub.** | 1. Given the “New Project” modal, When I enter comma-separated emails, Then the UI sends `memberEmails` and `adviserEmail` to the API.<br>2. Given invalid emails from the API, When the request fails, Then the UI shows the API message to guide correction.<br>3. Given success, When I return to the dashboard, Then I see the created project listed. |
| **[BACK010]** | **As a Developer, I want to add a `FINAL_SUBMITTED` status So that the workflow includes an explicit final submission step.** | 1. Given a project schema, When status is set to `FINAL_SUBMITTED`, Then it is accepted by validation and returned in responses.<br>2. Given a status update, When completed, Then a `WorkflowLog` entry is created for the transition.<br>3. Given the coordinator, When archiving, Then only `FINAL_SUBMITTED` can move to `ARCHIVED`. |
| **[ADV005]** | **As an Adviser, I want to mark a project as `FINAL_SUBMITTED` after defense approval So that final submission is recorded when revisions are complied.** | 1. Given a project in `APPROVED_FOR_DEFENSE`, When I click “Mark Final Submitted”, Then the status changes to `FINAL_SUBMITTED`.<br>2. Given a project not in `APPROVED_FOR_DEFENSE`, When I attempt final submission, Then the API rejects the transition with `403`.<br>3. Given the project list, When status changes, Then the UI badge updates immediately. |
| **[DOC002]** | **As a Maintainer, I want updated workflow diagrams and API contracts So that the system behavior is documented accurately.** | 1. Given the workflow docs, When `FINAL_SUBMITTED` is added, Then the Mermaid diagram includes the new state and transition.<br>2. Given the API contracts, When collaborator emails are supported, Then the create-project contract documents `memberEmails` and `adviserEmail`.<br>3. Given the status endpoint, When transitions change, Then the allowed transitions list reflects `APPROVED_FOR_DEFENSE → FINAL_SUBMITTED` and `FINAL_SUBMITTED → ARCHIVED`. |

## Sprint 7: reCAPTCHA v2 (Login/Register) (Weeks 13-14)
**Goal:** Add a reCAPTCHA checkbox to Login and Register to reduce automated abuse.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[FRONT004]** | **As a User, I want a reCAPTCHA checkbox on Login and Register so that automated bots can’t submit auth forms.** | 1. Given I am on the Login or Register page, When reCAPTCHA is not completed, Then the submit action is blocked and a helper message is shown.<br>2. Given I complete the reCAPTCHA checkbox, When I submit Login/Register, Then the request includes `recaptchaToken` and proceeds.<br>3. Given the reCAPTCHA expires or is cleared, When I attempt to submit, Then the UI prompts re-verification and does not call the API. |
| **[AUTH005]** | **As a Developer, I want the API to verify reCAPTCHA v2 tokens for Login and Register so that bot traffic is rejected server-side.** | 1. Given a Login/Register request without a reCAPTCHA token, When it reaches the API, Then it returns `400` with `reCAPTCHA required`.<br>2. Given a request with a token, When verification fails, Then the API returns `403` and does not authenticate or create a user.<br>3. Given verification succeeds, When Login/Register continues, Then the auth behavior remains unchanged for valid credentials and validation errors. |

# Project Workspace Sprint Plan

This document outlines the agile sprint plan for the "Project Workspace" Capstone Management System.
All tasks follow the Trello Kanban format: `[CODENAME] As a <role>, I want to <action> So that <benefit>`.

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
| **[ADV002]** | **As an Adviser, I want to Approve or Request Revision on a proposal So that the workflow advances.** | 1. Given a `PROPOSED` project, When I click "Approve", Then status changes to `APPROVED_FOR_DEFENSE`.<br>2. Given a project, When I click "Request Revision", Then status changes to `REVISION_REQUIRED`.<br>3. Given a status change, When completed, Then the UI updates the status badge color immediately. |
| **[SYS001]** | **As a System, I want to log every status change So that there is an audit trail.** | 1. Given a status update, When I query `/projects/:id/logs`, Then I see who changed the status and when.<br>2. Given a log entry, When displayed, Then it shows "From [Old] To [New]". |

## Sprint 3: Document Vault & Google Drive Integration (Weeks 5-6)
**Goal:** Implement the zero-cost storage solution using Google Drive API.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[BACK004]** | **As a Developer, I want to configure the Google Service Account So that the app can upload files on behalf of the system.** | 1. Given valid credentials, When the server starts, Then the Google Drive client initializes.<br>2. Given a file upload request, When processed, Then it uses the Service Account to authenticate. |
| **[BACK005]** | **As a Developer, I want to stream file uploads directly to Drive So that I don't exceed the 512MB RAM limit.** | 1. Given a large file (20MB), When uploaded, Then the server RAM usage does not spike significantly.<br>2. Given a successful upload, When finished, Then the Google Drive File ID is returned.<br>3. Given a network error, When upload fails, Then the stream is properly closed. |
| **[STUD002]** | **As a Student, I want to upload my manuscript PDF So that my adviser can review it.** | 1. Given a project in `PROPOSED` status, When I upload a PDF, Then it is accepted.<br>2. Given a project in `APPROVED` status, When I try to upload, Then the button is disabled.<br>3. Given a successful upload, When the page reloads, Then I see the "View Document" link. |
| **[ADV003]** | **As an Adviser, I want to view/download the uploaded PDF So that I can read the content.** | 1. Given a project with a document, When I click the link, Then it opens the Google Drive viewer.<br>2. Given a project without a document, When viewed, Then the link is hidden. |

## Sprint 4: Plagiarism Service & Final Polish (Weeks 7-8)
**Goal:** Integrate the mock plagiarism checker and finalize the UI/UX.

| Codename | Title | Description (Acceptance Criteria) |
| :--- | :--- | :--- |
| **[BACK006]** | **As a Developer, I want to implement the Plagiarism Service placeholder So that the architecture is ready for the future AI engine.** | 1. Given a file upload, When completed, Then the `plagiarismService` is called.<br>2. Given the service response, When saved, Then the project `plagiarismReport` field is updated.<br>3. Given the mock service, When called, Then it returns `score: 0` and `status: pending`. |
| **[ADV004]** | **As an Adviser, I want to see a Plagiarism Report summary So that I can check for originality.** | 1. Given a project with a report, When viewed, Then a badge shows the plagiarism score.<br>2. Given a pending report, When viewed, Then it shows "Processing" or "Pending". |
| **[COORD002]** | **As a Coordinator, I want to Archive completed projects So that the active list remains clean.** | 1. Given an `APPROVED_FOR_DEFENSE` project, When I click "Archive", Then status changes to `ARCHIVED`.<br>2. Given an archived project, When viewed by students, Then it is read-only. |
| **[FRONT002]** | **As a User, I want a responsive and polished UI So that the system is easy to use on all devices.** | 1. Given a mobile device, When I view the dashboard, Then the layout stacks vertically.<br>2. Given an API error, When an action fails, Then a user-friendly toast message appears.<br>3. Given a loading state, When waiting, Then skeletons or spinners are shown. |

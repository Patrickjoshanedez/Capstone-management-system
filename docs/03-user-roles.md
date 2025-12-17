# User Roles & Permissions

## Roles

### 1. Student
*   **Can**:
    *   Create a Project Proposal.
    *   Upload a proposal document so the adviser can review it.
    *   Upload documents when status is `PROPOSED` or `REVISION_REQUIRED`.
    *   View their own project details and logs.
*   **Cannot**:
    *   Approve projects.
    *   Archive projects.
    *   View other groups' projects (unless public).

### 2. Adviser
*   **Can**:
    *   View assigned projects.
    *   Download/View student submissions.
    *   Change status from `ADVISER_REVIEW` to `REVISION_REQUIRED` or `APPROVED_FOR_DEFENSE`.
    *   View Plagiarism Reports.
*   **Cannot**:
    *   Archive projects.
    *   Upload documents for the student.

### 3. Coordinator
*   **Can**:
    *   View ALL projects.
    *   Assign Advisers to projects.
    *   Change status to `ARCHIVED`.
    *   Manage system configuration.

# API Contracts

## Base URL
`/api/v1`

## System

### Health Check
*   **GET** `/health` (Note: Root level, not under `/api/v1`)
*   **Response**: `OK` (200)

## Authentication

### Login
*   **POST** `/api/v1/auth/login`
*   **Body**: 
    ```json
    { 
      "email": "student@buksu.edu.ph", 
      "password": "password123",
      "recaptchaToken": "token_from_recaptcha_checkbox"
    }
    ```
*   **Response**: 
    ```json
    { 
      "_id": "user_id",
      "name": "John Doe",
      "email": "student@buksu.edu.ph",
      "role": "student",
      "token": "jwt_token_string"
    }
    ```

*   **reCAPTCHA required**: `400`
    ```json
    {
      "message": "reCAPTCHA required"
    }
    ```

*   **reCAPTCHA verification failed**: `403`
    ```json
    {
      "message": "reCAPTCHA verification failed"
    }
    ```

### Forgot Password (Email Code)
*   **POST** `/api/v1/auth/forgot-password`
*   **Body**:
    ```json
    {
      "email": "student@buksu.edu.ph"
    }
    ```
*   **Response**:
    ```json
    {
      "message": "If an account exists for that email, a reset code will be sent."
    }
    ```

*   **Note**: If SMTP is not configured in the current environment, the API still returns `200` (anti-enumeration), but no email is sent.

*   **Rate limit**: `429`
    ```json
    {
      "message": "Too many reset requests. Please try again later."
    }
    ```

### Reset Password (Email Code)
*   **POST** `/api/v1/auth/reset-password`
*   **Body**:
    ```json
    {
      "email": "student@buksu.edu.ph",
      "code": "123456",
      "newPassword": "newStrongPassword123"
    }
    ```
*   **Response**: `200`
    ```json
    {
      "message": "Password reset successful. Please log in."
    }
    ```

*   **Invalid/expired code**: `400`
    ```json
    {
      "message": "Invalid or expired code"
    }
    ```

*   **Too many attempts**: `429`
    ```json
    {
      "message": "Too many attempts. Please try again later."
    }
    ```

### Register
*   **POST** `/api/v1/auth/register`
*   **Body**:
    ```json
    {
      "name": "John Doe",
      "email": "student@buksu.edu.ph",
      "password": "password123",
      "role": "student",
      "department": "IT",
      "recaptchaToken": "token_from_recaptcha_checkbox"
    }
    ```
*   **Response**:
    ```json
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "student@buksu.edu.ph",
      "role": "student",
      "token": "jwt_token_string"
    }
    ```

*   **reCAPTCHA required**: `400`
    ```json
    {
      "message": "reCAPTCHA required"
    }
    ```

*   **reCAPTCHA verification failed**: `403`
    ```json
    {
      "message": "reCAPTCHA verification failed"
    }
    ```

### Me
*   **GET** `/api/v1/auth/me`
*   **Auth**: Required
*   **Response**: User object (no password)

## Conventions

- Auth: send JWT as `Authorization: Bearer <token>`
- Error responses generally follow:
  - `{"message":"..."}` with appropriate HTTP status

---

## Projects

### Create Project

- Method: `POST`
- URL: `/api/v1/projects`
- Auth: Required
- Roles:
  - Student only
- Body:

```json
{
  "title": "My Capstone Project",
  "memberEmails": ["student1@buksu.edu.ph", "student2@buksu.edu.ph"],
  "adviserEmail": "adviser@buksu.edu.ph"
}
```

- Notes:
  - The authenticated student is always included as a project member.
  - `memberEmails` / `adviserEmail` must match existing users.
  - Member emails must belong to `student` users; adviser email must belong to an `adviser` user.

- Response: `201`

```json
{
  "project": {
    "_id": "...",
    "title": "My Capstone Project",
    "status": "PROPOSED"
  }
}
```

### List Projects

- Method: `GET`
- URL: `/api/v1/projects`
- Auth: Required
- Role-based scope:
  - Student: projects where the student is a member
  - Adviser: projects assigned to the adviser
  - Coordinator: all projects

- Response: `200`

```json
{
  "projects": [
    {
      "_id": "...",
      "title": "...",
      "status": "PROPOSED",
      "plagiarismReport": {
        "score": 0,
        "status": "pending_implementation",
        "reportUrl": "#"
      }
    }
  ]
}
```

### Get Project By Id

- Method: `GET`
- URL: `/api/v1/projects/:projectId`
- Auth: Required
- Access:
  - Student: must be a member
  - Adviser: must be assigned
  - Coordinator: allowed

- Response: `200`

```json
{
  "project": {
    "_id": "...",
    "title": "...",
    "status": "ADVISER_REVIEW",
    "plagiarismReport": {
      "score": 0,
      "status": "pending_implementation",
      "reportUrl": "#"
    },
    "document": {
      "fileId": "...",
      "webViewLink": "...",
      "uploadedAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Project Status

- Method: `PATCH`
- URL: `/api/v1/projects/:projectId/status`
- Auth: Required
- Body:

```json
{
  "status": "ADVISER_REVIEW"
}
```

- Allowed transitions (enforced server-side):
  - Student:
    - `PROPOSED` or `REVISION_REQUIRED` → `ADVISER_REVIEW` (requires an uploaded proposal document)
  - Adviser:
    - `ADVISER_REVIEW` → `APPROVED_FOR_DEFENSE`
    - `ADVISER_REVIEW` → `REVISION_REQUIRED`
  - Coordinator:
    - `FINAL_SUBMITTED` → `ARCHIVED`

  - Additional Adviser transition:
    - `APPROVED_FOR_DEFENSE` → `FINAL_SUBMITTED`

- Response: `200`

```json
{
  "project": {
    "_id": "...",
    "status": "APPROVED_FOR_DEFENSE"
  }
}

- Student submission without a document: `400`

```json
{
  "message": "Please upload a proposal document before submitting for adviser review"
}
```
```

### Get Workflow Logs

- Method: `GET`
- URL: `/api/v1/projects/:projectId/logs`
- Auth: Required

- Response: `200`

```json
{
  "logs": [
    {
      "_id": "...",
      "project": "...",
      "user": "...",
      "action": "STATUS_CHANGE",
      "fromStatus": "PROPOSED",
      "toStatus": "ADVISER_REVIEW",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Upload Document

- Method: `POST`
- URL: `/api/v1/projects/:projectId/upload`
- Auth: Required
- Roles:
  - Student only
- Headers:
  - `Content-Type: multipart/form-data`
- Body:
  - `file` (max 25MB)
- Rules:
  - Upload allowed only when project status is `PROPOSED` or `REVISION_REQUIRED`

- Response: `200`

```json
{
  "message": "Upload successful",
  "fileId": "google_drive_file_id",
  "webViewLink": "https://drive.google.com/file/d/...",
  "plagiarism": {
    "score": 0,
    "status": "pending_implementation",
    "reportUrl": "#"
  }
}
```

## Error Responses
*   **400 Bad Request**: `{ "message": "Validation error details" }`
*   **401 Unauthorized**: `{ "message": "Not authorized, token failed" }`
*   **403 Forbidden**: `{ "message": "Adviser cannot perform this transition" }`
*   **404 Not Found**: `{ "message": "Project not found" }`
*   **500 Server Error**: `{ "message": "Internal Server Error", "error": "..." }`

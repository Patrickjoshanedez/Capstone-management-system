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
      "password": "password123" 
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

### Register
*   **POST** `/api/v1/auth/register`
*   **Body**:
    ```json
    {
      "name": "John Doe",
      "email": "student@buksu.edu.ph",
      "password": "password123",
      "role": "student",
      "department": "IT"
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
  "adviser": "<optional adviser userId>"
}
```

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
      "status": "PROPOSED"
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
    - `PROPOSED` or `REVISION_REQUIRED` → `ADVISER_REVIEW`
  - Adviser:
    - `ADVISER_REVIEW` → `APPROVED_FOR_DEFENSE`
    - `ADVISER_REVIEW` → `REVISION_REQUIRED`
  - Coordinator:
    - `APPROVED_FOR_DEFENSE` → `ARCHIVED`

- Response: `200`

```json
{
  "project": {
    "_id": "...",
    "status": "APPROVED_FOR_DEFENSE"
  }
}
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
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Projects

### List Projects (Adviser/Coordinator)
*   **GET** `/projects`
*   **Headers**: `Authorization: Bearer <token>`
*   **Query Params**: `?status=PROPOSED` (Optional)
*   **Response**: 
    ```json
    [
      {
        "_id": "project_id",
        "title": "Capstone Title",
        "status": "PROPOSED",
        "members": [{ "name": "Student 1" }]
      }
    ]
    ```

### Get Project Details
*   **GET** `/projects/:projectId`
*   **Headers**: `Authorization: Bearer <token>`
*   **Response**: `{ "project": { ... } }`

### Create Project
*   **POST** `/projects`
*   **Headers**: `Authorization: Bearer <token>`
*   **Body**: 
    ```json
    { 
      "title": "My Capstone Project", 
      "members": ["student_id_1", "student_id_2"] 
    }
    ```
*   **Response**: `{ "project": { "status": "PROPOSED", ... } }`

### Upload Document
*   **POST** `/projects/:projectId/upload`
*   **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
*   **Body**: `file` (PDF/DOCX, Max 25MB)
*   **Response**: 
    ```json
    {
      "message": "Upload successful",
      "fileId": "google_drive_file_id",
      "webViewLink": "https://drive.google.com/file/d/...",
      "plagiarism": {
        "score": 0,
        "status": "pending_implementation"
      }
    }
    ```

### Update Status
*   **PATCH** `/projects/:projectId/status`
*   **Headers**: `Authorization: Bearer <token>`
*   **Body**: `{ "status": "APPROVED_FOR_DEFENSE" }`
*   **Response**: `{ "project": { "status": "APPROVED_FOR_DEFENSE", ... } }`

## Workflow Logs

### Get Logs
*   **GET** `/projects/:projectId/logs`
*   **Headers**: `Authorization: Bearer <token>`
*   **Response**: 
    ```json
    [ 
      { 
        "action": "STATUS_CHANGE", 
        "fromStatus": "PROPOSED", 
        "toStatus": "ADVISER_REVIEW", 
        "user": { "name": "Adviser Name" }, 
        "createdAt": "2023-10-27T10:00:00Z" 
      } 
    ]
    ```

## Error Responses
*   **400 Bad Request**: `{ "message": "Validation error details" }`
*   **401 Unauthorized**: `{ "message": "Not authorized, token failed" }`
*   **403 Forbidden**: `{ "message": "Adviser cannot perform this transition" }`
*   **404 Not Found**: `{ "message": "Project not found" }`
*   **500 Server Error**: `{ "message": "Internal Server Error", "error": "..." }`

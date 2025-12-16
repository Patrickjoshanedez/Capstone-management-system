# Setup Guide

## 1. Google Service Account
1.  Go to Google Cloud Console.
2.  Create a new Project.
3.  Enable **Google Drive API**.
4.  Create a **Service Account**.
5.  Create a JSON Key for the Service Account and download it as `credentials.json`.
6.  **IMPORTANT**: Share your target Google Drive folder with the Service Account's email address (e.g., `service-account@project-id.iam.gserviceaccount.com`) with **Editor** permissions.

## 2. Environment Variables (.env)
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/capstone?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key

# Google Drive
GOOGLE_CLIENT_EMAIL=service-account@...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_DRIVE_FOLDER_ID=your_shared_folder_id
```

## 3. Installation
1.  **Backend**:
    ```bash
    cd server
    npm install
    npm start
    ```
2.  **Frontend**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

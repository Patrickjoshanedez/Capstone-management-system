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

# Password reset (Gmail SMTP - zero cost)
# Use a Gmail App Password instead of your normal password.
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Project Workspace <yourgmail@gmail.com>"

# Optional (defaults work for Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# Optional: secret used to hash reset codes (defaults to JWT_SECRET)
RESET_CODE_SECRET=your_reset_code_secret

# Optional: email subject branding
APP_NAME=Project Workspace

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

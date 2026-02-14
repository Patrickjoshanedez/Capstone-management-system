# Google Docs Integration Guide

This document explains how to set up and use Google Docs integration in the Capstone Management System.

## Overview

The Google Docs integration allows project teams to:
- Create a collaborative Google Doc for their proposal
- Edit the proposal together in real-time
- Share the document with additional collaborators
- Sync document metadata with the system

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note down the project ID

### 2. Enable Required APIs

1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for and enable:
   - **Google Docs API**
   - **Google Drive API**

### 3. Create a Service Account

1. Go to **IAM & Admin > Service Accounts**
2. Click **Create Service Account**
3. Enter a name (e.g., "capstone-docs-service")
4. Click **Create and Continue**
5. Grant the role **Editor** (or more specific roles if needed)
6. Click **Done**

### 4. Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key > Create new key**
4. Select **JSON** format
5. Download the key file (keep it secure!)

### 5. Configure Environment Variables

Add one of the following to your `.env` file:

**Option A: JSON Key Content (recommended for production)**
```env
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"capstone-docs@your-project.iam.gserviceaccount.com",...}
```

**Option B: JSON Key File Path (easier for development)**
```env
GOOGLE_APPLICATION_CREDENTIALS=./google-service-account.json
```

### 6. (Optional) Create a Shared Drive Folder

If you want all documents organized in a specific folder:

1. Create a folder in Google Drive
2. Share the folder with the service account email (found in the JSON key as `client_email`)
3. Copy the folder ID from the URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
4. Add to `.env`:
```env
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

## Usage

### For Students

1. Open your project proposal details
2. Look for the **Google Docs Integration** section
3. Click **Create Google Doc** to create a collaborative document
4. Click **Open in Google Docs** to edit

### For Advisers

Advisers can:
- View and edit the Google Doc
- Share the document with additional reviewers
- Delete the document if needed

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/google-docs/status` | GET | Check if service is available |
| `/api/v1/projects/:id/docs/create` | POST | Create Google Doc for project |
| `/api/v1/projects/:id/docs` | GET | Get document info |
| `/api/v1/projects/:id/docs/sync` | POST | Sync document content |
| `/api/v1/projects/:id/docs/share` | POST | Share with additional user |
| `/api/v1/projects/:id/docs` | DELETE | Delete the document |

## Document Template

When a Google Doc is created, it automatically includes:

1. **Title** - Project title
2. **Section Headers**:
   - Background of the Study
   - Problem Statement
   - Objectives (General & Specific)
   - Scope and Delimitations
   - Methodology
   - System Architecture
   - Feasibility

## Troubleshooting

### "Google Docs is not configured"

This means the service account credentials are not set up. Follow the setup instructions above.

### "Failed to create Google Doc"

Check that:
1. The API is enabled in Google Cloud Console
2. The service account credentials are valid
3. The JSON key has not expired

### "Could not share with email"

The email address might be invalid or the person might need to accept an invite first.

### "Document synced but no content"

The sync feature currently retrieves raw text content. Section parsing is a future enhancement.

## Security Notes

1. **Never commit** the service account JSON key to version control
2. Use environment variables for sensitive data
3. The service account has access to all documents it creates
4. Consider using a dedicated Google Workspace for production

## Future Enhancements

- [ ] Automatic section parsing from Google Doc content
- [ ] Real-time collaboration status indicators
- [ ] Comments sync between Google Docs and system
- [ ] Document version history
- [ ] PDF export from Google Docs

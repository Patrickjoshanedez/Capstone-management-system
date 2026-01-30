# Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide walks you through deploying your Capstone Management System with:
- **Frontend (React/Vite)** → Vercel (Free Tier)
- **Backend (Node.js/Express)** → Render (Free Tier)
- **Database (MongoDB)** → MongoDB Atlas (Free M0 Cluster)

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Backend Deployment on Render](#3-backend-deployment-on-render)
4. [Frontend Deployment on Vercel](#4-frontend-deployment-on-vercel)
5. [Post-Deployment Configuration](#5-post-deployment-configuration)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with your code pushed to a repository
- [ ] MongoDB Atlas account (free)
- [ ] Render account (free)
- [ ] Vercel account (free)
- [ ] Google Cloud Console project (for Google Drive API)
- [ ] All environment variables documented

### Required Environment Variables

**Backend (.env):**
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/capstone_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Google Drive API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_password

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Frontend URL (for CORS)
CLIENT_URL=https://your-app.vercel.app
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

---

## 2. MongoDB Atlas Setup

### Step 2.1: Create a Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Build a Database"**
4. Select **M0 FREE** tier
5. Choose a cloud provider (AWS recommended) and region closest to your users
6. Name your cluster (e.g., `capstone-cluster`)
7. Click **"Create"**

### Step 2.2: Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Enter username and a strong password (save these!)
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 2.3: Configure Network Access

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is necessary for Render's dynamic IPs
4. Click **"Confirm"**

### Step 2.4: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name: `mongodb+srv://...mongodb.net/capstone_db?retryWrites=true&w=majority`

---

## 3. Backend Deployment on Render

### Step 3.1: Prepare Your Backend

1. Ensure your `server/package.json` has the correct start script:
   ```json
   {
     "scripts": {
       "start": "node index.js"
     }
   }
   ```

2. Update `server/index.js` CORS configuration for production:

   ```javascript
   // Update CORS configuration
   const corsOptions = {
     origin: process.env.CLIENT_URL || 'http://localhost:5173',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
   };
   app.use(cors(corsOptions));
   ```

3. Push changes to GitHub

### Step 3.2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository
5. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `capstone-backend` |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` (or your default branch) |
   | **Root Directory** | `server` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |
   fr

6. Click **"Advanced"** and add environment variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A long random string (use a generator) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://your-app.vercel.app` (update after Vercel deploy) |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Your service account email |
   | `GOOGLE_PRIVATE_KEY` | Your private key (paste entire key including `-----BEGIN...`) |
   | `GOOGLE_DRIVE_FOLDER_ID` | Your Drive folder ID |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_USER` | Your email |
   | `EMAIL_PASS` | Your app password |
   | `RECAPTCHA_SECRET_KEY` | Your reCAPTCHA secret |

7. Click **"Create Web Service"**

### Step 3.3: Wait for Deployment

- Render will build and deploy your backend
- This takes 5-10 minutes on the free tier
- Once deployed, you'll get a URL like: `https://capstone-backend.onrender.com`
- **Save this URL!** You'll need it for the frontend

### Step 3.4: Verify Backend is Running

Visit these URLs in your browser:
- `https://your-backend.onrender.com/health` → Should return "OK"
- `https://your-backend.onrender.com/api/v1` → Should return API info or 404

---

## 4. Frontend Deployment on Vercel

### Step 4.1: Prepare Your Frontend

1. Create `client/vercel.json` for SPA routing:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ]
   }
   ```

2. Update `client/src/services/api.js` to use environment variable:
   ```javascript
   import axios from 'axios';

   const api = axios.create({
       baseURL: import.meta.env.VITE_API_URL || '/api/v1',
   });
   ```

3. Create `client/.env.production`:
   ```env
   VITE_API_URL=https://your-backend.onrender.com/api/v1
   VITE_RECAPTCHA_SITE_KEY=your_site_key
   ```

4. Push changes to GitHub

### Step 4.2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Project Name** | `capstone-frontend` |
   | **Framework Preset** | `Vite` |
   | **Root Directory** | `client` |
   | **Build Command** | `npm run build` (or leave default) |
   | **Output Directory** | `dist` (or leave default) |
   | **Install Command** | `npm install` (or leave default) |

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add:
     | Key | Value |
     |-----|-------|
     | `VITE_API_URL` | `https://your-backend.onrender.com/api/v1` |
     | `VITE_RECAPTCHA_SITE_KEY` | Your reCAPTCHA site key |

6. Click **"Deploy"**

### Step 4.3: Wait for Deployment

- Vercel builds and deploys in 1-3 minutes
- You'll get a URL like: `https://capstone-frontend.vercel.app`

---

## 5. Post-Deployment Configuration

### Step 5.1: Update CORS on Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to **"Environment"**
4. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://capstone-frontend.vercel.app
   ```
5. Click **"Save Changes"** - Render will automatically redeploy

### Step 5.2: Update reCAPTCHA Domains

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Select your site key
3. Add your domains:
   - `capstone-frontend.vercel.app`
   - `your-custom-domain.com` (if applicable)

### Step 5.3: Update Google Drive API

If using Google Drive:
1. Go to Google Cloud Console
2. Navigate to **APIs & Services** → **Credentials**
3. Ensure your service account has access to the Drive folder

### Step 5.4: Seed Initial Data (Optional)

If you need to seed initial data:

```bash
# Temporarily set environment variables locally
export MONGO_URI="your_atlas_connection_string"

# Run seed script
cd server
node seed.js
```

---

## 6. Troubleshooting

### Common Issues

#### Backend shows "Application Error"
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set correctly
- Check MongoDB connection string format

#### CORS Errors
- Ensure `CLIENT_URL` in Render matches your Vercel URL exactly
- Include protocol: `https://your-app.vercel.app` (not just `your-app.vercel.app`)

#### MongoDB Connection Fails
- Verify Network Access allows `0.0.0.0/0`
- Check username/password in connection string
- Ensure connection string has database name

#### Frontend API Calls Fail
- Check browser DevTools Network tab
- Verify `VITE_API_URL` is correct
- Ensure backend is running (check `/health` endpoint)

#### Render Free Tier Spin-Down
- Free tier services "spin down" after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Solution: Use a keep-alive service like [UptimeRobot](https://uptimerobot.com/) to ping `/health` every 14 minutes

### Checking Logs

**Render (Backend):**
1. Dashboard → Select Service → Logs
2. View real-time or historical logs

**Vercel (Frontend):**
1. Dashboard → Select Project → Deployments
2. Click on a deployment → Functions/Logs

---

## Quick Reference

| Service | URL Pattern | Dashboard |
|---------|-------------|-----------|
| MongoDB Atlas | `mongodb+srv://...` | [cloud.mongodb.com](https://cloud.mongodb.com) |
| Render | `https://xxx.onrender.com` | [dashboard.render.com](https://dashboard.render.com) |
| Vercel | `https://xxx.vercel.app` | [vercel.com/dashboard](https://vercel.com/dashboard) |

---

## Estimated Costs (Free Tier Limits)

| Service | Free Tier Limits |
|---------|------------------|
| **MongoDB Atlas M0** | 512 MB storage, shared RAM |
| **Render Free** | 750 hours/month, spins down after 15min inactive |
| **Vercel Free** | 100 GB bandwidth, 100 deployments/day |

All services are **zero-cost** within these limits for typical academic projects.

---

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)

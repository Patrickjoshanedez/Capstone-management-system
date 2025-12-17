# Password Reset (Email Code)

This feature allows any user to request a one-time reset code via email and set a new password.

## Flow

1. User clicks **Forgot password?** on the login page.
2. User submits their email:
   - API: `POST /api/v1/auth/forgot-password`
   - Response is always generic to prevent account enumeration.
3. If an account exists and email is configured, the server emails a 6-digit code.
4. User enters **code + new password**:
   - API: `POST /api/v1/auth/reset-password`

## Security notes

- Reset codes are **never stored in plaintext**.
- The server stores a **hash** of the code and an **expiry timestamp** on the user document.
- Codes expire after **15 minutes**.
- The system rate-limits reset requests and verification attempts (`429`) to reduce abuse.
- An audit trail is recorded without storing the reset code.

## Configuration (.env)

In `server/.env`:

```env
# Password reset (Gmail SMTP - zero cost)
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
```

If `SMTP_USER` / `SMTP_PASS` are missing, the server still returns `200` for reset requests (anti-enumeration), but no email is sent.

## Key implementation files

- Backend controller: [server/controllers/authController.js](server/controllers/authController.js)
- User reset fields: [server/models/User.js](server/models/User.js)
- Audit log model: [server/models/AuthLog.js](server/models/AuthLog.js)
- Frontend UI: [client/src/pages/Login.jsx](client/src/pages/Login.jsx)

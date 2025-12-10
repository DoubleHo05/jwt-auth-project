# React Authentication with JWT (Access + Refresh)

A React application demonstrating secure authentication using JWT access tokens (short-lived) and refresh tokens (long-lived).

## 🔗 Live Demo
**Public URL:** https://jwt-auth-demo-nu.vercel.app/

## 🧪 Test Credentials
- **Email:** `user@test.com`
- **Password:** `password123`

## 🚀 Features
- **Login/Logout:** Secure authentication flow.
- **Silent Refresh:** Axios interceptors automatically refresh expired access tokens (set to 15s for demonstration).
- **Protected Routes:** Dashboard is inaccessible without a valid session.
- **Validation:** React Hook Form handles input validation.

## 🛠️ How to Run Locally
1. **Server:**
   ```bash
   cd server
   npm install
   node index.js

2. **Client:**
   ```bash
   cd client
   npm install
   npm run dev
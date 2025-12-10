# React Authentication with JWT (Access + Refresh)

A full-stack React application demonstrating secure authentication using **JWT Access Tokens** (short-lived) and **Refresh Tokens** (long-lived). This project implements a complete authentication flow including login, silent token refresh via Axios interceptors, protected routes, and logout.

## 🚀 Live Demo
**Public URL:** https://jwt-auth-demo-nu.vercel.app

### 🧪 Test Credentials
Use these credentials to test the login functionality:
- **Email:** `user@test.com`
- **Password:** `password123`

---

## 🛠️ Features
- **Secure Authentication:** JWT-based login with Access & Refresh tokens.
- **Silent Refresh:** Automatic token refreshing using Axios interceptors when the access token expires (configured to 15s for demonstration).
- **State Management:** Uses **React Query** for managing user session and server state.
- **Form Handling:** Uses **React Hook Form** for robust form validation and error handling.
- **Protected Routes:** Restricts access to the Dashboard for unauthenticated users.
- **Error Handling:** User-friendly error messages for invalid credentials and network issues.

---

## 💻 Tech Stack
- **Frontend:** React (Vite), Axios, TanStack Query (React Query), React Hook Form, React Router DOM.
- **Backend:** Node.js, Express, JSON Web Token (jsonwebtoken), CORS.

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/DoubleHo05/jwt-auth-project.git
cd jwt-auth-project
```
### 2. Set up the Backend (server)
The backend mimics a real authentication server.
```bash
cd server
npm install

# Start the server (Runs on port 5000)
node index.js
```

### 3. Setup the Frontend (Client)
```bash
cd client
npm install

# Start the React development server
npm run dev
```

### 4. Configuration for local test
If you are running strictly locally, ensure client/src/api/axios.js points to your local server.

Open client/src/api/axios.js and check the BASE_URL:
```javascript
// For local development:
const BASE_URL = 'http://localhost:5000';

// For production (Render/Vercel):
// const BASE_URL = '[https://your-api.onrender.com](https://your-api.onrender.com)';
```

## 🧪 How to Test the Refresh Token Flow

### 1. Login to the app using the test credentials.

### 2. Open your browser's Developer Tools (F12) and go to the Network tab.

### 3. Wait for 15 seconds (the access token expiry time set in the server).

### 4. Refresh the page or navigate around.

### 5. You will observe in the Network tab:

        A failed request (401 Unauthorized).

        An immediate call to /refresh (200 OK).

        A retry of the original request (200 OK).

        The user session remains active without logging out.

## 📂 Project Structure

    ├── client/                 # React Frontend
    │   ├── src/
    │   │   ├── api/            # Axios setup & interceptors
    │   │   ├── components/     # ProtectedRoute & UI components
    │   │   ├── hooks/          # Custom useAuth hook (React Query)
    │   │   └── pages/          # Login & Dashboard pages
    │   └── vercel.json         # Vercel routing configuration
    │
    └── server/                 # Node.js Mock Backend
        └── index.js            # Auth endpoints (login, refresh, logout)
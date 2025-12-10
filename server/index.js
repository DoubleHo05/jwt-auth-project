const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// 1. MIDDLEWARE
app.use(express.json());

// CORS CONFIGURATION (Crucial for Vercel + Render)
// We use origin: '*' to allow Vercel to connect without issues.
// We REMOVED 'credentials: true' to prevent browser blocking.
app.use(cors({
  origin: '*'
}));

// 2. MOCK DATABASE
const users = [{ id: 1, email: 'user@test.com', password: 'password123', name: 'Test User' }];

// 3. SECRETS (In a real app, use .env files)
const ACCESS_SECRET = 'access_secret_123';
const REFRESH_SECRET = 'refresh_secret_123';

// 4. HELPER FUNCTIONS
const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, name: user.name }, ACCESS_SECRET, { expiresIn: '15s' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, name: user.name }, REFRESH_SECRET, { expiresIn: '7d' });
};

// --- ROUTES ---

// ROOT ROUTE (Fixes "Cannot GET /" on Render)
app.get('/', (req, res) => {
  res.send("API is running... Use the Client App to login.");
});

// LOGIN ROUTE
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return res.status(400).json("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({ accessToken, refreshToken });
});

// REFRESH ROUTE (STATELESS FIX)
app.post('/refresh', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json("You are not authenticated");

  // FIX: We verify the signature ONLY. We do NOT check a server-side array.
  // This ensures that even if Render restarts, valid tokens are still accepted.
  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json("Token is not valid");
    
    // Token is valid! Issue new ones.
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });
});

// LOGOUT ROUTE
app.post('/logout', (req, res) => {
  // Stateless logout is handled by the client deleting the token.
  res.json("Logged out successfully");
});

// PROTECTED DATA ROUTE
app.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, ACCESS_SECRET, (err, user) => {
      if (err) return res.status(403).json("Token is not valid");
      res.json(user);
    });
  } else {
    res.status(401).json("You are not authenticated");
  }
});

// START SERVER
app.listen(5000, () => console.log("Server running on port 5000"));
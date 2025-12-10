const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Allow CORS for any origin (Standard for public deployment tests)
app.use(cors({
  origin: '*', 
  // credentials: true 
}));

// Mock Database
const users = [{ id: 1, email: 'user@test.com', password: 'password123', name: 'Test User' }];

// Keys
const ACCESS_SECRET = 'access_secret_123';
const REFRESH_SECRET = 'refresh_secret_123';

// Generate Tokens
const generateAccessToken = (user) => jwt.sign({ id: user.id, name: user.name }, ACCESS_SECRET, { expiresIn: '15s' }); // Short-lived for testing
const generateRefreshToken = (user) => jwt.sign({ id: user.id, name: user.name }, REFRESH_SECRET, { expiresIn: '7d' });

// --- ROUTES ---

// 0. HEALTH CHECK (Fixes "Cannot GET /" on Render)
app.get('/', (req, res) => {
  res.send("API is running... Access the frontend to log in.");
});

// 1. LOGIN ROUTE
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return res.status(400).json("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Note: In a real DB app, we would save refreshToken here. 
  // For this mock server, we send it stateless to avoid "Server Restart" bugs.
  
  res.json({ accessToken, refreshToken });
});

// 2. REFRESH ROUTE (Stateless Fix)
app.post('/refresh', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json("You are not authenticated");

  // Verify the token's signature directly
  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json("Token is not valid");
    
    // If valid, issue a new set of tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });
});

// 3. LOGOUT ROUTE
app.post('/logout', (req, res) => {
  // In a stateless JWT setup, logout is handled primarily by the client 
  // deleting the token. The server just confirms the request.
  res.json("Logged out successfully");
});

// 4. PROTECTED DATA ROUTE
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

app.listen(5000, () => console.log("Server running on port 5000"));
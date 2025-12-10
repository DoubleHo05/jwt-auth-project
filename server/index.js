const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
// Allow CORS for our React app
// Allow any origin to connect (simplest for deployment)
app.use(cors({
  origin: '*', 
  credentials: true 
}));

// Mock Database
const users = [{ id: 1, email: 'user@test.com', password: 'password123', name: 'Test User' }];
let refreshTokens = []; // In a real app, store this in a DB

// Keys
const ACCESS_SECRET = 'access_secret_123';
const REFRESH_SECRET = 'refresh_secret_123';

// Generate Tokens
const generateAccessToken = (user) => jwt.sign({ id: user.id, name: user.name }, ACCESS_SECRET, { expiresIn: '15s' }); // Expires in 15s for testing!
const generateRefreshToken = (user) => jwt.sign({ id: user.id, name: user.name }, REFRESH_SECRET, { expiresIn: '7d' });

// 1. LOGIN ROUTE
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return res.status(400).json("Invalid credentials");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.push(refreshToken);

  res.json({ accessToken, refreshToken });
});

// 2. REFRESH ROUTE
app.post('/refresh', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json("You are not authenticated");
  if (!refreshTokens.includes(token)) return res.status(403).json("Refresh token is not valid");

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) console.log(err);
    refreshTokens = refreshTokens.filter((t) => t !== token); // Rotate token (optional security step)
    
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    refreshTokens.push(newRefreshToken);
    
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });
});

// 3. LOGOUT ROUTE
app.post('/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
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
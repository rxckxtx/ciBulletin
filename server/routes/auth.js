const express = require('express');
const router = express.Router();
const { loginUser, registerUser, refreshToken } = require('../controllers/userController');

// Login route
router.post('/login', loginUser);
// Register route
router.post('/register', registerUser);
// Route to refresh token
router.post('/refresh-token', refreshToken);

module.exports = router;
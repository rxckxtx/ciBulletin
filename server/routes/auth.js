const express = require('express');
const router = express.Router();
const { loginUser, registerUser, refreshToken, logoutUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validateLogin, validateRegistration } = require('../middleware/validation');

// Login route with validation
router.post('/login', validateLogin, loginUser);
// Register route with validation
router.post('/register', validateRegistration, registerUser);
// Route to refresh token
router.post('/refresh-token', refreshToken);
// Logout route
router.post('/logout', logoutUser);

module.exports = router;
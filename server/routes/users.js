const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Registration and login routes have been moved to auth.js
// This prevents duplicate routes and ensures validation middleware is used
router.get('/profile', auth, getUserProfile); // Protected route

module.exports = router;

//JWT Auth Route

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const User = require('../models/User');

// TEMP TEST ROUTE — for initial testing only
router.get('/test', async (req, res) => {
    try {
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@ci.edu',
        password: 'password123'
      });
      res.json(testUser);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', auth, getUserProfile);

module.exports = router;

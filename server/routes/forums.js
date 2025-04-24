const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET all forums
router.get('/', forumController.getForums);

// GET forum by ID
router.get('/:id', forumController.getForumById);

// POST create new forum (allow all authenticated users)
router.post('/', [auth, admin], forumController.createForum);

// PUT update forum (admin only)
router.put('/:id', [auth, admin], forumController.updateForum);

// DELETE forum (admin only)
router.delete('/:id', [auth, admin], forumController.deleteForum);

module.exports = router;
const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// GET topics by forum ID
router.get('/forum/:forumId', topicController.getTopicsByForum);

// GET topic by ID
router.get('/:id', topicController.getTopicById);

// POST create new topic
router.post('/', auth, topicController.createTopic);

// PUT update topic
router.put('/:id', auth, topicController.updateTopic);

// DELETE topic
router.delete('/:id', auth, topicController.deleteTopic);

// PATCH pin/unpin topic (admin only)
router.patch('/:id/pin', [auth, admin], topicController.togglePinTopic);

// PATCH lock/unlock topic (admin only)
router.patch('/:id/lock', [auth, admin], topicController.toggleLockTopic);

module.exports = router;
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middleware/auth');

// GET all threads or filter by category
router.get('/', (req, res, next) => {
  console.log('Forum route: GET / called');
  console.log('Query params:', req.query);
  next();
}, forumController.getAllThreads);

// GET thread by ID
router.get('/:id', forumController.getThreadById);

// POST create new thread
router.post('/', auth, forumController.createThread);

// POST add post to thread
router.post('/:id/posts', auth, forumController.addPost);

// DELETE thread
router.delete('/:id', auth, forumController.deleteThread);

// DELETE post from thread
router.delete('/:id/posts/:postId', auth, forumController.deletePost);

module.exports = router;
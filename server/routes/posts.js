const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// GET posts by topic ID
router.get('/topic/:topicId', postController.getPostsByTopic);

// POST create new post
router.post('/', auth, postController.createPost);

// PUT update post
router.put('/:id', auth, postController.updatePost);

// DELETE post
router.delete('/:id', auth, postController.deletePost);

// PATCH like/unlike post
router.patch('/:id/like', auth, postController.toggleLikePost);

module.exports = router;
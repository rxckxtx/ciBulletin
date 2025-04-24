const Post = require('../models/Post');
const Topic = require('../models/Topic');

// Get posts by topic ID
exports.getPostsByTopic = async (req, res) => {
  try {
    const posts = await Post.find({ topic: req.params.topicId })
      .sort({ createdAt: 1 })
      .populate('user', 'name avatar');
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new post (reply)
exports.createPost = async (req, res) => {
  try {
    const { content, topicId } = req.body;
    
    // Check if topic exists and is not locked
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    if (topic.isLocked) {
      return res.status(403).json({ message: 'This topic is locked and cannot receive new replies' });
    }
    
    const newPost = new Post({
      content,
      topic: topicId,
      user: req.user.id
    });
    
    const savedPost = await newPost.save();
    
    // Update topic's lastActivity timestamp
    topic.lastActivity = Date.now();
    await topic.save();
    
    // Populate user info before sending response
    await savedPost.populate('user', 'name avatar');
    
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the post creator or an admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        content: req.body.content,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('user', 'name avatar');
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the post creator or an admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like/unlike post
exports.toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user has already liked the post
    const likeIndex = post.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      // Add like
      post.likes.push(req.user.id);
    } else {
      // Remove like
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
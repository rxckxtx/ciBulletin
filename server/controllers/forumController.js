const Thread = require('../models/Thread');
const User = require('../models/User');
const Forum = require('../models/Forum');
const Topic = require('../models/Topic');

// Get all threads or filter by category
exports.getAllThreads = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const threads = await Thread.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .select('-posts');
    
    res.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get thread by ID
exports.getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('posts.user', 'username avatar');
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Increment view count
    thread.views += 1;
    await thread.save();
    
    res.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new thread
exports.createThread = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    // Debug: Check if req.user exists
    if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
    const newThread = new Thread({
      title,
      content,
      category,
      user: req.user.id,
      posts: []
    });
    
    const savedThread = await newThread.save();
    
    // Populate user info before sending response
    await savedThread.populate('user', 'username avatar');
    
    res.status(201).json(savedThread);
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add post to thread
exports.addPost = async (req, res) => {
  try {
    const { content } = req.body;
    
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    const newPost = {
      content,
      user: req.user.id
    };
    
    thread.posts.push(newPost);
    
    const updatedThread = await thread.save();
    
    // Populate user info before sending response
    await updatedThread.populate('user', 'username avatar');
    await updatedThread.populate('posts.user', 'username avatar');
    
    res.json(updatedThread);
  } catch (error) {
    console.error('Error adding post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete thread
exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Check if user is the thread creator or an admin
    if (thread.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this thread' });
    }
    
    await Thread.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Error deleting thread:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete post from thread
exports.deletePost = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }
    
    // Find the post
    const post = thread.posts.id(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user is the post creator or an admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }
    
    // Remove the post
    post.remove();
    
    const updatedThread = await thread.save();
    
    // Populate user info before sending response
    await updatedThread.populate('user', 'username avatar');
    await updatedThread.populate('posts.user', 'username avatar');
    
    res.json(updatedThread);
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all forums
exports.getForums = async (req, res) => {
  try {
    const forums = await Forum.find().sort({ category: 1, name: 1 });
    res.json(forums);
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get forum by ID
exports.getForumById = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }
    
    res.json(forum);
  } catch (error) {
    console.error('Error fetching forum:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new forum (admin only)
exports.createForum = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    // Check if forum already exists
    const existingForum = await Forum.findOne({ name });
    if (existingForum) {
      return res.status(400).json({ message: 'Forum with this name already exists' });
    }
    
    const newForum = new Forum({
      name,
      description,
      category
    });
    
    const savedForum = await newForum.save();
    res.status(201).json(savedForum);
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update forum (admin only)
exports.updateForum = async (req, res) => {
  try {
    const forum = await Forum.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }
    
    res.json(forum);
  } catch (error) {
    console.error('Error updating forum:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete forum (admin only)
exports.deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);
    
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }
    
    // Delete all topics in this forum
    await Topic.deleteMany({ forum: req.params.id });
    
    // Delete the forum
    await Forum.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Forum deleted successfully' });
  } catch (error) {
    console.error('Error deleting forum:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
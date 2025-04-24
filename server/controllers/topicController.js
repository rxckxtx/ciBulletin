const Topic = require('../models/Topic');
const Post = require('../models/Post');
const Forum = require('../models/Forum');

// Get topics by forum ID
exports.getTopicsByForum = async (req, res) => {
  try {
    const topics = await Topic.find({ forum: req.params.forumId })
      .sort({ isPinned: -1, lastActivity: -1 })
      .populate('user', 'name avatar')
      .populate('forum', 'name');
    
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('forum', 'name');
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Increment view count
    topic.views += 1;
    await topic.save();
    
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new topic
exports.createTopic = async (req, res) => {
  try {
    const { title, content, forumId } = req.body;
    
    // Check if forum exists
    const forum = await Forum.findById(forumId);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }
    
    const newTopic = new Topic({
      title,
      content,
      forum: forumId,
      user: req.user.id
    });
    
    const savedTopic = await newTopic.save();
    
    // Create first post in the topic
    const firstPost = new Post({
      content,
      topic: savedTopic._id,
      user: req.user.id
    });
    
    await firstPost.save();
    
    res.status(201).json(savedTopic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update topic
exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Check if user is the topic creator or an admin
    if (topic.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this topic' });
    }
    
    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActivity: Date.now() },
      { new: true }
    );
    
    res.json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete topic
exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Check if user is the topic creator or an admin
    if (topic.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this topic' });
    }
    
    // Delete all posts in this topic
    await Post.deleteMany({ topic: req.params.id });
    
    // Delete the topic
    await Topic.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Pin/unpin topic (admin only)
exports.togglePinTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    topic.isPinned = !topic.isPinned;
    await topic.save();
    
    res.json({ isPinned: topic.isPinned });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Lock/unlock topic (admin only)
exports.toggleLockTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    topic.isLocked = !topic.isLocked;
    await topic.save();
    
    res.json({ isLocked: topic.isLocked });
  } catch (error) {
    console.error('Error toggling lock status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const Thread = require('../models/Thread');
const User = require('../models/User');
const Forum = require('../models/Forum');
const Topic = require('../models/Topic');
const { handleError, createError } = require('../utils/errorHandler');

// Get all threads or filter by category
exports.getAllThreads = async (req, res) => {
  try {
    console.log('getAllThreads called with query:', req.query);
    const { category } = req.query;
    const filter = category ? { category } : {};

    console.log('Applying filter:', filter);

    // Check if Thread model exists
    if (!Thread) {
      console.error('Thread model is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // First get threads without posts content to save bandwidth
    let threads = await Thread.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar')
      .lean() // Use lean() for better performance
      .exec(); // Use exec() to get a true promise

    // Add username field for backward compatibility
    threads = threads.map(thread => {
      if (thread.user && thread.user.name) {
        thread.user.username = thread.user.name;
      }
      return thread;
    });

    console.log(`Found ${threads.length} threads`);

    // Transform the threads to include post count but exclude post content
    threads = threads.map(thread => {
      // Add post count
      thread.postCount = thread.posts ? thread.posts.length : 0;
      // Remove the posts array to save bandwidth
      delete thread.posts;
      return thread;
    });

    // Send the response without cache headers
    res.json(threads);
  } catch (error) {
    // Use centralized error handler
    return handleError(error, res, 'getAllThreads');
  }
};

// Get thread by ID
exports.getThreadById = async (req, res) => {
  try {
    console.log('getThreadById called with params:', req.params);

    // Check if ID is valid
    if (!req.params.id || req.params.id === 'undefined') {
      console.log('Invalid thread ID provided');
      return res.status(400).json({ message: 'Invalid thread ID' });
    }

    console.log('Looking for thread with ID:', req.params.id);
    const thread = await Thread.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('posts.user', 'name avatar');

    if (!thread) {
      console.log('Thread not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Thread not found' });
    }

    console.log('Thread found:', thread.title);

    // Debug log to see what user data is being populated
    console.log('Thread user data:', thread.user);

    // Add username field for backward compatibility
    if (thread.user && thread.user.name) {
      thread.user.username = thread.user.name;
    }

    // Also add username to post users
    if (thread.posts && thread.posts.length > 0) {
      thread.posts.forEach(post => {
        if (post.user && post.user.name) {
          post.user.username = post.user.name;
        }
      });
    }

    // We're no longer using the x-refresh-request header to avoid CORS issues
    // Instead, we'll increment the view count for all requests
    // This might lead to slightly inflated view counts, but it's better than CORS errors
    console.log('Incrementing view count for thread:', thread._id);
    thread.views += 1;
    await thread.save();

    res.json(thread);
  } catch (error) {
    // Use centralized error handler
    return handleError(error, res, 'getThreadById');
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
    await savedThread.populate('user', 'name avatar');

    res.status(201).json(savedThread);
  } catch (error) {
    return handleError(error, res, 'createThread');
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
    await updatedThread.populate('user', 'name avatar');
    await updatedThread.populate('posts.user', 'name avatar');

    res.json(updatedThread);
  } catch (error) {
    return handleError(error, res, 'addPost');
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
    return handleError(error, res, 'deleteThread');
  }
};

// Delete post from thread
exports.deletePost = async (req, res) => {
  try {
    // First find the thread to check permissions
    const thread = await Thread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Find the post to check ownership
    const post = thread.posts.find(post => post._id.toString() === req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the post creator or an admin
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Now remove the post using the $pull operator
    const updatedThread = await Thread.findByIdAndUpdate(
      req.params.id,
      { $pull: { posts: { _id: post._id } } },
      { new: true } // Return the updated document
    );

    // Populate user info before sending response
    await updatedThread.populate('user', 'name avatar');
    await updatedThread.populate('posts.user', 'name avatar');

    res.json(updatedThread);
  } catch (error) {
    return handleError(error, res, 'deletePost');
  }
};

// Get all forums
exports.getForums = async (_req, res) => {
  try {
    const forums = await Forum.find().sort({ category: 1, name: 1 });
    res.json(forums);
  } catch (error) {
    return handleError(error, res, 'getForums');
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
    return handleError(error, res, 'getForumById');
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
    return handleError(error, res, 'createForum');
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
    return handleError(error, res, 'updateForum');
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
    return handleError(error, res, 'deleteForum');
  }
};
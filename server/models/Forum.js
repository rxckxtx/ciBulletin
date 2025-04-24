const mongoose = require('mongoose');

// Forum Schema
const ForumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'clubs', 'events', 'announcements'],
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Post Schema
const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Thread Schema
const ThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'academic', 'clubs', 'events', 'questions'],
    default: 'general'
  },
  posts: [PostSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp when a new post is added
ThreadSchema.pre('save', function(next) {
  if (this.isModified('posts')) {
    this.updatedAt = Date.now();
  }
  next();
});

// Export both models
const Forum = mongoose.models.Forum || mongoose.model('Forum', ForumSchema);
const Thread = mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);

module.exports = { Forum, Thread };
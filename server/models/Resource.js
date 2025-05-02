const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'word', 'powerpoint', 'excel', 'text', 'image'],
    default: 'other'
  },
  category: {
    type: String,
    enum: ['academic', 'club', 'event', 'general', 'administrative'],
    default: 'general'
  },
  tags: [{
    type: String
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp when the resource is modified
ResourceSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('downloads')) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Resource', ResourceSchema);
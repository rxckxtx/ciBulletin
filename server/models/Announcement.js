const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['event', 'club', 'academic', 'sports', 'urgent'],
    required: true
  },
  theme: {
    type: String,
    enum: ['asi', 'stem', 'arts', 'business', 'cs'],
    required: false
  },
  location: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    required: false
  },
  group: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  size: {
    width: {
      type: Number,
      default: 1
    },
    height: {
      type: Number,
      default: 1
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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

module.exports = mongoose.model('Announcement', AnnouncementSchema);
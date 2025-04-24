const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  group: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['event', 'club', 'academic', 'sports'],
    default: 'event'
  },
  theme: {
    type: String,
    enum: ['asi', 'stem', 'arts', 'business', 'cs'],
    default: 'asi'
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
  image: {
    type: String,
    default: null
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

module.exports = mongoose.model('Event', EventSchema);
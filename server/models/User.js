const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
    // will be hashed using bcrypt
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'moderator'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }, 
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(recordPassword) {
  return await bcrypt.compare(recordPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
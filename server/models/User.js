const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Pre-save hook to ensure name is never null
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username is required'],
    // Improved setter function to handle all cases properly
    set: function(v) {
      // If value is null, undefined, or not a string, reject it
      if (!v || typeof v !== 'string') {
        throw new Error('Username must be a non-empty string');
      }
      // Trim the username and check if it's empty
      const trimmed = v.trim();
      if (trimmed === '') {
        throw new Error('Username cannot be empty');
      }
      return trimmed;
    },
    validate: {
      validator: function(v) {
        return v !== null && v !== undefined && v.trim().length > 0;
      },
      message: () => 'Username cannot be empty'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return v !== null && v !== undefined && v.trim().length > 0;
      },
      message: () => 'Email cannot be empty'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// We've removed the pre-validate and pre-save hooks that were generating random usernames
// The validation in the schema should be sufficient to ensure usernames are valid

// Create a custom index for the name field that only applies to non-null values
// This is a sparse index that will ignore null values
UserSchema.index({ name: 1 }, {
  unique: true,
  sparse: true, // This makes the index ignore null values
  background: true,
  name: 'unique_name_index'
});

// Create a model from the schema
const User = mongoose.model('User', UserSchema);

// Export the model
module.exports = User;
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { handleError, createError } = require('../utils/errorHandler');

const registerUser = async (req, res) => {
  try {
    // By this point, the validation middleware should have already:
    // 1. Mapped username to name if needed
    // 2. Validated that name exists and is properly formatted
    // 3. Validated email and password
    const { name, email, password } = req.body;

    // Double-check required fields with more detailed checks
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Valid username is required' });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Trim inputs to prevent whitespace issues
    const trimmedUsername = name.trim();
    const trimmedEmail = email.trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check if username is already taken
    const existingUsername = await User.findOne({ name: trimmedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Final validation check for username
    if (trimmedUsername === '') {
      return res.status(400).json({ message: 'Username cannot be empty' });
    }

    const newUser = new User({
      name: trimmedUsername, // Store the username in the name field
      email: trimmedEmail,
      password: hashedPassword,
    });

    // Save the user
    await newUser.save();

    // Generate JWT token immediately on registration with role included
    const token = jwt.sign(
      { user: { id: newUser._id, username: newUser.name, role: newUser.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/' // Ensure cookie is available on all paths
    });

    res.status(201).json({
      _id: newUser._id,
      username: newUser.name, // Return name as username for client consistency
      email: newUser.email,
      role: newUser.role,
      isAuthenticated: true
    });
  } catch (err) {
    // Handle MongoDB duplicate key errors specifically
    if (err.name === 'MongoServerError' && err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      return res.status(400).json({
        message: `${field} '${value}' is already taken. Please choose another.`
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    // Use the general error handler for other errors
    return handleError(err, res, 'registerUser');
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with user role included
    const token = jwt.sign(
      { user: { id: user._id, username: user.name, role: user.role } }, // Include user object with id, name, and role
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set token as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/' // Ensure cookie is available on all paths
    });

    // Return user data without the token
    res.json({
      _id: user._id,
      username: user.name, // Return name as username for client consistency
      email: user.email,
      role: user.role,
      isAuthenticated: true
    });
  } catch (err) {
    return handleError(err, res, 'loginUser');
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    return handleError(err, res, 'getUserProfile');
  }
};

const refreshToken = async (req, res) => {
  // Get token from cookie instead of request body
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate the decoded payload structure
    if (!decoded.user || !decoded.user.id || !decoded.user.username) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // Fetch the user to get the current role
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new token with role included
    const newToken = jwt.sign(
      { user: { id: decoded.user.id, username: decoded.user.username, role: user.role } },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set the new token as a cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/' // Ensure cookie is available on all paths
    });

    res.json({
      message: 'Token refreshed successfully',
      user: {
        id: decoded.user.id,
        username: decoded.user.username,
        role: user.role
      }
    });
  } catch (err) {
    // Create a custom error with appropriate status code and client-safe message
    const authError = createError('Token validation failed', 401, 'Authentication expired');
    return handleError(authError, res, 'refreshToken');
  }
};

// Logout user
const logoutUser = (_req, res) => {
  // Clear the token cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' // Ensure cookie is available on all paths
  });

  res.json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, getUserProfile, refreshToken, logoutUser };

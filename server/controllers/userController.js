const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = new User({
    name: username, // Use username as name since the model has 'name' field
    email,
    password: hashedPassword,
  });

  try {
    await newUser.save();

    // Optional: generate JWT token immediately on registration
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      _id: newUser._id,
      username: newUser.name, // Return name as username for client consistency
      email: newUser.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
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

    // Generate JWT token
    const token = jwt.sign(
      { user: { id: user._id, username: user.name } }, // Include user object with id and name as username
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      _id: user._id,
      username: user.name, // Return name as username for client consistency
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
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
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate the decoded payload structure
    if (!decoded.user || !decoded.user.id || !decoded.user.username) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // Generate a new token
    const newToken = jwt.sign(
      { user: { id: decoded.user.id, username: decoded.user.username } },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error('Error refreshing token:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, refreshToken };

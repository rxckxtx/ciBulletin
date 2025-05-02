const validator = require('validator');
const zxcvbn = require('zxcvbn');

// Validation middleware for user registration
const validateRegistration = (req, res, next) => {
  // Check for both name and username fields since client might send either
  let { name, username, email, password } = req.body;
  const errors = [];

  // Handle the field name mismatch between client and server
  // Client might send 'username', but server expects 'name'
  if (!name && username) {
    name = username;
    // Update the request body to use 'name' instead of 'username'
    req.body.name = name;
  } else if (!name && !username) {
    // If neither name nor username is provided, reject the request
    errors.push('Username is required');
  }

  // Validate email
  if (!email || typeof email !== 'string' || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  } else {
    // Trim and normalize email
    email = email.trim();
    req.body.email = validator.normalizeEmail(email);
  }

  // Validate username/name
  if (name) {
    if (typeof name !== 'string') {
      errors.push('Username must be a string');
    } else {
      // Trim name
      name = name.trim();
      req.body.name = name;

      // Validate name format
      if (name === '') {
        errors.push('Username cannot be empty');
      } else if (name.length < 3) {
        errors.push('Username must be at least 3 characters long');
      } else if (!validator.isAlphanumeric(name.replace(/[_.-]/g, ''))) {
        errors.push('Username can only contain letters, numbers, and the characters _.-');
      }
    }
  }

  // Validate password
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check password strength
  if (password && typeof password === 'string') {
    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 2) {
      errors.push('Password is too weak. Please use a stronger password with a mix of letters, numbers, and symbols');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  // Sanitize inputs
  if (name) {
    req.body.name = validator.escape(name);
  }

  next();
};

// Validation middleware for login
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password || password.length < 1) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  // Sanitize inputs
  req.body.email = validator.normalizeEmail(email);

  next();
};

// Validation middleware for event creation/update
const validateEvent = (req, res, next) => {
  console.log('Validating event data:', req.body);

  const { title, location, date, group, type, theme } = req.body;
  const errors = [];

  // Validate required fields
  if (!title) {
    errors.push('Event title is required');
  } else if (validator.isEmpty(title.trim())) {
    errors.push('Event title cannot be empty');
  }

  if (!location) {
    errors.push('Event location is required');
  } else if (validator.isEmpty(location.trim())) {
    errors.push('Event location cannot be empty');
  }

  if (!date) {
    errors.push('Event date is required');
  } else {
    // Try to parse the date instead of strictly validating ISO8601
    try {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Invalid date format: ${date}. Could not parse as a valid date.`);
        console.log(`Invalid date format received: ${date}`);
      } else {
        console.log(`Date parsed successfully: ${parsedDate.toISOString()}`);
        // Replace the date in the request body with the parsed ISO date
        req.body.date = parsedDate.toISOString();
      }
    } catch (e) {
      errors.push(`Invalid date format: ${date}. Error: ${e.message}`);
      console.log(`Error parsing date: ${date}`, e);
    }
  }

  if (!group) {
    errors.push('Event group is required');
  } else if (validator.isEmpty(group.trim())) {
    errors.push('Event group cannot be empty');
  }

  // Validate event type
  const validTypes = ['event', 'club', 'academic', 'sports'];
  if (type && !validTypes.includes(type)) {
    errors.push(`Invalid event type: ${type}. Valid types are: ${validTypes.join(', ')}`);
  }

  // Validate theme
  const validThemes = ['asi', 'stem', 'arts', 'business', 'cs'];
  if (theme && !validThemes.includes(theme)) {
    errors.push(`Invalid event theme: ${theme}. Valid themes are: ${validThemes.join(', ')}`);
  }

  if (errors.length > 0) {
    console.log('Event validation errors:', errors);
    return res.status(400).json({ message: errors.join(', ') });
  }

  // Sanitize inputs
  if (title) req.body.title = validator.escape(title);
  if (location) req.body.location = validator.escape(location);
  if (group) req.body.group = validator.escape(group);

  console.log('Event validation passed');
  next();
};

// Validation middleware for resource creation/update
const validateResource = (req, res, next) => {
  const { title, description, category } = req.body;
  const errors = [];

  // Validate required fields
  if (!title || validator.isEmpty(title.trim())) {
    errors.push('Resource title is required');
  }

  // Validate category
  const validCategories = ['general', 'academic', 'club', 'event', 'other'];
  if (category && !validCategories.includes(category)) {
    errors.push('Invalid resource category');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(', ') });
  }

  // Sanitize inputs
  if (title) req.body.title = validator.escape(title);
  if (description) req.body.description = validator.escape(description);

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateEvent,
  validateResource
};

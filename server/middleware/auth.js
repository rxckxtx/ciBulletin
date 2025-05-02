const jwt = require('jsonwebtoken');
const { handleError, createError } = require('../utils/errorHandler');

module.exports = function(req, res, next) {
  console.log('Auth middleware called for path:', req.path);

  // Get token from cookie (preferred) or header
  let token = req.cookies.token;

  // If no cookie token, check Authorization header
  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    // Check if it's a Bearer token
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
      console.log('Token found in Authorization header (Bearer)');
    } else {
      token = authHeader;
      console.log('Token found in Authorization header (non-Bearer)');
    }
  }

  // For backward compatibility, check x-auth-token header
  if (!token && req.header('x-auth-token')) {
    token = req.header('x-auth-token');
    console.log('Token found in x-auth-token header');
  }

  // Check if no token
  if (!token) {
    console.log('No token provided for path:', req.path);
    const authError = createError('No authentication token provided', 401, 'Authentication required');
    return handleError(authError, res, 'auth-middleware');
  }

  // Token value is now already extracted from headers if needed

  // Verify token
  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully');

    // Ensure the decoded token contains a user object
    if (!decoded || !decoded.user || !decoded.user.id) {
      console.error('Invalid token payload:', decoded);
      const authError = createError('Invalid token structure', 401, 'Invalid authentication');
      return handleError(authError, res, 'auth-middleware');
    }

    console.log('User authenticated:', decoded.user.id);
    req.user = decoded.user; // Attach the user object to the request
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    const authError = createError('Token verification failed', 401, 'Authentication expired');
    return handleError(authError, res, 'auth-middleware');
  }
};
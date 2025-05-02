/**
 * Utility for standardized error handling
 * Prevents leaking sensitive information in error responses
 */

/**
 * Handles errors in a standardized way
 * @param {Error} error - The error object
 * @param {Response} res - Express response object
 * @param {string} context - Context where the error occurred (for logging)
 */
const handleError = (error, res, context = 'server') => {
  // Log errors in a more structured way
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, only log essential error information
  if (isProduction) {
    process.stderr.write(`Error in ${context}: ${error.message}\n`);
  } else {
    // In development, log more details for debugging
    process.stderr.write(`Error in ${context}: ${error.message}\n`);
    if (error.stack) {
      process.stderr.write(`Stack trace: ${error.stack}\n`);
    }
  }

  // Determine appropriate status code
  let statusCode = 500;
  let clientMessage = 'An unexpected error occurred';

  // Handle specific error types
  if (error.name === 'ValidationError' || error.name === 'ValidatorError') {
    statusCode = 400;
    clientMessage = 'Validation failed';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    clientMessage = 'Invalid data format';
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    // Handle MongoDB duplicate key errors
    statusCode = 400;
    const keyValue = error.keyValue ? Object.keys(error.keyValue)[0] : 'field';
    clientMessage = `Duplicate ${keyValue} error. This ${keyValue} is already in use.`;
  } else if (error.name === 'MongooseError' || error.name === 'MongoError') {
    statusCode = 503;
    clientMessage = 'Database service unavailable';
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = 401;
    clientMessage = 'Authentication invalid';
  } else if (error.code === 'ENOENT') {
    statusCode = 404;
    clientMessage = 'Resource not found';
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    clientMessage = 'File too large';
  }

  // Allow custom status code and message if provided by the error
  if (error.statusCode) {
    statusCode = error.statusCode;
  }

  if (error.clientMessage) {
    clientMessage = error.clientMessage;
  }

  // In development, we can include more details
  const response = {
    status: 'error',
    message: clientMessage
  };

  // Only include error details in development
  if (process.env.NODE_ENV !== 'production') {
    response.error = error.message;
    // Don't include stack trace in the response, but it's already logged above
  }

  // Send the sanitized response
  return res.status(statusCode).json(response);
};

/**
 * Creates a custom error with additional properties
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} clientMessage - Message safe to show to clients
 * @returns {Error} Enhanced error object
 */
const createError = (message, statusCode = 500, clientMessage = 'An error occurred') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.clientMessage = clientMessage;
  return error;
};

module.exports = {
  handleError,
  createError
};

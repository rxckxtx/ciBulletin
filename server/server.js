const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const fs = require('fs');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables
const validateEnv = require('./utils/validateEnv');
if (!validateEnv()) {
  console.error('Environment validation failed. Please check your configuration.');
  // Continue execution but log the warning
}

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - needed for Render and other hosting platforms
// This allows the app to trust the X-Forwarded-For header from the proxy
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Check if the origin is allowed
    const allowedOrigins = [
      'http://localhost:3000',
      'https://cibulletin.onrender.com',
      process.env.CORS_ORIGIN
    ].filter(Boolean); // Remove any undefined/null values

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-csrf-token',
    'Cache-Control',
    'X-Requested-With',
    'Accept',
    'x-refresh-request' // Added this header for thread view refresh
  ],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Enable pre-flight for all routes
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Setup CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    path: '/'
  }
});

// Apply CSRF protection to state-changing routes
// We'll apply it selectively to routes that need it

// Apply security headers in all environments
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: process.env.NODE_ENV === 'production'
        ? ["'self'"]
        : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || '*'],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  },
  // For single page applications
  crossOriginEmbedderPolicy: false,
  // Set X-XSS-Protection header
  xssFilter: true,
  // Prevent MIME type sniffing
  noSniff: true,
  // Set X-Frame-Options to prevent clickjacking
  frameguard: { action: 'sameorigin' }
}));

// Production-specific optimizations
if (process.env.NODE_ENV === 'production') {

  // Compression
  app.use(compression());

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // Increased limit to 500 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later',
    skip: (req) => {
      // Skip rate limiting for certain paths
      return req.path === '/api/health' ||
             req.path === '/api/status' ||
             req.path === '/api/users/profile' ||
             req.path === '/api/auth/refresh-token';
    }
  });

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);

  // Add request logging (minimal in production)
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      // Only log slow requests (>500ms) or error responses
      if (duration > 500 || res.statusCode >= 400) {
        process.stdout.write(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms\n`);
      }
    });
    next();
  });
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => process.stdout.write('MongoDB connected successfully\n'))
  .catch((err) => process.stderr.write(`MongoDB connection error: ${err.message}\n`));

// API Routes
// Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/events', require('./routes/events'));
app.use('/api/forums', require('./routes/forums'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/resources', require('./routes/resources'));

// Create uploads directories if they don't exist
const posterUploadsDir = path.join(__dirname, 'uploads/posters');
const resourceUploadsDir = path.join(__dirname, 'uploads/resources');

if (!fs.existsSync(posterUploadsDir)) {
  fs.mkdirSync(posterUploadsDir, { recursive: true });
}

if (!fs.existsSync(resourceUploadsDir)) {
  fs.mkdirSync(resourceUploadsDir, { recursive: true });
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use(express.static(path.join(__dirname, '../client/build')));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve the React app's build folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return index.html for all unknown routes
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Root route for testing
app.get('/', (_req, res) => {
  res.send('&#128526 ciBulletin backend is running!');
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthcheck.database = 'Connected';
    } else {
      healthcheck.database = 'Disconnected';
      healthcheck.message = 'WARNING';
    }

    res.status(200).json(healthcheck);
  } catch (error) {
    // Use error handler with custom status code
    error.statusCode = 503;
    error.clientMessage = 'Health check failed';
    return handleError(error, res, 'health-check');
  }
});

// CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Import error handler utility
const { handleError } = require('./utils/errorHandler');

// Global error handler
app.use((err, _req, res, _next) => {
  // Use centralized error handler
  handleError(err, res, 'global');
});

// Handle 404 errors
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
});

// Start HTTP server
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
  process.stdout.write(`HTTP Server running on port ${PORT}\n`);
  process.stdout.write(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Add graceful shutdown for HTTP server
process.on('SIGTERM', () => {
  process.stdout.write('SIGTERM signal received: closing HTTP server\n');
  httpServer.close(() => {
    process.stdout.write('HTTP server closed\n');
    // Close database connection
    mongoose.connection.close(false, () => {
      process.stdout.write('MongoDB connection closed\n');
      process.exit(0);
    });
  });
});
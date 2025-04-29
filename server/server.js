const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const http = require('http');
const https = require('https');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTPS redirect middleware for production
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_HTTPS_REDIRECT === 'true') {
  app.use((req, res, next) => {
    // Check if it's a secure connection
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
      // Redirect to HTTPS
      const httpsUrl = `https://${req.hostname}${req.originalUrl}`;
      return res.redirect(301, httpsUrl);
    }
    next();
  });
}

// Production optimizations
if (process.env.NODE_ENV === 'production') {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.example.com'] // Adjust before deployment
      }
    },
    // For single page applications
    crossOriginEmbedderPolicy: false
  }));

  // Compression
  app.use(compression());

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);

  // Add request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
}

// MongoDB Connection Test (Delete later)
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB! N0ICE');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

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

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);

  // Don't expose error details in production
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : err.message || 'An error occurred';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
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
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Start HTTPS server if in production or if SSL_ENABLED is true
if (process.env.NODE_ENV === 'production' || process.env.SSL_ENABLED === 'true') {
  try {
    // SSL certificate options
    const httpsOptions = {
      key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
      cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.crt'))
    };

    // Create HTTPS server
    const httpsServer = https.createServer(httpsOptions, app);
    const HTTPS_PORT = process.env.HTTPS_PORT || 443;

    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
    });
  } catch (error) {
    console.error('Failed to start HTTPS server:', error.message);
    console.log('Continuing with HTTP server only');
  }
}
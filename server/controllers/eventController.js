const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/posters/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'poster-' + uniqueSuffix + ext);
  }
});

// Create upload middleware with enhanced security
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // If no file is provided, that's okay
    if (!file) {
      return cb(null, true);
    }

    // Validate file type
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // Check both mimetype and extension to ensure file type integrity
    if (mimetype && extname) {
      return cb(null, true);
    }

    // Reject file with clear error message
    cb(new Error('Only JPEG, JPG, and PNG image files are allowed'));
  }
}).single('image');

// Create event with JSON data
exports.createEvent = async (req, res) => {
  console.log('Event creation endpoint called');
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);

  try {
    // Extract data from request body
    const { title, location, date, group, type, theme, urgent, image, size } = req.body;

    console.log('Extracted fields:');
    console.log('title:', title);
    console.log('location:', location);
    console.log('date:', date);
    console.log('group:', group);
    console.log('type:', type);
    console.log('theme:', theme);
    console.log('urgent:', urgent);
    console.log('image:', image);
    console.log('size:', size);

    // Validate required fields directly
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!location) missingFields.push('location');
    if (!date) missingFields.push('date');
    if (!group) missingFields.push('group');

    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}. Please ensure title, location, date, and group are provided.`
      });
    }

    // Handle size
    let sizeObj = size || { width: 1, height: 1 };

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('Authentication required - User object:', req.user);
      return res.status(401).json({ message: 'Authentication required to create events' });
    }

    const userId = req.user.id;

    // Validate date format
    let parsedDate;
    try {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
      console.log('Parsed date:', parsedDate);
    } catch (e) {
      console.error('Error parsing date:', date, e);
      return res.status(400).json({ message: `Invalid date format: ${date}. Please provide a valid date.` });
    }

    // Create new event object
    const newEvent = new Event({
      title,
      location,
      date: parsedDate,
      group,
      type: type || 'event',
      theme: theme || 'asi',
      urgent: urgent === true || urgent === 'true',
      size: sizeObj,
      image: image || null,
      user: userId
    });

    console.log('New event object:', newEvent);

    // Save to database
    const savedEvent = await newEvent.save();
    console.log('Event saved successfully:', savedEvent);

    // Fetch the saved event with populated user info
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate('user', 'name role')
      .lean();

    console.log('Populated event:', populatedEvent);
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);

    // Check for validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: `Validation error: ${validationErrors.join(', ')}` });
    }

    // Handle other errors
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const { showArchived } = req.query;
    const currentDate = new Date();

    // Base query
    let query = {};

    // If not showing archived, only show current and future events
    if (showArchived !== 'true') {
      query.date = { $gte: currentDate };
    }

    // Get events with user information
    const events = await Event.find(query)
      .populate('user', 'name role') // Populate user info
      .sort({ date: 1 }) // Sort by date ascending
      .lean(); // Convert to plain JS objects

    // Add an "isArchived" flag to each event
    const eventsWithArchiveFlag = events.map(event => ({
      ...event,
      isArchived: new Date(event.date) < currentDate
    }));

    res.json(eventsWithArchiveFlag);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('user', 'name role') // Populate user info
      .lean(); // Convert to plain JS object

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('user', 'name role'); // Populate user info

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    // First find the event to check ownership
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the event creator or an admin
    if (req.user && (event.user.toString() === req.user.id || req.user.role === 'admin')) {
      await Event.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Event deleted successfully' });
    } else {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if user has reached daily event limit
exports.checkDailyEventLimit = async (req, res) => {
  try {
    // If user is not authenticated, return false for limitReached
    if (!req.user) {
      return res.json({ limitReached: false, message: 'User not authenticated' });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count events created by this user today
    const count = await Event.countDocuments({
      user: req.user.id,
      createdAt: { $gte: today }
    });

    // Check if limit reached (e.g., 5 events per day)
    const limitReached = count >= 5;

    res.json({
      limitReached,
      count,
      limit: 5,
      message: limitReached ? 'Daily event limit reached' : 'You can create more events today'
    });
  } catch (error) {
    console.error('Error checking event limit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (_, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({
      startDate: { $gte: currentDate }
    })
    .populate('user', 'name role') // Populate user info
    .sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get past events
exports.getPastEvents = async (_, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({
      endDate: { $lt: currentDate }
    })
    .populate('user', 'name role') // Populate user info
    .sort({ startDate: -1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload event image only
exports.uploadEventImage = async (req, res) => {
  console.log('Image upload endpoint called');

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Other error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Return the file path
      const imagePath = `/uploads/posters/${req.file.filename}`;
      console.log('Image uploaded successfully:', imagePath);

      res.status(200).json({
        message: 'Image uploaded successfully',
        imagePath
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Server error: ' + error.message });
    }
  });
};
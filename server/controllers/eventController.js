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

// Create upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // If no file is provided, that's okay
    if (!file) {
      return cb(null, true);
    }
    
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, JPG, and PNG files are allowed'));
  }
}).single('image');

// Create event with image upload
exports.createEvent = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Other error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      console.log('Request body:', req.body);
      console.log('User object:', req.user); // Log the user object to debug
      
      const { title, location, date, group, type, theme, urgent } = req.body;
      let size = { width: 1, height: 1 };
      
      if (req.body.size) {
        try {
          size = JSON.parse(req.body.size);
        } catch (e) {
          console.error('Error parsing size:', e);
        }
      }
      
      // For development purposes, use a default user ID if not authenticated
      // In production, you should require authentication
      const userId = req.user?.id || '64f5b7d5e85b0e1b3c3f5b7d'; // Replace with a valid ObjectId from your database
      
      const newEvent = new Event({
        title,
        location,
        date,
        group,
        type: type || 'event',
        theme: theme || 'asi',
        urgent: urgent === 'true',
        size,
        image: req.file ? `/uploads/posters/${req.file.filename}` : null,
        user: userId
      });
      
      const savedEvent = await newEvent.save();
      res.status(201).json(savedEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Server error: ' + error.message });
    }
  });
};

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
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
    );
    
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
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
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
exports.getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({ 
      startDate: { $gte: currentDate } 
    }).sort({ startDate: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get past events
exports.getPastEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const events = await Event.find({ 
      endDate: { $lt: currentDate } 
    }).sort({ startDate: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
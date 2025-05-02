const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');

// GET all events
router.get('/', eventController.getEvents);

// POST create new event with validation
// Apply auth middleware first, then validation, then controller
router.post('/', auth, validateEvent, eventController.createEvent);

// GET check daily event limit
router.get('/check-limit', auth, eventController.checkDailyEventLimit);

// POST upload event image only
router.post('/upload-image', auth, eventController.uploadEventImage);

// GET single event
router.get('/:id', eventController.getEventById);

// PUT update event with validation
router.put('/:id', auth, validateEvent, eventController.updateEvent);

// DELETE event
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
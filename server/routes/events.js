const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// Get all events
router.get('/', eventController.getEvents);

// Get upcoming events
router.get('/upcoming', eventController.getUpcomingEvents);

// Get past events
router.get('/past', eventController.getPastEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Create new event (protected route)
router.post('/', auth, eventController.createEvent);

// Update event (protected route)
router.put('/:id', auth, eventController.updateEvent);

// Delete event (protected route)
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
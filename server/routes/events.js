const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');

// GET all events
router.get('/', eventController.getEvents);

// POST create new event
router.post('/', auth, eventController.createEvent);

// GET check daily event limit
router.get('/check-limit', auth, eventController.checkDailyEventLimit);

// GET single event
router.get('/:id', eventController.getEventById);

// PUT update event
router.put('/:id', auth, eventController.updateEvent);

// DELETE event
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;
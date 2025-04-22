const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');

// Get all announcements
router.get('/', announcementController.getAnnouncements);

// Get announcement by ID
router.get('/:id', announcementController.getAnnouncementById);

// Create new announcement (protected route)
router.post('/', auth, announcementController.createAnnouncement);

// Update announcement (protected route)
router.put('/:id', auth, announcementController.updateAnnouncement);

// Delete announcement (protected route)
router.delete('/:id', auth, announcementController.deleteAnnouncement);

module.exports = router;
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/auth');

// GET all announcements
router.get('/', announcementController.getAnnouncements);

// POST create new announcement
router.post('/', auth, announcementController.createAnnouncement);

// GET single announcement
router.get('/:id', announcementController.getAnnouncementById);

// PUT update announcement
router.put('/:id', auth, announcementController.updateAnnouncement);

// DELETE announcement
router.delete('/:id', auth, announcementController.deleteAnnouncement);

module.exports = router;
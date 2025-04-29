const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');

// GET all resources (with optional filtering)
router.get('/', resourceController.getResources);

// GET resource by ID
router.get('/:id', resourceController.getResourceById);

// POST create new resource with file upload
router.post('/', auth, resourceController.createResource);

// PUT update resource
router.put('/:id', auth, resourceController.updateResource);

// DELETE resource
router.delete('/:id', auth, resourceController.deleteResource);

// GET download resource (increment download counter)
router.get('/:id/download', resourceController.downloadResource);

// GET resources by user
router.get('/user/:userId?', auth, resourceController.getResourcesByUser);

module.exports = router;

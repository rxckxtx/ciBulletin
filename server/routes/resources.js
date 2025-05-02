const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');
const { validateResource } = require('../middleware/validation');

// GET all resources (with optional filtering)
router.get('/', resourceController.getResources);

// GET resources by user
router.get('/user/:userId?', auth, resourceController.getResourcesByUser);

// POST upload resource file only
router.post('/upload-file', auth, resourceController.uploadResourceFile);

// GET resource by ID
router.get('/:id', resourceController.getResourceById);

// POST create new resource with file upload and validation
router.post('/', auth, validateResource, resourceController.createResource);

// PUT update resource with validation
router.put('/:id', auth, validateResource, resourceController.updateResource);

// DELETE resource
router.delete('/:id', auth, resourceController.deleteResource);

// GET download resource (increment download counter)
router.get('/:id/download', resourceController.downloadResource);

module.exports = router;

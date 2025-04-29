const Resource = require('../models/Resource');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resources');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resource-' + uniqueSuffix + ext);
  }
});

// Create upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, but you can restrict if needed
    cb(null, true);
  }
}).single('file');

// Get all resources (with optional filtering)
exports.getResources = async (req, res) => {
  try {
    const { category, fileType, search, limit = 10, page = 1 } = req.query;
    const query = { isPublic: true };
    
    // Apply filters if provided
    if (category) query.category = category;
    if (fileType) query.fileType = fileType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar');
    
    // Get total count for pagination
    const total = await Resource.countDocuments(query);
    
    res.json({
      resources,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('user', 'name avatar');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new resource with file upload
exports.createResource = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const { title, description, category, tags, isPublic } = req.body;
      
      // Determine file type from extension
      const ext = path.extname(req.file.originalname).toLowerCase().substring(1);
      let fileType = 'other';
      
      if (['pdf'].includes(ext)) fileType = 'pdf';
      else if (['doc', 'docx'].includes(ext)) fileType = ext;
      else if (['ppt', 'pptx'].includes(ext)) fileType = ext;
      else if (['xls', 'xlsx'].includes(ext)) fileType = ext;
      else if (['txt'].includes(ext)) fileType = 'txt';
      else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) fileType = 'image';
      else if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) fileType = 'video';
      else if (['mp3', 'wav', 'ogg'].includes(ext)) fileType = 'audio';
      
      // Parse tags if they're provided as a string
      let parsedTags = [];
      if (tags) {
        try {
          parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
        } catch (e) {
          parsedTags = tags.split(',').map(tag => tag.trim());
        }
      }
      
      const newResource = new Resource({
        title,
        description,
        fileUrl: `/uploads/resources/${req.file.filename}`,
        fileType,
        category: category || 'general',
        tags: parsedTags,
        user: req.user.id,
        isPublic: isPublic === 'true' || isPublic === true
      });
      
      const savedResource = await newResource.save();
      
      // Populate user info before sending response
      await savedResource.populate('user', 'name avatar');
      
      res.status(201).json(savedResource);
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(500).json({ message: 'Server error: ' + error.message });
    }
  });
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;
    
    // Find resource and check ownership
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if user is the owner or an admin
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }
    
    // Parse tags if they're provided as a string
    let parsedTags = resource.tags;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }
    
    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (category) resource.category = category;
    if (tags) resource.tags = parsedTags;
    if (isPublic !== undefined) resource.isPublic = isPublic === 'true' || isPublic === true;
    
    const updatedResource = await resource.save();
    
    // Populate user info before sending response
    await updatedResource.populate('user', 'name avatar');
    
    res.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    // Find resource and check ownership
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if user is the owner or an admin
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }
    
    // Delete the file from the server
    if (resource.fileUrl) {
      const filePath = path.join(__dirname, '..', resource.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete the resource from the database
    await Resource.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download resource (increment download counter)
exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if resource is public or user is the owner
    if (!resource.isPublic && 
        (!req.user || (resource.user.toString() !== req.user.id && req.user.role !== 'admin'))) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
    
    // Increment download counter
    resource.downloads += 1;
    await resource.save();
    
    // Get the file path
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    
    // Get the original filename from the URL
    const originalFilename = path.basename(resource.fileUrl);
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`);
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get resources by user
exports.getResourcesByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const isOwnResources = req.user && userId === req.user.id;
    
    // If requesting other user's resources, only show public ones
    const query = { user: userId };
    if (!isOwnResources) {
      query.isPublic = true;
    }
    
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching user resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

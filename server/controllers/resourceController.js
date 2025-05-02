const Resource = require('../models/Resource');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validator = require('validator');
let fileType;
try {
  fileType = require('file-type');
} catch (err) {
  console.error('Warning: file-type module not available, using basic validation');
  fileType = null;
}

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

// Create basic upload middleware - we'll do content validation after upload
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    // Initial check based on extension and reported MIME type
    const filename = file.originalname.toLowerCase();
    const ext = path.extname(filename).substring(1).toLowerCase();

    // Define allowed file types
    const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    // Initial check based on extension and reported MIME type
    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error('Only PDF, Word, PowerPoint, Excel, text, and image files are allowed'));
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
    // Use centralized error handler instead of console.error
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
    // Use centralized error handler instead of console.error
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new resource with JSON data
exports.createResource = async (req, res) => {
  try {
    const { title, description, category, tags, isPublic, filePath } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!filePath) {
      return res.status(400).json({ message: 'File path is required. Please upload a file first.' });
    }

    // Check if the file exists on the server
    const serverFilePath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(serverFilePath)) {
      return res.status(404).json({ message: 'File not found on server. Please upload the file again.' });
    }

    // Determine file type category based on extension
    const ext = path.extname(filePath).toLowerCase();
    let fileTypeCategory = 'other';

    if (ext === '.pdf') {
      fileTypeCategory = 'pdf';
    } else if (['.doc', '.docx'].includes(ext)) {
      fileTypeCategory = 'word';
    } else if (['.ppt', '.pptx'].includes(ext)) {
      fileTypeCategory = 'powerpoint';
    } else if (['.xls', '.xlsx'].includes(ext)) {
      fileTypeCategory = 'excel';
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      fileTypeCategory = 'image';
    } else if (ext === '.txt') {
      fileTypeCategory = 'text';
    }

    // Parse and sanitize tags if they're provided
    let parsedTags = [];
    if (tags) {
      try {
        // Handle tags as string, array, or JSON string
        if (typeof tags === 'string') {
          try {
            parsedTags = JSON.parse(tags);
          } catch (e) {
            // If JSON parsing fails, split by comma
            parsedTags = tags.split(',').map(tag => tag.trim());
          }
        } else if (Array.isArray(tags)) {
          parsedTags = tags;
        }

        // Sanitize each tag and filter out empty ones
        parsedTags = parsedTags
          .map(tag => typeof tag === 'string' ? validator.escape(tag.trim()) : '')
          .filter(tag => tag.length > 0)
          .slice(0, 10); // Limit to 10 tags maximum
      } catch (e) {
        // Silently handle tag parsing errors
        parsedTags = [];
      }
    }

    // Create new resource with sanitized inputs
    const newResource = new Resource({
      title: validator.escape(title),
      description: description ? validator.escape(description) : '',
      fileUrl: filePath,
      fileType: fileTypeCategory,
      category: category ? validator.escape(category) : 'general',
      tags: parsedTags,
      user: req.user.id,
      isPublic: isPublic === true || isPublic === 'true'
    });

    const savedResource = await newResource.save();

    // Populate user info before sending response
    await savedResource.populate('user', 'name avatar');

    res.status(201).json(savedResource);
  } catch (error) {
    // Check for validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: `Validation error: ${validationErrors.join(', ')}` });
    }

    res.status(500).json({ message: 'Server error' });
  }
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

    // Parse and sanitize tags if they're provided
    let parsedTags = resource.tags;
    if (tags) {
      try {
        // Try to parse as JSON if it's a string
        if (typeof tags === 'string') {
          try {
            parsedTags = JSON.parse(tags);
          } catch (e) {
            // If JSON parsing fails, split by comma
            parsedTags = tags.split(',').map(tag => tag.trim());
          }
        } else {
          // If it's already an array, use it directly
          parsedTags = tags;
        }

        // Sanitize each tag and filter out empty ones
        parsedTags = parsedTags
          .map(tag => typeof tag === 'string' ? validator.escape(tag.trim()) : '')
          .filter(tag => tag.length > 0)
          .slice(0, 10); // Limit to 10 tags maximum
      } catch (e) {
        // Silently handle tag parsing errors
        parsedTags = resource.tags; // Keep existing tags on error
      }
    }

    // Update fields with sanitization
    if (title) resource.title = validator.escape(title);
    if (description) resource.description = validator.escape(description);
    if (category) resource.category = validator.escape(category);
    if (tags) resource.tags = parsedTags;
    if (isPublic !== undefined) resource.isPublic = isPublic === 'true' || isPublic === true;

    const updatedResource = await resource.save();

    // Populate user info before sending response
    await updatedResource.populate('user', 'name avatar');

    res.json(updatedResource);
  } catch (error) {
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
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload resource file only
exports.uploadResourceFile = async (req, res) => {

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
      }

      // Content-based file type validation using file-type
      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);
      const detectedType = await fileType.fromBuffer(fileBuffer);

      // Define allowed MIME types
      const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];

      // Special handling for text files which might not be detected by file-type
      const ext = path.extname(req.file.originalname).toLowerCase();
      const isTxtFile = ext === '.txt';

      // If file type couldn't be detected and it's not a text file, or detected type is not allowed
      if ((!detectedType && !isTxtFile) || (detectedType && !allowedMimeTypes.includes(detectedType.mime))) {
        // Delete the suspicious file
        fs.unlinkSync(filePath);
        return res.status(400).json({
          message: 'File content does not match its extension or is not an allowed type'
        });
      }

      // Return the file path
      const filePath2 = `/uploads/resources/${req.file.filename}`;

      res.status(200).json({
        message: 'File uploaded successfully',
        filePath: filePath2
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
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
    res.status(500).json({ message: 'Server error' });
  }
};

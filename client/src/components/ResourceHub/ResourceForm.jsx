import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createResource, fetchResourceById, updateResource } from '../../services/api';
import './ResourceForm.css';

const ResourceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: '',
    isPublic: true,
    file: null
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'academic', name: 'Academic' },
    { id: 'club', name: 'Club' },
    { id: 'event', name: 'Event' },
    { id: 'administrative', name: 'Administrative' }
  ];

  useEffect(() => {
    // If in edit mode, fetch the resource data
    if (isEditMode) {
      loadResource();
    }
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const resource = await fetchResourceById(id);

      setFormData({
        title: resource.title,
        description: resource.description,
        category: resource.category,
        tags: resource.tags ? resource.tags.join(', ') : '',
        isPublic: resource.isPublic,
        file: null // Can't pre-fill file input
      });

      // Set preview if it's an image (preview not working at this current state)
      if (resource.fileType === 'image') {
        setPreview(resource.fileUrl);
      }
    } catch (err) {
      console.error('Error loading resource:', err);
      setError('Failed to load resource data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      // Validate file size (25MB max)
      if (files[0] && files[0].size > 25 * 1024 * 1024) {
        setFileError('File size exceeds 25MB limit');
        return;
      }

      setFileError('');
      setFormData({ ...formData, file: files[0] });

      // Create preview for image files
      if (files[0] && files[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(files[0]);
      } else {
        setPreview(null);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // No need to check for token - authentication is handled by HttpOnly cookies

      // Validate form
      if (!formData.title.trim()) {
        setError('Title is required');
        return;
      }

      if (!formData.description.trim()) {
        setError('Description is required');
        return;
      }

      if (!isEditMode && !formData.file) {
        setError('Please select a file to upload');
        return;
      }

      // Process tags
      const processedTags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      // Create FormData object for file upload
      const resourceFormData = new FormData();
      resourceFormData.append('title', formData.title);
      resourceFormData.append('description', formData.description);
      resourceFormData.append('category', formData.category);
      resourceFormData.append('isPublic', formData.isPublic);

      // Add tags as JSON string
      if (processedTags.length > 0) {
        resourceFormData.append('tags', JSON.stringify(processedTags));
      }

      // Add file if provided (required for create, optional for update)
      if (formData.file) {
        resourceFormData.append('file', formData.file);
      }

      let result;
      if (isEditMode) {
        result = await updateResource(id, resourceFormData);
      } else {
        result = await createResource(resourceFormData);
      }

      // Navigate to the resource detail page
      navigate(`/resources/${result._id}`);
    } catch (err) {
      console.error('Error saving resource:', err);
      setError(err.message || 'Failed to save resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="resource-form-loading">Loading resource data...</div>;
  }

  return (
    <div className="resource-form-container">
      <div className="resource-form-header">
        <h1>{isEditMode ? 'Edit Resource' : 'Upload New Resource'}</h1>
        <Link to="/resources" className="back-to-resources">
          <i className="fas fa-arrow-left"></i> Back to Resources
        </Link>
      </div>

      {error && <div className="resource-form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="resource-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide a detailed description of the resource"
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., syllabus, homework, schedule"
          />
          <small>Separate tags with commas</small>
        </div>

        <div className="form-group file-upload">
          <label htmlFor="file">
            {isEditMode ? 'Replace File (optional)' : 'Upload File *'}
          </label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleChange}
            required={!isEditMode}
          />
          {fileError && <div className="file-error">{fileError}</div>}
          <small>Maximum file size: 25MB</small>

          {preview && (
            <div className="file-preview">
              <h4>Preview:</h4>
              <img src={preview} alt="File preview" />
            </div>
          )}
        </div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
          />
          <label htmlFor="isPublic">Make this resource public</label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading || fileError}
          >
            {loading ? 'Saving...' : isEditMode ? 'Update Resource' : 'Upload Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;

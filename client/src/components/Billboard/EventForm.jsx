import React, { useState } from 'react';
import './EventForm.css';

const EventForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    group: '',
    type: 'event',
    theme: 'asi',
    urgent: false,
    size: { width: 1, height: 1 }
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        setError('Please upload a PNG or JPEG image');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      setImage(file);

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (!formData.title || !formData.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.location || !formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    if (!formData.date) {
      setError('Date is required');
      setLoading(false);
      return;
    }

    if (!formData.group || !formData.group.trim()) {
      setError('Group/Organization is required');
      setLoading(false);
      return;
    }

    try {
      // Create a FormData object to handle file upload
      const eventFormData = new FormData();

      // Create a copy of the form data to modify the date format
      const formDataToSend = { ...formData };

      // Handle date format
      if (!formDataToSend.date) {
        setError('Date is required. Please select a date.');
        setLoading(false);
        return;
      }

      try {
        // Create a Date object from the YYYY-MM-DD format
        // Add a fixed time (noon) to avoid timezone issues
        const dateString = formDataToSend.date + 'T12:00:00';
        const dateObj = new Date(dateString);

        // Check if the date is valid
        if (isNaN(dateObj.getTime())) {
          throw new Error('Invalid date format');
        }

        // Convert to ISO string
        formDataToSend.date = dateObj.toISOString();
      } catch (error) {
        setError('Invalid date format. Please select a valid date.');
        setLoading(false);
        return;
      }

      // Add all form fields explicitly to ensure they're properly formatted
      // Ensure all string values are trimmed and non-empty
      // We'll sanitize the data in the API service before sending to server
      const sanitizedTitle = formDataToSend.title.trim();
      const sanitizedLocation = formDataToSend.location.trim();
      const sanitizedGroup = formDataToSend.group.trim();

      eventFormData.append('title', sanitizedTitle);
      eventFormData.append('location', sanitizedLocation);
      eventFormData.append('date', formDataToSend.date);
      eventFormData.append('group', sanitizedGroup);
      eventFormData.append('type', formDataToSend.type || 'event');
      eventFormData.append('theme', formDataToSend.theme || 'asi');
      eventFormData.append('urgent', formDataToSend.urgent ? 'true' : 'false');

      // Ensure size is properly formatted as a JSON string
      const sizeObj = formDataToSend.size || { width: 1, height: 1 };
      eventFormData.append('size', JSON.stringify(sizeObj));

      // Add image only if it exists
      if (image) {
        eventFormData.append('image', image);
      }

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create events. Please log in and try again.');
        setLoading(false);
        return;
      }

      // Submit the form
      await onSubmit(eventFormData);
    } catch (err) {
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-overlay">
      <div className="event-form-container">
        <h2>Create New Event</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="group">Group/Organization *</label>
            <input
              type="text"
              id="group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Event Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="event">General Event</option>
              <option value="club">Club Meeting</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
            >
              <option value="asi">ASI</option>
              <option value="stem">STEM</option>
              <option value="arts">Arts</option>
              <option value="business">Business</option>
              <option value="cs">Computer Science</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="urgent"
              name="urgent"
              checked={formData.urgent}
              onChange={handleChange}
            />
            <label htmlFor="urgent">Mark as Urgent</label>
          </div>

          <div className="form-group">
            <label htmlFor="image">Event Poster (Optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/png,image/jpeg"
              onChange={handleImageChange}
            />
            <small>Upload a PNG or JPEG image (max 5MB)</small>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <h4>Image Preview</h4>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createThread } from '../../services/api';
import './NewThread.css';

const NewThread = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: 'general', name: 'General' },
    { id: 'academic', name: 'Academic' },
    { id: 'clubs', name: 'Clubs' },
    { id: 'events', name: 'Events' },
    { id: 'announcements', name: 'Announcements' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // No need to check for token - authentication is handled by HttpOnly cookies

      // Validate form
      if (!title.trim()) {
        setError('Title is required');
        return;
      }

      if (!content.trim()) {
        setError('Content is required');
        return;
      }

      const newThread = await createThread({
        title,
        content,
        category
      });

      navigate(`/forum/thread/${newThread._id}`);
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create thread. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-thread-container">
      <div className="new-thread-header">
        <h1>Create New Thread</h1>
        <button onClick={() => navigate('/forum')} className="back-btn">
          &larr; Back to Forum
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="thread-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter thread title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thread content here..."
            rows="10"
            required
          ></textarea>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/forum')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Thread'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewThread;
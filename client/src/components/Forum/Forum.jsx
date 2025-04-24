import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchThreads, createThread } from '../../services/api';
import './Forum.css';

const Forum = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'general' });
  const navigate = useNavigate();
  const { category } = useParams();

  useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
    
    loadThreads(category);
  }, [category]);

  const loadThreads = async (category = null) => {
    try {
      setLoading(true);
      const data = await fetchThreads(category);
      setThreads(data);
      setError('');
    } catch (err) {
      console.error('Error loading threads:', err);
      setError('Failed to load discussion threads');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      loadThreads();
      navigate('/forum');
    } else {
      loadThreads(category);
      navigate(`/forum/category/${category}`);
    }
  };

  const handleNewThreadChange = (e) => {
    const { name, value } = e.target;
    setNewThread({ ...newThread, [name]: value });
  };

  const handleNewThreadSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: '/forum' } });
        return;
      }

      const createdThread = await createThread(newThread);
      setThreads([createdThread, ...threads]);
      setNewThread({ title: '', content: '', category: 'general' });
      setShowNewThreadForm(false);
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create new thread');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Discussion Forum</h1>
        <button 
          className="new-thread-btn"
          onClick={() => {
            const token = localStorage.getItem('token');
            if (!token) {
              navigate('/login', { state: { from: '/forum' } });
            } else {
              setShowNewThreadForm(!showNewThreadForm);
            }
          }}
        >
          {showNewThreadForm ? 'Cancel' : 'New Thread'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showNewThreadForm && (
        <div className="new-thread-form">
          <h3>Create New Thread</h3>
          <form onSubmit={handleNewThreadSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newThread.title}
                onChange={handleNewThreadChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={newThread.category}
                onChange={handleNewThreadChange}
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="clubs">Clubs</option>
                <option value="events">Events</option>
                <option value="questions">Questions</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                value={newThread.content}
                onChange={handleNewThreadChange}
                required
                rows="5"
              ></textarea>
            </div>
            <button type="submit" className="submit-btn">Create Thread</button>
          </form>
        </div>
      )}

      <div className="forum-categories">
        <button 
          className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('all')}
        >
          All
        </button>
        <button 
          className={`category-btn ${activeCategory === 'general' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('general')}
        >
          General
        </button>
        <button 
          className={`category-btn ${activeCategory === 'academic' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('academic')}
        >
          Academic
        </button>
        <button 
          className={`category-btn ${activeCategory === 'clubs' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('clubs')}
        >
          Clubs
        </button>
        <button 
          className={`category-btn ${activeCategory === 'events' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('events')}
        >
          Events
        </button>
        <button 
          className={`category-btn ${activeCategory === 'questions' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('questions')}
        >
          Questions
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading threads...</div>
      ) : threads.length === 0 ? (
        <div className="no-threads">
          <p>No threads found in this category.</p>
          <p>Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="thread-list">
          {threads.map(thread => (
            <div key={thread._id} className="thread-item">
              <Link to={`/forum/thread/${thread._id}`} className="thread-title">
                {thread.title}
              </Link>
              <div className="thread-meta">
                <span className="thread-category">{thread.category}</span>
                <span className="thread-author">by {thread.user?.username || 'Unknown'}</span>
                <span className="thread-date">{formatDate(thread.createdAt)}</span>
                <span className="thread-replies">{Array.isArray(thread.posts) ? thread.posts.length : 0} replies</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forum;
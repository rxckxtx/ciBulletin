import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchThreads } from '../../services/api';
import './ForumList.css';

const ForumList = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    { id: null, name: 'All' },
    { id: 'general', name: 'General' },
    { id: 'academic', name: 'Academic' },
    { id: 'clubs', name: 'Clubs' },
    { id: 'events', name: 'Events' },
    { id: 'announcements', name: 'Announcements' }
  ];

  useEffect(() => {
    loadThreads();
  }, [activeCategory]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await fetchThreads(activeCategory);
      setThreads(data);
      setError('');
    } catch (err) {
      console.error('Error loading threads:', err);
      setError('Failed to load forum threads');
    } finally {
      setLoading(false);
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
        <Link to="/forum/new" className="create-thread-btn">Create New Thread</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category.id || 'all'}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading threads...</div>
      ) : threads.length === 0 ? (
        <div className="no-threads">
          <p>No threads found in this category.</p>
          <Link to="/forum/new" className="create-thread-btn">Create the first thread</Link>
        </div>
      ) : (
        <div className="threads-list">
          {threads.map(thread => (
            <div key={thread._id} className="thread-item">
              <div className="thread-details">
                <Link to={`/forum/thread/${thread._id}`} className="thread-title">
                  {thread.title}
                </Link>
                <div className="thread-meta">
                  <span className="thread-category">{thread.category}</span>
                  <span className="thread-author">Posted by {thread.user?.username || 'Unknown'}</span>
                  <span className="thread-date">{formatDate(thread.createdAt)}</span>
                  <span className="thread-stats">
                    <span className="thread-replies">{typeof thread.postCount === 'number' ? thread.postCount : (thread.posts?.length || 0)} replies</span>
                    <span className="thread-views">{thread.views} views</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumList;
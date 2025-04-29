import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchThreads } from '../../services/api';
import '../Forum/Forum.css';

const DashboardForum = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadThreads();

    // Add a focus event listener to refresh threads when returning to this page
    const handleFocus = () => {
      console.log('Window focused, refreshing dashboard threads');
      loadThreads();
    };

    window.addEventListener('focus', handleFocus);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await fetchThreads();
      setThreads(data || []);
      setError('');
    } catch (err) {
      console.error('Error loading threads in dashboard:', err);
      setError('Failed to load discussion threads');
      setThreads([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard-forum">
      <div className="forum-header">
        <h2>Recent Discussions</h2>
        <div className="forum-header-buttons">
          <button
            className="refresh-btn"
            onClick={loadThreads}
            title="Refresh threads"
          >
            ↻ Refresh
          </button>
          <Link to="/forum" className="view-all-btn">
            View All
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading threads...</div>
      ) : (
        <>
          {threads.length === 0 ? (
            <div className="no-threads">
              <p>No discussions available.</p>
              <Link to="/forum/new" className="create-thread-btn">Start a New Discussion</Link>
            </div>
          ) : (
            <div className="thread-list dashboard-thread-list">
              {threads.slice(0, 5).map(thread => {
                // Use _id instead of id, and add a fallback
                const threadId = thread._id || thread.id;
                // Get the username from the user object or use a fallback
                const authorName = thread.user?.username || thread.author || 'Unknown';

                return (
                  <div key={threadId} className="thread-item">
                    <div className="thread-content">
                      <Link to={`/forum/thread/${threadId}`} className="thread-title">
                        {thread.title}
                      </Link>
                      <div className="thread-meta">
                        <span className="thread-category">{thread.category}</span>
                        <span className="thread-author">By {authorName}</span>
                        <span className="thread-date">{formatDate(thread.createdAt)}</span>
                        <span className="thread-comments">
                          {typeof thread.postCount === 'number' ? thread.postCount : (thread.posts?.length || 0)} comments
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="view-all-threads">
                <Link to="/forum" className="view-all-link">View All Discussions →</Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardForum;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchThreads } from '../../services/api';
import ThreadList from './ThreadList';
import './Forum.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Format category name for display
  const formatCategoryName = (id) => {
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  const loadCategoryThreads = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchThreads(categoryId);
      setThreads(data || []);
      setError('');
    } catch (err) {
      console.error('Error loading category threads:', err);
      setError('Failed to load threads for this category');
      setThreads([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadCategoryThreads();

    // Add a focus event listener to refresh threads when returning to this page
    const handleFocus = () => {
      console.log('Window focused, refreshing category threads');
      loadCategoryThreads();
    };

    window.addEventListener('focus', handleFocus);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [categoryId, loadCategoryThreads]);

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>{formatCategoryName(categoryId)} Discussions</h1>
        <div className="forum-header-buttons">
          <button
            className="refresh-btn"
            onClick={loadCategoryThreads}
            title="Refresh threads"
          >
            ↻ Refresh
          </button>
          <Link to="/forum" className="back-link">← Back to All Categories</Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading threads...</div>
      ) : (
        <>
          {threads.length === 0 ? (
            <div className="no-threads">
              <p>No discussions in this category yet.</p>
              <Link to="/forum/new" className="create-thread-btn">Start a New Discussion</Link>
            </div>
          ) : (
            <ThreadList threads={threads} />
          )}
        </>
      )}

      <div className="forum-actions">
        <Link to="/forum/new" className="create-thread-btn">Create New Thread</Link>
      </div>
    </div>
  );
};

export default CategoryPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchThreadById, addPost, deleteThread, deleteForumPost } from '../../services/api';
import './ThreadDetail.css';

const ThreadDetail = () => {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Track if this is the initial load or a refresh
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Define loadThread function first using useCallback
  const loadThread = useCallback(async (_countView = false) => {
    try {
      setLoading(true);
      // Make sure id is not undefined before making the API call
      if (!id) {
        setError('Invalid thread ID');
        return;
      }

      try {
        // Try to fetch the thread without using the custom header first
        // CORS was having issues with the x-refresh-request header
        const data = await fetchThreadById(id, false);

        // Debug log to see what data we're getting from the server
        console.log('Thread data received:', data);
        console.log('User data:', data.user);

        setThread(data);
        setError('');
      } catch (err) {
        // Error type checks
        if (err.response) {
          if (err.response.status === 404) {
            setError('Thread not found. It may have been deleted.');
          } else if (err.response.status === 403) {
            setError('You do not have permission to view this thread.');
          } else {
            setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('Network error. Please check your connection and try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError('Failed to load thread details. Please try again later.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id, setLoading, setError, setThread]);

  // Get current user ID and role from localStorage
  useEffect(() => {
    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadThread(isInitialLoad);
      // After initial load, set to false for future refreshes
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } else {
      setError('Invalid thread ID');
      setLoading(false);
    }
  }, [id, isInitialLoad, loadThread]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      // No need to check for token - authentication is handled by HttpOnly cookies

      if (!newPost.trim()) {
        setError('Post content cannot be empty');
        return;
      }

      const updatedThread = await addPost(id, { content: newPost });
      setThread(updatedThread);
      setNewPost('');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // If unauthorized, redirect to login
        navigate('/login', { state: { from: `/forum/thread/${id}` } });
      } else {
        setError('Failed to add your reply');
      }
    }
  };

  const handleDeleteThread = async () => {
    if (!window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteThread(id);
      navigate('/forum');
    } catch (err) {
      setError('Failed to delete thread');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const updatedThread = await deleteForumPost(id, postId);
      setThread(updatedThread);
      setError(''); // Clears previous errors
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading thread...</div>;
  }

  if (error && !thread) {
    return <div className="error-message">{error}</div>;
  }

  if (!thread) {
    return <div className="not-found">Thread not found</div>;
  }

  return (
    <div className="thread-detail-container">
      <div className="thread-navigation">
        <button onClick={() => navigate('/forum')} className="back-btn">
          &larr; Back to Forum
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="thread-header">
        <h1>{thread.title}</h1>
        <div className="thread-meta">
          <span className="thread-category">{thread.category}</span>
          <span className="thread-author">Posted by {thread.user?.name || thread.user?.username || 'Unknown'}</span>
          <span className="thread-date">{formatDate(thread.createdAt)}</span>
        </div>
      </div>

      <div className="thread-content">
        <p>{thread.content}</p>
      </div>

      <div className="thread-actions">
        {/* Show delete button if user is the thread creator or an admin */}
        {currentUserId && thread.user && (
          <div>
            {(() => {
              // Handle different possible formats of user ID (MongoDB fix)
              let threadUserId;
              if (typeof thread.user === 'string') {
                threadUserId = thread.user;
              } else if (thread.user._id) {
                threadUserId = thread.user._id;
              }

              // Check if user is the thread creator
              const isCreator = threadUserId && currentUserId && threadUserId.toString() === currentUserId.toString();

              // Get admin status directly from localStorage
              const userRole = localStorage.getItem('userRole');
              const isAdminUser = userRole === 'admin';

              // Show delete button if user is creator or admin
              if (isCreator || isAdminUser) {
                return (
                  <button onClick={handleDeleteThread} className="delete-btn">
                    Delete Thread
                  </button>
                );
              }

              return null;
            })()}
          </div>
        )}
      </div>

      <div className="posts-section">
        <h3>Replies ({thread.posts.length})</h3>

        {thread.posts.length === 0 ? (
          <div className="no-posts">No replies yet. Be the first to reply!</div>
        ) : (
          <div className="posts-list">
            {thread.posts.map(post => (
              <div key={post._id} className="post-item">
                <div className="post-header">
                  <span className="post-author">{post.user?.name || post.user?.username || 'Unknown'}</span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                </div>
                <div className="post-actions">
                  {/* Show delete button if user is the post creator or an admin */}
                  {currentUserId && post.user && (
                    <div>
                      {(() => {
                        // Handle different possible formats of user ID
                        let postUserId;
                        if (typeof post.user === 'string') {
                          postUserId = post.user;
                        } else if (post.user && post.user._id) {
                          postUserId = post.user._id;
                        }

                        // Check if user is the post creator
                        const isCreator = postUserId && currentUserId && postUserId.toString() === currentUserId.toString();

                        // Get admin status directly from localStorage (There is server side authentication) (I just dont have money for cloud storage rn)
                        const userRole = localStorage.getItem('userRole');
                        const isAdminUser = userRole === 'admin';

                        // Show delete button if user is creator or admin
                        if (isCreator || isAdminUser) {
                          return (
                            <button onClick={() => handleDeletePost(post._id)} className="delete-btn">
                              Delete Reply
                            </button>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="reply-form">
        <h3>Add a Reply</h3>
        <form onSubmit={handlePostSubmit}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write your reply here..."
            rows="4"
            required
          ></textarea>
          <button type="submit" className="submit-btn">Post Reply</button>
        </form>
      </div>
    </div>
  );
};

export default ThreadDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchThreadById, addPost, deleteThread, deleteForumPost } from '../../services/api';
import './ThreadDetail.css';

const ThreadDetail = () => {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newPost, setNewPost] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadThread();
  }, [id]);
  
  const loadThread = async () => {
    try {
      setLoading(true);
      const data = await fetchThreadById(id);
      setThread(data);
      setError('');
    } catch (err) {
      console.error('Error loading thread:', err);
      setError('Failed to load thread details');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/forum/thread/${id}` } });
        return;
      }
      
      if (!newPost.trim()) {
        setError('Post content cannot be empty');
        return;
      }
      
      const updatedThread = await addPost(id, { content: newPost });
      setThread(updatedThread);
      setNewPost('');
    } catch (err) {
      console.error('Error adding post:', err);
      setError('Failed to add your reply');
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
      console.error('Error deleting thread:', err);
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
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
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
          <span className="thread-author">Posted by {thread.user?.username || 'Unknown'}</span>
          <span className="thread-date">{formatDate(thread.createdAt)}</span>
        </div>
      </div>
      
      <div className="thread-content">
        <p>{thread.content}</p>
      </div>
      
      <div className="thread-actions">
        {/* Only show delete button if user is the thread creator or an admin */}
        {/* This would require checking the current user ID against thread.user._id */}
        {/* <button onClick={handleDeleteThread} className="delete-btn">Delete Thread</button> */}
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
                  <span className="post-author">{post.user?.username || 'Unknown'}</span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>
                <div className="post-content">
                  <p>{post.content}</p>
                </div>
                <div className="post-actions">
                  {/* Only show delete button if user is the post creator or an admin */}
                  {/* <button onClick={() => handleDeletePost(post._id)} className="delete-btn">Delete</button> */}
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
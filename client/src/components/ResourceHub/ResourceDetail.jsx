import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchResourceById, downloadResource, deleteResource } from '../../services/api';
import './ResourceDetail.css';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadResource();
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await fetchResourceById(id);
      setResource(data);

      // Check if current user is the owner
      const userId = localStorage.getItem('userId');
      setIsOwner(userId && data.user && userId === data.user._id);

      // Check if current user is an admin
      const userRole = localStorage.getItem('userRole');
      setIsAdmin(userRole === 'admin');
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError('Failed to load resource. It may have been removed or you do not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    downloadResource(id);
  };

  const handleDelete = async () => {
    try {
      await deleteResource(id);
      navigate('/resources');
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Failed to delete resource. Please try again.');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'ppt':
      case 'pptx':
        return 'fa-file-powerpoint';
      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';
      case 'txt':
        return 'fa-file-alt';
      case 'image':
        return 'fa-file-image';
      default:
        return 'fa-file';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="resource-detail-loading">Loading resource...</div>;
  }

  if (error) {
    return (
      <div className="resource-detail-error">
        <p>{error}</p>
        <Link to="/resources" className="back-to-resources">Back to Resources</Link>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="resource-detail-not-found">
        <h2>Resource Not Found</h2>
        <p>The resource you're looking for doesn't exist or has been removed.</p>
        <Link to="/resources" className="back-to-resources">Back to Resources</Link>
      </div>
    );
  }

  return (
    <div className="resource-detail-container">
      <div className="resource-detail-header">
        <Link to="/resources" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Resources
        </Link>

        <h1 className="resource-detail-title">{resource.title}</h1>

        <div className="resource-detail-meta">
          <span className="resource-detail-category">{resource.category}</span>
          <span className="resource-detail-type">
            <i className={`fas ${getFileIcon(resource.fileType)}`}></i> {resource.fileType.toUpperCase()}
          </span>
          <span className="resource-detail-date">
            <i className="far fa-calendar-alt"></i> {formatDate(resource.createdAt)}
          </span>
          <span className="resource-detail-downloads">
            <i className="fas fa-download"></i> {resource.downloads} downloads
          </span>
        </div>
      </div>

      <div className="resource-detail-content">
        <div className="resource-detail-description">
          <h3>Description</h3>
          <p>{resource.description}</p>

          {resource.tags && resource.tags.length > 0 && (
            <div className="resource-detail-tags">
              <h3>Tags</h3>
              <div className="tags-container">
                {resource.tags.map((tag, index) => (
                  <span key={index} className="resource-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="resource-detail-sidebar">
          <div className="resource-detail-user">
            <h3>Uploaded by</h3>
            <div className="user-info">
              {resource.user?.avatar && (
                <img
                  src={resource.user.avatar}
                  alt={resource.user.name}
                  className="user-avatar"
                />
              )}
              <span className="user-name">{resource.user?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="resource-detail-actions">
            <button
              className="download-button"
              onClick={handleDownload}
            >
              <i className="fas fa-download"></i> Download
            </button>

            {/* Show edit button only for owner (removed button for now because edit is not working)
            {isOwner && (
              <Link
                to={`/resources/edit/${resource._id}`}
                className="edit-button"
              >
                <i className="fas fa-edit"></i> Edit
              </Link>
            )} */}

            {/* Show delete button for both owner and admin */}
            {(isOwner || isAdmin) && (
              <button
                className="delete-button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <i className="fas fa-trash-alt"></i> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this resource? This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceDetail;

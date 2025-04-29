import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './PosterTile.css';

const PosterTile = ({ announcement, onDelete }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.user) {
          setCurrentUser(decoded.user);
        }
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }
  }, []);

  // Check if user can delete this event
  const canDelete = currentUser && (
    // User is the creator of the event
    (announcement.user && announcement.user._id === currentUser.id) ||
    // Or user is an admin
    currentUser.role === 'admin'
  );

  // Determine if event is archived (past date)
  const isArchived = announcement.isArchived;

  // Determine the CSS classes based on the announcement properties
  const tileClasses = `poster-tile ${announcement.theme || 'asi'} ${announcement.urgent ? 'urgent' : ''} ${isArchived ? 'archived' : ''}`;

  // Format the date if it exists
  const formattedDate = announcement.date ? new Date(announcement.date).toLocaleDateString() : '';

  // Handle image path - if it starts with /uploads, prepend the server URL
  const imageSrc = announcement.image && announcement.image.startsWith('/uploads')
    ? `${window.location.origin}${announcement.image}`
    : announcement.image;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(announcement._id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={tileClasses}
      style={{
        gridColumn: `span ${announcement.size?.width || 1}`,
        gridRow: `span ${announcement.size?.height || 1}`
      }}
    >
      {isArchived && <div className="archived-banner">Past Event</div>}

      {imageSrc && (
        <div className="poster-image">
          <img src={imageSrc} alt={announcement.title} />
        </div>
      )}

      <div className="poster-content">
        <h3 className="poster-title">{announcement.title}</h3>

        {announcement.location && (
          <div className="poster-location">
            <span className="location-icon">📍</span> {announcement.location}
          </div>
        )}

        {formattedDate && (
          <div className="poster-date">
            <span className="date-icon">📅</span> {formattedDate}
          </div>
        )}

        {announcement.group && (
          <div className="poster-group">
            <span className="group-icon">👥</span> {announcement.group}
          </div>
        )}

        {announcement.type && (
          <div className="poster-badge">{announcement.type}</div>
        )}

        {canDelete && (
          <div className="poster-actions">
            {!showDeleteConfirm ? (
              <button
                className="delete-button"
                onClick={handleDeleteClick}
                aria-label="Delete event"
              >
                🗑️
              </button>
            ) : (
              <div className="delete-confirm">
                <p>Delete this event?</p>
                <div className="delete-buttons">
                  <button onClick={confirmDelete}>Yes</button>
                  <button onClick={cancelDelete}>No</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterTile;
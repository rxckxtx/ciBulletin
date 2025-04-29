import React from 'react';
import './PosterTile.css';

const PosterTile = ({ announcement }) => {
  // For debugging
  console.log('Rendering PosterTile with data:', announcement);

  // Determine the CSS classes based on the announcement properties
  const tileClasses = `poster-tile ${announcement.theme || 'asi'} ${announcement.urgent ? 'urgent' : ''}`;

  // Format the date if it exists
  const formattedDate = announcement.date ? new Date(announcement.date).toLocaleDateString() : '';

  // Handle image path - if it starts with /uploads, prepend the server URL
  const imageSrc = announcement.image && announcement.image.startsWith('/uploads')
    ? `${window.location.origin}${announcement.image}`
    : announcement.image;

  return (
    <div
      className={tileClasses}
      style={{
        gridColumn: `span ${announcement.size?.width || 1}`,
        gridRow: `span ${announcement.size?.height || 1}`
      }}
    >
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
      </div>
    </div>
  );
};

export default PosterTile;
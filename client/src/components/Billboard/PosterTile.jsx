import React from 'react';
import './PosterTile.css';

const PosterTile = ({ announcement }) => {
  // Determine the CSS classes based on the announcement properties
  const tileClasses = `poster-tile ${announcement.theme || 'asi'} ${announcement.urgent ? 'urgent' : ''}`;
  
  // Format the date if it exists
  const formattedDate = announcement.date ? new Date(announcement.date).toLocaleDateString() : '';
  
  return (
    <div 
      className={tileClasses}
      style={{
        gridColumn: `span ${announcement.size?.width || 1}`,
        gridRow: `span ${announcement.size?.height || 1}`
      }}
    >
      {announcement.image && (
        <div className="poster-image">
          <img src={announcement.image} alt={announcement.title} />
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
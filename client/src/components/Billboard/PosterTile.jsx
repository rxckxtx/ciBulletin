import React from 'react';
import './PosterTile.css';

const PosterTile = ({ announcement }) => {
  const { type, theme, size, urgent } = announcement;

  const tileStyle = {
    gridColumn: `span ${size.width}`,
    gridRow: `span ${size.height}`,
  };

  const getTileClasses = () => {
    const classes = ['poster-tile'];
    if (type) classes.push(`poster-type-${type}`);
    if (theme) classes.push(`theme-${theme}`);
    if (urgent) classes.push('poster-type-urgent');
    return classes.join(' ');
  };

  const renderIcon = () => {
    return <div className={`poster-icon poster-icon-${type}`} />;
  };

  const renderContent = () => {
    if (announcement.image) {
      return (
        <div className="poster-image">
          <img src={announcement.image} alt={announcement.title} />
        </div>
      );
    }
    return (
      <div className={`poster-default poster-type-${type}`}>
        <div className="poster-default-content">
          {renderIcon()}
          <h3>{announcement.title}</h3>
        </div>
      </div>
    );
  };

  return (
    <div className={getTileClasses()} style={tileStyle}>
      {renderContent()}
      <div className="poster-info">
        <div className="poster-metadata">
          <p><strong>Where:</strong> {announcement.location}</p>
          <p><strong>When:</strong> {announcement.date}</p>
          <p><strong>By:</strong> {announcement.group}</p>
        </div>
      </div>
    </div>
  );
};

export default PosterTile;
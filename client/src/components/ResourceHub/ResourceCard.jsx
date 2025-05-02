import React from 'react';
import { Link } from 'react-router-dom';
import { downloadResource } from '../../services/api';
import './ResourceCard.css';

const ResourceCard = ({ resource }) => {
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic':
        return '#4285F4'; // Blue
      case 'club':
        return '#34A853'; // Green
      case 'event':
        return '#FBBC05'; // Yellow
      case 'administrative':
        return '#EA4335'; // Red
      default:
        return '#9AA0A6'; // Gray
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    downloadResource(resource._id);
  };

  return (
    <div className="resource-card">
      <div className="resource-card-icon">
        <i className={`fas ${getFileIcon(resource.fileType)}`} style={{ color: getCategoryColor(resource.category) }}></i>
      </div>
      
      <div className="resource-card-content">
        <Link to={`/resources/${resource._id}`} className="resource-card-title">
          {resource.title}
        </Link>
        
        <p className="resource-card-description">
          {resource.description.length > 100 
            ? `${resource.description.substring(0, 100)}...` 
            : resource.description}
        </p>
        
        <div className="resource-card-meta">
          <span className="resource-card-category" style={{ backgroundColor: getCategoryColor(resource.category) }}>
            {resource.category}
          </span>
          <span className="resource-card-type">{resource.fileType.toUpperCase()}</span>
          <span className="resource-card-date">Added: {formatDate(resource.createdAt)}</span>
          <span className="resource-card-downloads">
            <i className="fas fa-download"></i> {resource.downloads}
          </span>
        </div>
        
        <div className="resource-card-user">
          {resource.user?.avatar && (
            <img 
              src={resource.user.avatar} 
              alt={resource.user.name} 
              className="resource-card-avatar" 
            />
          )}
          <span>By {resource.user?.name || 'Unknown'}</span>
        </div>
      </div>
      
      <div className="resource-card-actions">
        <button 
          className="resource-download-btn" 
          onClick={handleDownload}
          title="Download resource"
        >
          <i className="fas fa-download"></i>
        </button>
        <Link 
          to={`/resources/${resource._id}`} 
          className="resource-details-btn"
          title="View details"
        >
          <i className="fas fa-info-circle"></i>
        </Link>
      </div>
    </div>
  );
};

export default ResourceCard;

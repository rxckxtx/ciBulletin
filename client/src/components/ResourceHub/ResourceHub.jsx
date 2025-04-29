import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchResources } from '../../services/api';
import ResourceCard from './ResourceCard';
import ResourceFilter from './ResourceFilter';
import './ResourceHub.css';

const ResourceHub = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    fileType: '',
    search: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 1
  });

  useEffect(() => {
    loadResources();
  }, [filters.category, filters.fileType, filters.page]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await fetchResources(filters);
      setResources(data.resources);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    // Reset to page 1 when filters change
    setFilters({ ...newFilters, page: 1 });
  };

  const handleSearch = (searchTerm) => {
    setFilters({ ...filters, search: searchTerm, page: 1 });
    loadResources();
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="resource-hub-container">
      <div className="resource-hub-header">
        <h1>Resource Hub</h1>
        <p>Find and share useful resources with the community</p>
        <Link to="/resources/new" className="create-resource-btn">Upload New Resource</Link>
      </div>

      <ResourceFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onSearch={handleSearch} 
      />

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="no-resources">
          <p>No resources found matching your criteria.</p>
          <Link to="/resources/new" className="create-resource-btn">Be the first to upload a resource</Link>
        </div>
      ) : (
        <>
          <div className="resources-grid">
            {resources.map(resource => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResourceHub;

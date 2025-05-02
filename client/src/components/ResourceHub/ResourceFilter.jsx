import React, { useState } from 'react';
import './ResourceFilter.css';

const ResourceFilter = ({ filters, onFilterChange, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'academic', name: 'Academic' },
    { id: 'club', name: 'Club' },
    { id: 'event', name: 'Event' },
    { id: 'administrative', name: 'Administrative' },
    { id: 'general', name: 'General' }
  ];

  const fileTypes = [
    { id: '', name: 'All Types' },
    { id: 'pdf', name: 'PDF' },
    { id: 'word', name: 'Word' },
    { id: 'powerpoint', name: 'PowerPoint' },
    { id: 'excel', name: 'Excel' },
    { id: 'text', name: 'Text' },
    { id: 'image', name: 'Image' }
  ];

  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handleFileTypeChange = (e) => {
    onFilterChange({ ...filters, fileType: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    onFilterChange({
      category: '',
      fileType: '',
      search: '',
      page: 1,
      limit: filters.limit
    });
  };

  return (
    <div className="resource-filter">
      <form onSubmit={handleSearchSubmit} className="resource-search-form">
        <input
          type="text"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="resource-search-input"
        />
        <button type="submit" className="resource-search-btn">
          <i className="fas fa-search"></i>
        </button>
      </form>

      <div className="resource-filter-options">
        <select
          value={filters.category}
          onChange={handleCategoryChange}
          className="resource-filter-select"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={filters.fileType}
          onChange={handleFileTypeChange}
          className="resource-filter-select"
        >
          {fileTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleClearFilters}
          className="resource-filter-clear"
          type="button"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default ResourceFilter;

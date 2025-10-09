import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * FarmerFactoryDirectoryPage Component
 * 
 * Page for farmers to view and search through Factories.
 * Includes search functionality, filtering, and displays factory data in a card format.
 */
const FarmerFactoryDirectoryPage = () => {
  const [factories, setFactories] = useState([]);
  const [filteredFactories, setFilteredFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchFactories();
  }, []);

  useEffect(() => {
    filterAndSortFactories();
  }, [factories, searchTerm, selectedLocation, selectedCapacity, sortBy]);

  const fetchFactories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Make API request with Authorization header
      const response = await axios.get('/api/farmer/factories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const factoryData = response.data.data || response.data.factories || [];
      setFactories(factoryData);
    } catch (err) {
      console.error('Error fetching factories:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch factory directory. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFactories = () => {
    let filtered = [...factories];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(factory =>
        factory.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.contactPhone?.includes(searchTerm) ||
        factory.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(factory =>
        factory.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Apply capacity filter
    if (selectedCapacity) {
      const capacity = parseInt(selectedCapacity);
      filtered = filtered.filter(factory => {
        const factoryCapacity = factory.processingCapacity || 0;
        switch (selectedCapacity) {
          case 'small':
            return factoryCapacity < 1000;
          case 'medium':
            return factoryCapacity >= 1000 && factoryCapacity < 5000;
          case 'large':
            return factoryCapacity >= 5000;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        case 'capacity':
          return (b.processingCapacity || 0) - (a.processingCapacity || 0);
        case 'established':
          return new Date(b.establishedYear || 0) - new Date(a.establishedYear || 0);
        default:
          return 0;
      }
    });

    setFilteredFactories(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleCapacityChange = (e) => {
    setSelectedCapacity(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedCapacity('');
    setSortBy('name');
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(factories
    .map(factory => factory.location)
    .filter(location => location)
  )];

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCapacityColor = (capacity) => {
    if (!capacity) return '#666';
    if (capacity < 1000) return '#ff9800';
    if (capacity < 5000) return '#2196f3';
    return '#4caf50';
  };

  const getCapacityLabel = (capacity) => {
    if (!capacity) return 'Unknown';
    if (capacity < 1000) return 'Small Scale';
    if (capacity < 5000) return 'Medium Scale';
    return 'Large Scale';
  };

  return (
    <div className="factory-directory-page">
      <div className="page-header">
        <h1>Factory Directory</h1>
        <p className="page-subtitle">
          Discover processing facilities and manufacturing partners
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-controls">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, location, email, phone, or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((location, index) => (
                <option key={index} value={location}>
                  📍 {location}
                </option>
              ))}
            </select>

            <select
              value={selectedCapacity}
              onChange={handleCapacityChange}
              className="filter-select"
            >
              <option value="">All Capacities</option>
              <option value="small">🏭 Small Scale (&lt;1,000)</option>
              <option value="medium">🏭 Medium Scale (1,000-5,000)</option>
              <option value="large">🏭 Large Scale (5,000+)</option>
            </select>

            <select
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="location">Sort by Location</option>
              <option value="capacity">Sort by Capacity</option>
              <option value="established">Sort by Established Year</option>
            </select>

            <button
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="results-info">
          <span className="results-count">
            {filteredFactories.length} of {factories.length} factories found
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading factory directory...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Directory</h3>
            <p className="error-message">{error}</p>
            <button 
              onClick={fetchFactories} 
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredFactories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏭</div>
            <h3>No Factories Found</h3>
            <p>
              {searchTerm || selectedLocation || selectedCapacity
                ? 'Try adjusting your search or filter criteria.' 
                : 'No factories are currently available in the directory.'
              }
            </p>
            {(searchTerm || selectedLocation || selectedCapacity) && (
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="factory-grid">
            {filteredFactories.map((factory) => (
              <div key={factory._id} className="factory-card">
                <div className="card-header">
                  <div className="factory-avatar">
                    <span className="avatar-icon">🏭</span>
                  </div>
                  <div className="factory-basic-info">
                    <h3 className="factory-name">{factory.name || 'Unknown Factory'}</h3>
                    <p className="factory-location">📍 {factory.location || 'Location not specified'}</p>
                    <span 
                      className="capacity-badge"
                      style={{ backgroundColor: getCapacityColor(factory.processingCapacity) }}
                    >
                      {getCapacityLabel(factory.processingCapacity)}
                    </span>
                  </div>
                </div>

                <div className="card-content">
                  {factory.description && (
                    <div className="factory-description">
                      <p>{factory.description}</p>
                    </div>
                  )}

                  <div className="factory-details">
                    <div className="detail-item">
                      <span className="detail-label">Processing Capacity:</span>
                      <span className="detail-value">
                        {factory.processingCapacity ? `${formatNumber(factory.processingCapacity)} tons/day` : 'N/A'}
                      </span>
                    </div>
                    
                    {factory.establishedYear && (
                      <div className="detail-item">
                        <span className="detail-label">Established:</span>
                        <span className="detail-value">{factory.establishedYear}</span>
                      </div>
                    )}

                    {factory.specialization && factory.specialization.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-label">Specialization:</span>
                        <div className="specialization-tags">
                          {factory.specialization.map((spec, index) => (
                            <span key={index} className="spec-tag">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="contact-info">
                    {factory.contactEmail && (
                      <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        <span className="contact-text">{factory.contactEmail}</span>
                      </div>
                    )}
                    {factory.contactPhone && (
                      <div className="contact-item">
                        <span className="contact-icon">📱</span>
                        <span className="contact-text">{factory.contactPhone}</span>
                      </div>
                    )}
                    {factory.website && (
                      <div className="contact-item">
                        <span className="contact-icon">🌐</span>
                        <a 
                          href={factory.website.startsWith('http') ? factory.website : `https://${factory.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="contact-link"
                        >
                          {factory.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="factory-meta">
                    <div className="meta-item">
                      <span className="meta-label">Added to directory:</span>
                      <span className="meta-value">{formatDate(factory.createdAt)}</span>
                    </div>
                    {factory.isActive !== undefined && (
                      <div className="meta-item">
                        <span className="meta-label">Status:</span>
                        <span className={`status-badge ${factory.isActive ? 'active' : 'inactive'}`}>
                          {factory.isActive ? '✅ Active' : '⚪ Inactive'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="contact-btn"
                    onClick={() => {
                      if (factory.contactEmail) {
                        window.location.href = `mailto:${factory.contactEmail}`;
                      }
                    }}
                  >
                    📧 Contact
                  </button>
                  {factory.website && (
                    <button 
                      className="visit-website-btn"
                      onClick={() => {
                        const url = factory.website.startsWith('http') ? factory.website : `https://${factory.website}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      🌐 Visit Website
                    </button>
                  )}
                  <button 
                    className="view-details-btn"
                    onClick={() => {
                      // TODO: Implement view details functionality
                      alert('View details functionality coming soon!');
                    }}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .factory-directory-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .page-header h1 {
          color: #2c5530;
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        .filter-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-input-group {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.5rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #4caf50;
        }

        .filter-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .filter-select,
        .sort-select {
          padding: 0.875rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select:focus,
        .sort-select:focus {
          outline: none;
          border-color: #4caf50;
        }

        .clear-filters-btn {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .results-info {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .results-count {
          color: #666;
          font-size: 0.9rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: #fff5f5;
          border-radius: 12px;
          border: 2px solid #fed7d7;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-container h3 {
          color: #e53e3e;
          margin: 0 0 0.5rem 0;
        }

        .error-message {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #45a049;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: #2c5530;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .factory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .factory-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid transparent;
        }

        .factory-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border-color: #4caf50;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .factory-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff9800, #f57c00);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .avatar-icon {
          font-size: 1.5rem;
          color: white;
        }

        .factory-basic-info {
          flex: 1;
        }

        .factory-name {
          margin: 0 0 0.5rem 0;
          color: #2c5530;
          font-size: 1.2rem;
          line-height: 1.3;
        }

        .factory-location {
          margin: 0 0 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .capacity-badge {
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .factory-description {
          margin-bottom: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #4caf50;
        }

        .factory-description p {
          margin: 0;
          color: #495057;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .factory-details {
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }

        .detail-label {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
          flex-shrink: 0;
        }

        .detail-value {
          color: #495057;
          font-size: 0.9rem;
          text-align: right;
        }

        .specialization-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }

        .spec-tag {
          background: #e3f2fd;
          color: #1976d2;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .contact-info {
          margin-bottom: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .contact-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .contact-icon {
          width: 20px;
          margin-right: 0.5rem;
        }

        .contact-text {
          color: #495057;
          font-size: 0.9rem;
        }

        .contact-link {
          color: #1976d2;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        .factory-meta {
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .meta-label {
          color: #666;
          font-size: 0.8rem;
        }

        .meta-value {
          color: #495057;
          font-size: 0.8rem;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status-badge.inactive {
          background: #f5f5f5;
          color: #666;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .contact-btn,
        .visit-website-btn,
        .view-details-btn {
          flex: 1;
          min-width: 120px;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .contact-btn {
          background: #4caf50;
          color: white;
        }

        .contact-btn:hover {
          background: #45a049;
        }

        .visit-website-btn {
          background: #1976d2;
          color: white;
        }

        .visit-website-btn:hover {
          background: #1565c0;
        }

        .view-details-btn {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
        }

        .view-details-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        @media (max-width: 768px) {
          .factory-directory-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .search-controls {
            flex-direction: column;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select,
          .sort-select,
          .clear-filters-btn {
            width: 100%;
          }

          .factory-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .card-actions {
            flex-direction: column;
          }

          .contact-btn,
          .visit-website-btn,
          .view-details-btn {
            min-width: auto;
          }

          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .detail-value {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default FarmerFactoryDirectoryPage;
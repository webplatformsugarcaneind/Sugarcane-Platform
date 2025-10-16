    import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * HHMFactoryDirectoryPage Component
 * 
 * Page for HHM users to view and search through Factories.
 * Includes search functionality, filtering, and displays factory data in a card format.
 * Customized for HHM user perspective with emphasis on partnership and collaboration.
 */
const HHMFactoryDirectoryPage = () => {
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

  const filterAndSortFactories = useCallback(() => {
    // Ensure factories is always an array
    if (!Array.isArray(factories)) {
      console.warn('Factories is not an array:', factories);
      setFilteredFactories([]);
      return;
    }
    
    let filtered = [...factories];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(factory =>
        factory.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.contactInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.contactInfo?.phone?.includes(searchTerm) ||
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
      filtered = filtered.filter(factory => {
        // Extract numeric value from capacity string (e.g., "2800 TCD" -> 2800)
        const capacityStr = factory.capacity || '';
        const factoryCapacity = parseInt(capacityStr.match(/\d+/)?.[0] || '0');
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
          // Extract numeric value from capacity string for sorting
          const aCapacity = parseInt((a.capacity || '').match(/\d+/)?.[0] || '0');
          const bCapacity = parseInt((b.capacity || '').match(/\d+/)?.[0] || '0');
          return bCapacity - aCapacity;
        case 'established':
          return new Date(b.establishedYear || 0) - new Date(a.establishedYear || 0);
        default:
          return 0;
      }
    });

    setFilteredFactories(filtered);
  }, [factories, searchTerm, selectedLocation, selectedCapacity, sortBy]);

  useEffect(() => {
    filterAndSortFactories();
  }, [factories, searchTerm, selectedLocation, selectedCapacity, sortBy, filterAndSortFactories]);

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

      // Use public API endpoint since HHM users need to see factory directory
      const response = await axios.get('/api/public/factories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('HHM Full API response:', response.data);
      
      // The API returns: { success: true, data: { factories: [...] } }
      const factoryData = response.data.data?.factories || response.data.factories || response.data || [];
      console.log('HHM Factory data received:', factoryData);
      console.log('Is array?', Array.isArray(factoryData));
      
      // Ensure we always set an array
      if (Array.isArray(factoryData)) {
        setFactories(factoryData);
      } else {
        console.warn('Factory data is not an array:', factoryData);
        setFactories([]);
      }
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
  const uniqueLocations = [...new Set(
    (Array.isArray(factories) ? factories : [])
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
    const numericCapacity = parseInt(capacity.match(/\d+/)?.[0] || '0');
    if (numericCapacity < 1000) return '#ff9800';
    if (numericCapacity < 5000) return '#2196f3';
    return '#4caf50';
  };

  const getCapacityLabel = (capacity) => {
    if (!capacity) return 'Unknown';
    const numericCapacity = parseInt(capacity.match(/\d+/)?.[0] || '0');
    if (numericCapacity < 1000) return 'Small Scale';
    if (numericCapacity < 5000) return 'Medium Scale';
    return 'Large Scale';
  };

  return (
    <div className="factory-directory-page">
      <div className="page-header">
        <h1>🏭 Factory Partnership Directory</h1>
        <p className="page-subtitle">
          Connect with processing facilities for strategic partnerships and worker placement opportunities
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-controls">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search factories for partnership opportunities..."
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
            {filteredFactories.length} partnership opportunities found
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading factory partnership directory...</p>
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
            <h3>No Partnership Opportunities Found</h3>
            <p>
              {searchTerm || selectedLocation || selectedCapacity
                ? 'Try adjusting your search or filter criteria.' 
                : 'No factories are currently available for partnerships.'
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
                  </div>
                  <div className="capacity-badge" style={{ backgroundColor: getCapacityColor(factory.capacity) }}>
                    {getCapacityLabel(factory.capacity)}
                  </div>
                </div>

                <div className="card-body">
                  <div className="factory-stats">
                    <div className="stat-item">
                      <span className="stat-label">Processing Capacity:</span>
                      <span className="stat-value">{factory.capacity || 'N/A'}</span>
                    </div>
                    {factory.establishedYear && (
                      <div className="stat-item">
                        <span className="stat-label">Established:</span>
                        <span className="stat-value">{factory.establishedYear}</span>
                      </div>
                    )}
                    {factory.operatingHours && (
                      <div className="stat-item">
                        <span className="stat-label">Operating Hours:</span>
                        <span className="stat-value">
                          {typeof factory.operatingHours === 'object' 
                            ? (factory.operatingHours.season 
                                ? `${factory.operatingHours.season}${factory.operatingHours.daily ? ' - ' + factory.operatingHours.daily : factory.operatingHours.monday ? ' - ' + factory.operatingHours.monday : ''}`
                                : 'Contact for schedule'
                              )
                            : factory.operatingHours}
                        </span>
                      </div>
                    )}
                  </div>

                  {factory.description && (
                    <div className="factory-description">
                      <p>{factory.description}</p>
                    </div>
                  )}

                  <div className="partnership-opportunities">
                    <h4>🤝 Partnership Opportunities:</h4>
                    <div className="opportunity-tags">
                      <span className="opportunity-tag">👥 Worker Placement</span>
                      <span className="opportunity-tag">⚙️ Maintenance Support</span>
                      <span className="opportunity-tag">📊 Operations Coordination</span>
                    </div>
                  </div>

                  <div className="contact-info">
                    <h4>📞 Contact Information:</h4>
                    <div className="contact-details">
                      {factory.contactInfo?.email && (
                        <div className="contact-item">
                          <span className="contact-icon">📧</span>
                          <a href={`mailto:${factory.contactInfo.email}`} className="contact-link">
                            {factory.contactInfo.email}
                          </a>
                        </div>
                      )}
                      {factory.contactInfo?.phone && (
                        <div className="contact-item">
                          <span className="contact-icon">📱</span>
                          <a href={`tel:${factory.contactInfo.phone}`} className="contact-link">
                            {factory.contactInfo.phone}
                          </a>
                        </div>
                      )}
                      {factory.contactInfo?.website && (
                        <div className="contact-item">
                          <span className="contact-icon">🌐</span>
                          <a 
                            href={factory.contactInfo.website.startsWith('http') ? factory.contactInfo.website : `https://${factory.contactInfo.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact-link"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="action-buttons">
                    <button className="contact-btn primary">
                      🤝 Initiate Partnership
                    </button>
                    <button className="contact-btn secondary">
                      📋 View Details
                    </button>
                  </div>
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
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
          background: white;
          color: #2c5f2d;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .page-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 600;
          color: #2c5f2d;
        }

        .page-subtitle {
          margin: 0;
          font-size: 1.1rem;
          color: #666;
        }

        .filter-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
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
          font-size: 1.2rem;
          color: #666;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .search-input:focus {
          outline: none;
          border-color: #2c5f2d;
          box-shadow: 0 0 0 3px rgba(44, 95, 45, 0.1);
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-select, .sort-select {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          min-width: 150px;
          transition: border-color 0.2s;
        }

        .filter-select:focus, .sort-select:focus {
          outline: none;
          border-color: #2c5f2d;
        }

        .clear-filters-btn {
          padding: 0.75rem 1.5rem;
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .results-info {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .results-count {
          color: #2c5f2d;
          font-weight: 500;
        }

        .content-section {
          margin-top: 2rem;
        }

        .loading-container, .error-container, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #2c5f2d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon, .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-message {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          padding: 0.75rem 1.5rem;
          background: #4a7c59;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
        }

        .factory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .factory-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid #e1e5e9;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%);
          border-bottom: 1px solid #e1e5e9;
        }

        .factory-avatar {
          background: linear-gradient(135deg, #2c5f2d, #4a7c59);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .factory-basic-info {
          flex: 1;
        }

        .factory-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .factory-location {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .capacity-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .card-body {
          padding: 1.5rem;
        }

        .factory-stats {
          margin-bottom: 1.5rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f2f5;
        }

        .stat-item:last-child {
          border-bottom: none;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }

        .stat-value {
          font-weight: 500;
          color: #2c3e50;
        }

        .factory-description {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9ff;
          border-left: 4px solid #667eea;
          border-radius: 0 8px 8px 0;
        }

        .factory-description p {
          margin: 0;
          color: #555;
          line-height: 1.5;
        }

        .partnership-opportunities {
          margin-bottom: 1.5rem;
        }

        .partnership-opportunities h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .opportunity-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .opportunity-tag {
          background: linear-gradient(135deg, #2c5f2d 0%, #4a7c59 100%);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .contact-info h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-icon {
          font-size: 1rem;
        }

        .contact-link {
          color: #4a7c59;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .card-footer {
          padding: 1rem 1.5rem;
          background: #f0f8f0;
          border-top: 1px solid #e1e5e9;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .contact-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .contact-btn.primary {
          background: linear-gradient(135deg, #2c5f2d 0%, #4a7c59 100%);
          color: white;
        }

        .contact-btn.secondary {
          background: white;
          color: #4a7c59;
          border: 2px solid #4a7c59;
        }

        @media (max-width: 768px) {
          .factory-directory-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .filter-controls {
            flex-direction: column;
          }

          .filter-select, .sort-select {
            min-width: auto;
          }

          .factory-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default HHMFactoryDirectoryPage;
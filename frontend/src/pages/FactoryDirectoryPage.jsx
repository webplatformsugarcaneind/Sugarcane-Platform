import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FactoryDirectoryPage.css';

/**
 * FactoryDirectoryPage Component
 * 
 * Page for Factory users to view and connect with other factories.
 * Includes search functionality, filtering, and displays factory data in a card format.
 * Customized for Factory user perspective with emphasis on networking and collaboration.
 */
const FactoryDirectoryPage = () => {
  const navigate = useNavigate();
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
    }    // Apply location filter
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
    }    // Apply sorting
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

      // Use public API endpoint since Factory users need to see other factories
      const response = await axios.get('/api/public/factories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Full API response:', response.data);

      // The API returns: { success: true, data: { factories: [...] } }
      const factoryData = response.data.data?.factories || response.data.factories || response.data || [];
      console.log('Factory data received:', factoryData);
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

  const handleViewProfile = (factoryId) => {
    navigate(`/factory/factory-directory/${factoryId}`);
  };

  return (
    <div className="factory-directory-page">
      <div className="page-header">
        <h1>🏭 Factory Network Directory</h1>
        <p className="page-subtitle">
          Connect and collaborate with fellow factories in the sugarcane processing network
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-controls">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search for factories to connect and collaborate with..."
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
            {filteredFactories.length} network connections available
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading factory network directory...</p>
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
            <h3>No Network Connections Found</h3>
            <p>
              {searchTerm || selectedLocation || selectedCapacity
                ? 'Try adjusting your search or filter criteria.'
                : 'No factories are currently available in the network.'
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
              <div key={factory.id || factory._id} className="factory-card">
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

                  <div className="collaboration-opportunities">
                    <h4>🤝 Collaboration Opportunities:</h4>
                    <div className="opportunity-tags">
                      <span className="opportunity-tag">🔄 Resource Sharing</span>
                      <span className="opportunity-tag">⚙️ Technical Exchange</span>
                      <span className="opportunity-tag">📊 Best Practices</span>
                      <span className="opportunity-tag">🚚 Logistics Coordination</span>
                    </div>
                  </div>

                  <div className="contact-info">
                    <h4>📞 Connect With Factory:</h4>
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
                      🌐 Connect & Collaborate
                    </button>
                    <button
                      className="contact-btn secondary"
                      onClick={() => handleViewProfile(factory.id || factory._id)}
                    >
                      📋 View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryDirectoryPage;

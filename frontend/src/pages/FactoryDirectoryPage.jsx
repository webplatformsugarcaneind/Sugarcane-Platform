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
        case 'capacity': {
          // Extract numeric value from capacity string for sorting
          const aCapacity = parseInt((a.capacity || '').match(/\d+/)?.[0] || '0');
          const bCapacity = parseInt((b.capacity || '').match(/\d+/)?.[0] || '0');
          return bCapacity - aCapacity;
        }
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

  const handleViewProfile = (factoryId) => {
    navigate(`/factory/factory-directory/${factoryId}`);
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(
    (Array.isArray(factories) ? factories : [])
      .map(factory => factory.location)
      .filter(location => location)
  )];

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
        <h1>
          <svg style={{ display: 'inline-block', width: '36px', height: '36px', marginRight: '10px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="10" width="18" height="11" strokeWidth="2" />
            <rect x="7" y="3" width="4" height="7" strokeWidth="2" />
            <rect x="13" y="3" width="4" height="7" strokeWidth="2" />
            <line x1="9" y1="5" x2="9" y2="6" strokeWidth="2" strokeLinecap="round" />
            <line x1="15" y1="5" x2="15" y2="6" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Factory Network Directory
        </h1>
        <p className="page-subtitle">
          Connect and collaborate with fellow factories in the sugarcane processing network
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-controls">
          <div className="search-input-group">
            <span className="search-icon">
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
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
                  {location}
                </option>
              ))}
            </select>

            <select
              value={selectedCapacity}
              onChange={handleCapacityChange}
              className="filter-select"
            >
              <option value="">All Capacities</option>
              <option value="small">Small Scale (&lt;1,000)</option>
              <option value="medium">Medium Scale (1,000-5,000)</option>
              <option value="large">Large Scale (5,000+)</option>
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
            <div className="error-icon">
              <svg style={{ width: '48px', height: '48px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" />
                <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12" y2="17" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
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
            <div className="empty-icon">
              <svg style={{ width: '64px', height: '64px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="10" width="18" height="11" strokeWidth="2" />
                <rect x="7" y="3" width="4" height="7" strokeWidth="2" />
                <rect x="13" y="3" width="4" height="7" strokeWidth="2" />
                <line x1="9" y1="5" x2="9" y2="6" strokeWidth="2" strokeLinecap="round" />
                <line x1="15" y1="5" x2="15" y2="6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
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
                    <span className="avatar-icon">
                      <svg style={{ width: '28px', height: '28px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="10" width="18" height="11" strokeWidth="2" />
                        <rect x="7" y="3" width="4" height="7" strokeWidth="2" />
                        <rect x="13" y="3" width="4" height="7" strokeWidth="2" />
                      </svg>
                    </span>
                  </div>
                  <div className="factory-basic-info">
                    <h3 className="factory-name">{factory.name || 'Unknown Factory'}</h3>
                    <p className="factory-location">
                      <svg style={{ display: 'inline-block', width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" strokeWidth="2" />
                        <circle cx="12" cy="10" r="3" strokeWidth="2" />
                      </svg>
                      {factory.location || 'Location not specified'}
                    </p>
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
                    <h4>
                      <svg style={{ display: 'inline-block', width: '18px', height: '18px', marginRight: '6px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17 18a5 5 0 0 0-10 0" strokeWidth="2" />
                        <path d="M12 18v-3" strokeWidth="2" />
                        <circle cx="12" cy="9" r="4" strokeWidth="2" />
                        <path d="M17 11l2-2m0 0l2 2m-2-2v6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Collaboration Opportunities:
                    </h4>
                    <div className="opportunity-tags">
                      <span className="opportunity-tag">Resource Sharing</span>
                      <span className="opportunity-tag">Technical Exchange</span>
                      <span className="opportunity-tag">Best Practices</span>
                      <span className="opportunity-tag">Logistics Coordination</span>
                    </div>
                  </div>

                  <div className="contact-info">
                    <h4>
                      <svg style={{ display: 'inline-block', width: '18px', height: '18px', marginRight: '6px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeWidth="2" />
                      </svg>
                      Connect With Factory:
                    </h4>
                    <div className="contact-details">
                      {factory.contactInfo?.email && (
                        <div className="contact-item">
                          <span className="contact-icon">
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M3 8l9-5 9 5v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeWidth="2" />
                              <path d="M3 8l9 5 9-5" strokeWidth="2" strokeLinejoin="round" />
                            </svg>
                          </span>
                          <a href={`mailto:${factory.contactInfo.email}`} className="contact-link">
                            {factory.contactInfo.email}
                          </a>
                        </div>
                      )}
                      {factory.contactInfo?.phone && (
                        <div className="contact-item">
                          <span className="contact-icon">
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="2" />
                              <line x1="12" y1="18" x2="12" y2="18" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </span>
                          <a href={`tel:${factory.contactInfo.phone}`} className="contact-link">
                            {factory.contactInfo.phone}
                          </a>
                        </div>
                      )}
                      {factory.contactInfo?.website && (
                        <div className="contact-item">
                          <span className="contact-icon">
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
                            </svg>
                          </span>
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
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      Connect & Collaborate
                    </button>
                    <button
                      className="contact-btn secondary"
                      onClick={() => handleViewProfile(factory.id || factory._id)}
                      title="View detailed factory profile"
                    >
                      <svg style={{ display: 'inline-block', width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="8" y="2" width="8" height="4" rx="1" strokeWidth="2" />
                        <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" strokeWidth="2" />
                      </svg>
                      View Full Profile
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
          color: #2c5530;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .page-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 600;
          color: #2c5530;
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
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
          border-color: #2c5530;
          box-shadow: 0 0 0 3px rgba(44, 85, 48, 0.1);
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
          border-color: #2c5530;
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

        .clear-filters-btn:hover {
          background-color: #e55555;
          transform: translateY(-1px);
        }

        .results-info {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .results-count {
          color: #2c5530;
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
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          margin-bottom: 1rem;
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
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #ee5a24;
        }

        .factory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .factory-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .factory-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          border-color: rgba(76, 124, 89, 0.2);
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
          background: linear-gradient(135deg, #2c5530, #4caf50);
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
          color: #2c5530;
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
          background: #f1f8e9;
          border-left: 4px solid #4caf50;
          border-radius: 0 8px 8px 0;
        }

        .factory-description p {
          margin: 0;
          color: #555;
          line-height: 1.5;
        }

        .collaboration-opportunities {
          margin-bottom: 1.5rem;
        }

        .collaboration-opportunities h4 {
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
          background: linear-gradient(135deg, #2c5530 0%, #4caf50 100%);
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
          color: #4caf50;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .contact-link:hover {
          color: #2c5530;
          text-decoration: underline;
        }

        .card-footer {
          padding: 1rem 1.5rem;
          background: #f1f8e9;
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
          background: linear-gradient(135deg, #2c5530 0%, #4caf50 100%);
          color: white;
        }

        .contact-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(44, 95, 45, 0.3);
        }

        .contact-btn.secondary {
          background: white;
          color: #4a7c59;
          border: 2px solid #4a7c59;
        }

        .contact-btn.secondary:hover {
          background: #4a7c59;
          color: white;
          transform: translateY(-1px);
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

export default FactoryDirectoryPage;

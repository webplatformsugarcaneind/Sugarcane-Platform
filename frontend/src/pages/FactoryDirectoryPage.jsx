import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CRUSHING_STATUS, getCrushingStatusDisplay, DEFAULT_CRUSHING_STATUS } from '../constants/crushingStatus.js';
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
        const factoryCapacity = Number(capacityStr);
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
          const aCapacity = Number(a.capacity);
          const bCapacity = Number(b.capacity);
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
    if (!capacity) return 'var(--muted)';
    const numericCapacity = Number(capacity);
    if (numericCapacity < 1000) return 'var(--amber)';
    if (numericCapacity < 5000) return 'var(--blue)';
    return 'var(--green)';
  };

  const getCapacityLabel = (capacity) => {
    if (!capacity) return 'Unknown';
    const numericCapacity = Number(capacity);
    if (numericCapacity < 1000) return 'Small Scale';
    if (numericCapacity < 5000) return 'Medium Scale';
    return 'Large Scale';
  };

  return (
    <div className="fnd-page">
      {/* Header */}
      <div className="fnd-header">
        <div className="fnd-eyebrow">Factory Network</div>
        <h1 className="fnd-title">Factory <em>Directory</em></h1>
        <p className="fnd-sub">
          Connect and collaborate with fellow factories in the sugarcane processing network
        </p>
      </div>

      {/* Toolbar */}
      <div className="fnd-toolbar">
        <div className="fnd-search-wrap">
          <span className="fnd-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search factories by name, location…"
            value={searchTerm}
            onChange={handleSearchChange}
            className="fnd-search"
          />
        </div>

        <select value={selectedLocation} onChange={handleLocationChange} className="fnd-filter">
          <option value="">All Locations</option>
          {uniqueLocations.map((location, index) => (
            <option key={index} value={location}>📍 {location}</option>
          ))}
        </select>

        <select value={selectedCapacity} onChange={handleCapacityChange} className="fnd-filter">
          <option value="">All Capacities</option>
          <option value="small">Small (&lt;1,000)</option>
          <option value="medium">Medium (1K–5K)</option>
          <option value="large">Large (5,000+)</option>
        </select>

        <select value={sortBy} onChange={handleSortChange} className="fnd-filter">
          <option value="name">Sort: Name A–Z</option>
          <option value="location">Sort: Location</option>
          <option value="capacity">Sort: Capacity</option>
          <option value="established">Sort: Established</option>
        </select>

        <button onClick={clearFilters} className="fnd-clear-btn">Clear Filters</button>
      </div>

      <div className="fnd-results-meta">
        <div className="fnd-results-count">
          <strong>{filteredFactories.length}</strong> of {factories.length} factories found
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="fnd-empty">
            <div className="fnd-spinner"></div>
            <div className="fnd-empty-title">Loading factory network directory...</div>
          </div>
        ) : error ? (
          <div className="fnd-empty">
            <div className="fnd-empty-icon">⚠️</div>
            <div className="fnd-empty-title">Error Loading Directory</div>
            <div className="fnd-empty-sub">{error}</div>
            <button onClick={fetchFactories} className="fnd-btn-primary" style={{ marginTop: 8 }}>
              Try Again
            </button>
          </div>
        ) : filteredFactories.length === 0 ? (
          <div className="fnd-empty">
            <div className="fnd-empty-icon">🏭</div>
            <div className="fnd-empty-title">No Network Connections Found</div>
            <div className="fnd-empty-sub">
              {searchTerm || selectedLocation || selectedCapacity
                ? 'Try adjusting your search or filter criteria.'
                : 'No factories are currently available in the network.'}
            </div>
            {(searchTerm || selectedLocation || selectedCapacity) && (
              <button onClick={clearFilters} className="fnd-clear-btn">Clear All Filters</button>
            )}
          </div>
        ) : (
          <div className="fnd-grid">
            {filteredFactories.map((factory, idx) => (
              <div key={factory.id || factory._id} className="fnd-card" style={{ animation: `fndFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                <div className="fnd-card-header">
                  <div className="fnd-avatar">🏭</div>
                  <div className="fnd-card-info">
                    <div className="fnd-card-name">{factory.name || 'Unknown Factory'}</div>
                    <div className="fnd-card-location">📍 {factory.location || 'Location not specified'}</div>
                  </div>
                  <div className="fnd-badges">
                    <span className="fnd-capacity-badge" style={{ backgroundColor: getCapacityColor(factory.capacity) }}>
                      {getCapacityLabel(factory.capacity)}
                    </span>
                    <span className={`fnd-status-badge ${factory.crushingStatus === CRUSHING_STATUS.ON ? 'on' : 'off'}`}>
                      {getCrushingStatusDisplay(factory.crushingStatus || DEFAULT_CRUSHING_STATUS).icon} {factory.crushingStatus || DEFAULT_CRUSHING_STATUS}
                    </span>
                  </div>
                </div>

                <div className="fnd-card-body">
                  <div className="fnd-stats">
                    <div className="fnd-stat-item">
                      <span className="fnd-stat-label">Processing Capacity</span>
                      <span className="fnd-stat-value">{factory.capacity || 'N/A'}</span>
                    </div>
                    <div className="fnd-stat-item">
                      <span className="fnd-stat-label">Crushing Status</span>
                      <span className={`fnd-stat-value ${factory.crushingStatus === CRUSHING_STATUS.ON ? 'fnd-stat-active' : 'fnd-stat-inactive'}`}>
                        {getCrushingStatusDisplay(factory.crushingStatus || DEFAULT_CRUSHING_STATUS).icon} {factory.crushingStatus === CRUSHING_STATUS.ON ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    {factory.establishedYear && (
                      <div className="fnd-stat-item">
                        <span className="fnd-stat-label">Established</span>
                        <span className="fnd-stat-value">{factory.establishedYear}</span>
                      </div>
                    )}
                    {factory.operatingSeason && (
                      <div className="fnd-stat-item">
                        <span className="fnd-stat-label">Operating Season</span>
                        <span className="fnd-stat-value">📅 {factory.operatingSeason}</span>
                      </div>
                    )}
                  </div>

                  {factory.description && (
                    <div className="fnd-description">
                      <p>{factory.description}</p>
                    </div>
                  )}

                  <div className="fnd-collab">
                    <h4>🤝 Collaboration Opportunities</h4>
                    <div className="fnd-tags">
                      <span className="fnd-tag">🔄 Resource Sharing</span>
                      <span className="fnd-tag">⚙️ Technical Exchange</span>
                      <span className="fnd-tag">📊 Best Practices</span>
                      <span className="fnd-tag">🚚 Logistics</span>
                    </div>
                  </div>

                  <div className="fnd-contact">
                    <h4>📞 Connect With Factory</h4>
                    <div className="fnd-contact-list">
                      {factory.contactInfo?.email && (
                        <div className="fnd-contact-item">
                          <span className="fnd-contact-icon">📧</span>
                          <a href={`mailto:${factory.contactInfo.email}`} className="fnd-contact-link">
                            {factory.contactInfo.email}
                          </a>
                        </div>
                      )}
                      {factory.contactInfo?.phone && (
                        <div className="fnd-contact-item">
                          <span className="fnd-contact-icon">📱</span>
                          <a href={`tel:${factory.contactInfo.phone}`} className="fnd-contact-link">
                            {factory.contactInfo.phone}
                          </a>
                        </div>
                      )}
                      {factory.contactInfo?.website && (
                        <div className="fnd-contact-item">
                          <span className="fnd-contact-icon">🌐</span>
                          <a
                            href={factory.contactInfo.website.startsWith('http') ? factory.contactInfo.website : `https://${factory.contactInfo.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fnd-contact-link"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="fnd-actions">
                  <button className="fnd-btn-primary">🌐 Connect</button>
                  <button
                    className="fnd-btn-secondary"
                    onClick={() => handleViewProfile(factory.id || factory._id)}
                  >
                    📋 View Profile
                  </button>
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

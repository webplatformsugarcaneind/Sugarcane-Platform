import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * FactoryHHMDirectoryPage Component
 * 
 * Page for factory users to view and search through Harvest Managers (HHMs).
 * Includes search functionality, filtering, and displays HHM data in a card format.
 * Adapted for factory perspective with emphasis on harvest coordination and partnerships.
 */
const FactoryHHMDirectoryPage = () => {
  const [hhms, setHhms] = useState([]);
  const [filteredHhms, setFilteredHhms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchHHMs();
  }, []);

  useEffect(() => {
    filterAndSortHHMs();
  }, [hhms, searchTerm, selectedLocation, sortBy]);

  const fetchHHMs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Use the new factory/hhms endpoint that's specifically designed for factory users
      const response = await axios.get('/api/factory/hhms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const hhmData = response.data.data || response.data.hhms || response.data || [];
      setHhms(Array.isArray(hhmData) ? hhmData : []);
    } catch (err) {
      console.error('Error fetching HHMs:', err);
      
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError(
          'Access denied. Please ensure you are logged in with the correct Factory role.'
        );
      } else {
        setError(
          err.response?.data?.message || 
          'Failed to fetch HHM directory. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHHMs = () => {
    let filtered = [...hhms];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(hhm =>
        hhm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hhm.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hhm.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hhm.phone?.includes(searchTerm) ||
        hhm.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(hhm =>
        hhm.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        default:
          return 0;
      }
    });

    setFilteredHhms(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSortBy('name');
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(hhms
    .map(hhm => hhm.location)
    .filter(location => location)
  )];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="hhm-directory-page">
      <div className="page-header">
        <h1>🌾 Harvest Manager Directory</h1>
        <p className="page-subtitle">
          Connect with experienced Harvest Managers for efficient crop coordination
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-controls">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search harvest managers by name, specialization, location..."
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
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
              <option value="location">Sort by Location</option>
              <option value="username">Sort by Username</option>
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
            {filteredHhms.length} harvest managers available for coordination
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading harvest manager directory...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Directory</h3>
            <p className="error-message">{error}</p>
            <button 
              onClick={fetchHHMs} 
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredHhms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <h3>No Harvest Managers Found</h3>
            <p>
              {searchTerm || selectedLocation
                ? 'Try adjusting your search or filter criteria.' 
                : 'No harvest managers are currently available in the directory.'
              }
            </p>
            {(searchTerm || selectedLocation) && (
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="hhm-grid">
            {filteredHhms.map((hhm) => (
              <div key={hhm._id} className="hhm-card">
                <div className="card-header">
                  <div className="hhm-avatar">
                    <span className="avatar-icon">🌾</span>
                  </div>
                  <div className="hhm-basic-info">
                    <h3 className="hhm-name">{hhm.name || 'Unknown Name'}</h3>
                    <p className="hhm-username">@{hhm.username || 'unknown'}</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="hhm-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-value">{hhm.location || 'Location not specified'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">📧</span>
                      <span className="detail-value">{hhm.email || 'No email provided'}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📱</span>
                      <span className="detail-value">{hhm.phone || 'No phone provided'}</span>
                    </div>

                    {hhm.specialization && (
                      <div className="detail-item">
                        <span className="detail-icon">🎯</span>
                        <span className="detail-value">{hhm.specialization}</span>
                      </div>
                    )}

                    {hhm.experience && (
                      <div className="detail-item">
                        <span className="detail-icon">⭐</span>
                        <span className="detail-value">{hhm.experience} years experience</span>
                      </div>
                    )}

                    {hhm.certifications && hhm.certifications.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-icon">🏆</span>
                        <span className="detail-value">{hhm.certifications.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button className="contact-btn primary">
                      🤝 Coordinate Harvest
                    </button>
                    <button className="contact-btn secondary">
                      📋 View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hhm-directory-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 2rem;
          text-align: center;
          background: white;
          color: #2c5530;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
          border-color: #4caf50;
        }

        .clear-filters-btn {
          padding: 0.75rem 1.5rem;
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

        .error-icon, .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-container {
          background: #fff5f5;
          border: 1px solid #fed7d7;
        }

        .error-message {
          color: #e53e3e;
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
          background: #45a049;
        }

        .hhm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .hhm-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid transparent;
        }

      .hhm-card:hover {
          background: white;
          transform: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }


        .card-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e1e5e9;
        }

        .hhm-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4caf50, #45a049);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .avatar-icon {
          font-size: 1.8rem;
          color: white;
        }

        .hhm-basic-info {
          flex: 1;
        }

        .hhm-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c5530;
          margin: 0 0 0.25rem 0;
        }

        .hhm-username {
          color: #666;
          margin: 0;
          font-size: 0.9rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        .hhm-details {
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-icon {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        .detail-value {
          flex: 1;
          color: #555;
          font-size: 0.9rem;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .contact-btn {
          flex: 1;
          min-width: 120px;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .contact-btn.primary {
          background: #4caf50;
          color: white;
        }

        .contact-btn.secondary {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
        }

        @media (max-width: 768px) {
          .hhm-directory-page {
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
          }

          .filter-select, .sort-select {
            min-width: auto;
          }

          .hhm-grid {
            grid-template-columns: 1fr;
          }

          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FactoryHHMDirectoryPage;
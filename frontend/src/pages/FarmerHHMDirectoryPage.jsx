import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * FarmerHHMDirectoryPage Component
 * 
 * Page for farmers to view and search through Harvest Managers (HHMs).
 * Includes search functionality, filtering, and displays HHM data in a card format.
 */
const FarmerHHMDirectoryPage = () => {
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

      // Make API request with Authorization header
      const response = await axios.get('/api/farmer/hhms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const hhmData = response.data.data || response.data.hhms || [];
      setHhms(hhmData);
    } catch (err) {
      console.error('Error fetching HHMs:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch HHM directory. Please try again.'
      );
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
        hhm.phone?.includes(searchTerm)
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
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'phone':
          return (a.phone || '').localeCompare(b.phone || '');
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
        <h1>HHM Directory</h1>
        <p className="page-subtitle">
          Connect with Harvest Managers in your network
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-controls">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, username, email, or phone..."
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
              <option value="username">Sort by Username</option>
              <option value="email">Sort by Email</option>
              <option value="phone">Sort by Phone</option>
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
            {filteredHhms.length} of {hhms.length} HHMs found
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading HHM directory...</p>
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
            <div className="empty-icon">👥</div>
            <h3>No HHMs Found</h3>
            <p>
              {searchTerm || selectedLocation 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No Harvest Managers are currently available in the directory.'
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
                    <span className="avatar-icon">👤</span>
                  </div>
                  <div className="hhm-basic-info">
                    <h3 className="hhm-name">{hhm.name || 'Unknown Name'}</h3>
                    <p className="hhm-username">@{hhm.username}</p>
                    <span className="hhm-role">Harvest Manager</span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="contact-info">
                    {hhm.email && (
                      <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        <span className="contact-text">{hhm.email}</span>
                      </div>
                    )}
                    {hhm.phone && (
                      <div className="contact-item">
                        <span className="contact-icon">📱</span>
                        <span className="contact-text">{hhm.phone}</span>
                      </div>
                    )}
                    {hhm.location && (
                      <div className="contact-item">
                        <span className="contact-icon">📍</span>
                        <span className="contact-text">{hhm.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="hhm-meta">
                    <div className="meta-item">
                      <span className="meta-label">Member since:</span>
                      <span className="meta-value">{formatDate(hhm.createdAt)}</span>
                    </div>
                    {hhm.isActive !== undefined && (
                      <div className="meta-item">
                        <span className="meta-label">Status:</span>
                        <span className={`status-badge ${hhm.isActive ? 'active' : 'inactive'}`}>
                          {hhm.isActive ? '✅ Active' : '⚪ Inactive'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="contact-btn"
                    onClick={() => {
                      if (hhm.email) {
                        window.location.href = `mailto:${hhm.email}`;
                      }
                    }}
                  >
                    📧 Contact
                  </button>
                  <button 
                    className="view-profile-btn"
                    onClick={() => {
                      // TODO: Implement view profile functionality
                      alert('View profile functionality coming soon!');
                    }}
                  >
                    👁️ View Profile
                  </button>
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

        .hhm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
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
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border-color: #4caf50;
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
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
          font-size: 1.5rem;
          color: white;
        }

        .hhm-basic-info {
          flex: 1;
        }

        .hhm-name {
          margin: 0 0 0.25rem 0;
          color: #2c5530;
          font-size: 1.2rem;
        }

        .hhm-username {
          margin: 0 0 0.25rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .hhm-role {
          background: #e8f5e8;
          color: #2e7d32;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .card-content {
          margin-bottom: 1.5rem;
        }

        .contact-info {
          margin-bottom: 1rem;
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

        .hhm-meta {
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
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
        }

        .contact-btn,
        .view-profile-btn {
          flex: 1;
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

        .view-profile-btn {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
        }

        .view-profile-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
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
            align-items: stretch;
          }

          .filter-select,
          .sort-select,
          .clear-filters-btn {
            width: 100%;
          }

          .hhm-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FarmerHHMDirectoryPage;
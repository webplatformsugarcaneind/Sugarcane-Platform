import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * HHMFarmerDirectoryPage Component
 * 
 * Page for HHMs to view and search through Farmers.
 * Includes search functionality, filtering, and displays farmer data in a card format.
 */
const HHMFarmerDirectoryPage = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    let filtered = [...farmers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(farmer =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone?.includes(searchTerm)
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(farmer =>
        farmer.location?.toLowerCase().includes(selectedLocation.toLowerCase())
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

    setFilteredFarmers(filtered);
  }, [farmers, searchTerm, selectedLocation, sortBy]);

  const fetchFarmers = async () => {
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
      const response = await axios.get('/api/hhm/farmers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const farmerData = response.data.data || response.data.farmers || [];
      setFarmers(farmerData);
    } catch (err) {
      console.error('Error fetching farmers:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch farmer directory. Please try again.'
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

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSortBy('name');
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(farmers
    .map(farmer => farmer.location)
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
    <div className="farmer-directory-page">
      <div className="page-header">
        <h1>🌾 Farmer Directory</h1>
        <p className="page-subtitle">
          Connect with farmers in your network and manage job opportunities
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
            {filteredFarmers.length} of {farmers.length} farmers found
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="content-section">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading farmer directory...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Directory</h3>
            <p className="error-message">{error}</p>
            <button 
              onClick={fetchFarmers} 
              className="retry-button"
            >
              Try Again
            </button>
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <h3>No Farmers Found</h3>
            <p>
              {searchTerm || selectedLocation 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No farmers are currently available in the directory.'
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
          <div className="farmer-grid">
            {filteredFarmers.map((farmer) => (
              <div key={farmer._id} className="farmer-card">
                <div className="card-header">
                  <div className="farmer-avatar">
                    <span className="avatar-icon">🌾</span>
                  </div>
                  <div className="farmer-basic-info">
                    <h3 className="farmer-name">{farmer.name || 'Unknown Name'}</h3>
                    <p className="farmer-username">@{farmer.username}</p>
                    <span className="farmer-role">Farmer</span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="contact-info">
                    {farmer.email && (
                      <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        <span className="contact-text">{farmer.email}</span>
                      </div>
                    )}
                    {farmer.phone && (
                      <div className="contact-item">
                        <span className="contact-icon">📱</span>
                        <span className="contact-text">{farmer.phone}</span>
                      </div>
                    )}
                    {farmer.location && (
                      <div className="contact-item">
                        <span className="contact-icon">📍</span>
                        <span className="contact-text">{farmer.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Farm Information */}
                  {(farmer.farmSize || farmer.farmType || farmer.experience) && (
                    <div className="farm-info">
                      <h4>🚜 Farm Details</h4>
                      {farmer.farmSize && (
                        <div className="info-item">
                          <span className="info-label">Farm Size:</span>
                          <span className="info-value">{farmer.farmSize} acres</span>
                        </div>
                      )}
                      {farmer.farmType && (
                        <div className="info-item">
                          <span className="info-label">Farm Type:</span>
                          <span className="info-value">{farmer.farmType}</span>
                        </div>
                      )}
                      {farmer.experience && (
                        <div className="info-item">
                          <span className="info-label">Experience:</span>
                          <span className="info-value">{farmer.experience} years</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="farmer-meta">
                    <div className="meta-item">
                      <span className="meta-label">Member since:</span>
                      <span className="meta-value">{formatDate(farmer.createdAt)}</span>
                    </div>
                    {farmer.isActive !== undefined && (
                      <div className="meta-item">
                        <span className="meta-label">Status:</span>
                        <span className={`status-badge ${farmer.isActive ? 'active' : 'inactive'}`}>
                          {farmer.isActive ? '✅ Active' : '⚪ Inactive'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="contact-btn"
                    onClick={() => {
                      if (farmer.email) {
                        window.location.href = `mailto:${farmer.email}`;
                      }
                    }}
                  >
                    📧 Contact
                  </button>
                  <button 
                    className="view-profile-btn"
                    onClick={() => navigate(farmer._id)}
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
        .farmer-directory-page {
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
          color: #1565c0;
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
          border-color: #1565c0;
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
          border-color: #1565c0;
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
          border-top: 4px solid #1565c0;
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
          background: #1565c0;
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #0d47a1;
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
          color: #1565c0;
          margin: 0 0 0.5rem 0;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        .farmer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .farmer-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid transparent;
        }

        .farmer-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }

        .farmer-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
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

        .farmer-basic-info {
          flex: 1;
        }

        .farmer-name {
          margin: 0 0 0.25rem 0;
          color: #1565c0;
          font-size: 1.2rem;
        }

        .farmer-username {
          margin: 0 0 0.25rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .farmer-role {
          background: #e3f2fd;
          color: #1565c0;
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

        .farm-info {
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .farm-info h4 {
          margin: 0 0 0.75rem 0;
          color: #1565c0;
          font-size: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .info-label {
          color: #666;
          font-size: 0.85rem;
        }

        .info-value {
          color: #1565c0;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .farmer-meta {
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
          background: #1565c0;
          color: white;
        }

        .contact-btn:hover {
          background: #0d47a1;
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
          .farmer-directory-page {
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

          .farmer-grid {
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

export default HHMFarmerDirectoryPage;
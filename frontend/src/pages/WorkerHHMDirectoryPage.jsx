import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * WorkerHHMDirectoryPage Component
 * 
 * Page for workers/labour to view and search through HHMs (Hub Head Managers).
 * Allows workers to find and connect with HHMs for work opportunities.
 */
const WorkerHHMDirectoryPage = () => {
  const [hhms, setHhms] = useState([]);
  const [filteredHhms, setFilteredHhms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchHHMs();
  }, []);

  useEffect(() => {
    filterAndSortHHMs();
  }, [hhms, searchTerm, sortBy]);

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
      const response = await axios.get('/api/worker/hhms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const hhmData = response.data.data || [];
      console.log('📋 Fetched HHMs for worker:', hhmData.length);
      setHhms(hhmData);
    } catch (err) {
      console.error('❌ Error fetching HHMs:', err);
      let errorMessage = 'Failed to load HHM directory';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to access this directory.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortHHMs = () => {
    let filtered = [...hhms];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(hhm =>
        hhm.name?.toLowerCase().includes(term) ||
        hhm.username?.toLowerCase().includes(term) ||
        hhm.email?.toLowerCase().includes(term) ||
        hhm.phone?.toLowerCase().includes(term)
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
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredHhms(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('name');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleContactHHM = (hhm) => {
    // Create mailto link for easy contact
    const subject = encodeURIComponent('Work Opportunity Inquiry');
    const body = encodeURIComponent(
      `Hello ${hhm.name || 'there'},\n\n` +
      `I am a worker looking for employment opportunities and found your contact through the HHM Directory. ` +
      `I would like to discuss potential work opportunities.\n\n` +
      `Best regards`
    );
    
    if (hhm.email) {
      window.location.href = `mailto:${hhm.email}?subject=${subject}&body=${body}`;
    }
  };

  if (loading) {
    return (
      <div className="hhm-directory-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading HHM Directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hhm-directory-page">
        <div className="error-container">
          <h2>⚠️ Error Loading Directory</h2>
          <p>{error}</p>
          <button onClick={fetchHHMs} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hhm-directory-page">
      <div className="page-header">
        <h1>🧑‍💼 HHM Directory</h1>
        <p className="page-subtitle">
          Connect with Hub Head Managers for work opportunities
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
            <div className="filter-group">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={handleSortChange}
                className="filter-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="results-summary">
          <p>
            Showing {filteredHhms.length} of {hhms.length} HHMs
            {searchTerm && <span> matching "{searchTerm}"</span>}
          </p>
        </div>
      </div>

      {/* HHM Cards Grid */}
      <div className="hhm-grid">
        {filteredHhms.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No HHMs Found</h3>
            <p>
              {searchTerm
                ? `No HHMs match your search "${searchTerm}"`
                : 'No HHMs are currently available in the directory.'}
            </p>
            {searchTerm && (
              <button onClick={clearFilters} className="clear-search-btn">
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredHhms.map((hhm) => (
            <div key={hhm._id} className="hhm-card">
              <div className="card-header">
                <div className="hhm-avatar">
                  <span className="avatar-icon">🧑‍💼</span>
                </div>
                <div className="hhm-basic-info">
                  <h3 className="hhm-name">{hhm.name || 'Name not available'}</h3>
                  <p className="hhm-username">@{hhm.username || 'username'}</p>
                </div>
                <div className="status-badge active">
                  Active
                </div>
              </div>

              <div className="card-body">
                <div className="hhm-details">
                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <span className="detail-value">{hhm.email || 'Email not available'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📱</span>
                    <span className="detail-value">{hhm.phone || 'Phone not available'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-value">Joined {formatDate(hhm.createdAt)}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleContactHHM(hhm)}
                    className="contact-button primary"
                    disabled={!hhm.email}
                  >
                    <span className="button-icon">✉️</span>
                    Contact for Work
                  </button>
                  {hhm.phone && (
                    <a
                      href={`tel:${hhm.phone}`}
                      className="contact-button secondary"
                    >
                      <span className="button-icon">📞</span>
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .hhm-directory-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .page-subtitle {
          font-size: 1.1rem;
          color: #7f8c8d;
          margin: 0;
        }

        .filter-section {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .search-controls {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .search-input-group {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
          color: #7f8c8d;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #3498db;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .filter-group label {
          font-size: 0.9rem;
          color: #555;
          font-weight: 500;
        }

        .filter-select {
          padding: 0.5rem;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .clear-filters-btn {
          padding: 0.5rem 1rem;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.3s ease;
        }

        .clear-filters-btn:hover {
          background-color: #c0392b;
        }

        .results-summary {
          border-top: 1px solid #e9ecef;
          padding-top: 1rem;
          color: #7f8c8d;
        }

        .hhm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .hhm-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .hhm-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .hhm-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3498db, #2980b9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
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
          color: #2c3e50;
          margin: 0 0 0.25rem 0;
        }

        .hhm-username {
          color: #7f8c8d;
          margin: 0;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.active {
          background-color: #d5f4e6;
          color: #27ae60;
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

        .contact-button {
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
          transition: all 0.3s ease;
        }

        .contact-button.primary {
          background-color: #27ae60;
          color: white;
        }

        .contact-button.primary:hover:not(:disabled) {
          background-color: #219a52;
        }

        .contact-button.primary:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        .contact-button.secondary {
          background-color: #3498db;
          color: white;
        }

        .contact-button.secondary:hover {
          background-color: #2980b9;
        }

        .button-icon {
          font-size: 1rem;
        }

        .loading-container, .error-container {
          text-align: center;
          padding: 4rem 2rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e9ecef;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container h2 {
          color: #e74c3c;
          margin-bottom: 1rem;
        }

        .retry-button {
          padding: 0.75rem 1.5rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .retry-button:hover {
          background-color: #2980b9;
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .no-results-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-results h3 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .no-results p {
          color: #7f8c8d;
          margin-bottom: 1.5rem;
        }

        .clear-search-btn {
          padding: 0.75rem 1.5rem;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .clear-search-btn:hover {
          background-color: #2980b9;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hhm-directory-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .search-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input-group {
            min-width: auto;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .hhm-grid {
            grid-template-columns: 1fr;
          }

          .card-actions {
            flex-direction: column;
          }

          .contact-button {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkerHHMDirectoryPage;
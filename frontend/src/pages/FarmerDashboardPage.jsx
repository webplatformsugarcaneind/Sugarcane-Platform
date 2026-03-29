import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FarmerContractsTab from '../components/FarmerContractsTab';

/**
 * FarmerDashboardPage Component
 * 
 * Main dashboard page for farmers with tabbed interface showing:
 * - Overview (announcements and quick stats)
 * - Job Contracts (sent requests and status)
 */
const FarmerDashboardPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
<<<<<<< HEAD
        
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Make API request with Authorization header
        const response = await axios.get('/api/farmer/announcements', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setAnnouncements(response.data.announcements || []);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(
<<<<<<< HEAD
          err.response?.data?.message || 
=======
          err.response?.data?.message ||
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
          'Failed to fetch announcements. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#ff4444';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#2196f3';
    }
  };

  return (
    <div className="farmer-dashboard-page">
      <div className="dashboard-header">
<<<<<<< HEAD
        <h1>🌾 Farmer Dashboard</h1>
=======
        <h1>
          <svg style={{ display: 'inline-block', width: '40px', height: '40px', marginRight: '12px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L12 8M12 8L9 11M12 8L15 11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 8L8 14M16 8L16 14" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 16L12 22" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 18C6 16 7 14 8 14M18 18C18 16 17 14 16 14" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Farmer Dashboard
        </h1>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        <p className="dashboard-subtitle">Welcome back! Manage your farm activities and job requests.</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
<<<<<<< HEAD
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          📋 Job Contracts
=======
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <svg style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '6px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="10" width="4" height="10" rx="1" strokeWidth="2" />
            <rect x="10" y="6" width="4" height="14" rx="1" strokeWidth="2" />
            <rect x="17" y="13" width="4" height="7" rx="1" strokeWidth="2" />
          </svg>
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          <svg style={{ display: 'inline-block', width: '20px', height: '20px', marginRight: '6px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="8" y="2" width="8" height="4" rx="1" strokeWidth="2" />
            <path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" strokeWidth="2" />
            <line x1="9" y1="12" x2="15" y2="12" strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="16" x2="15" y2="16" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Job Contracts
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Announcements Section */}
            <div className="announcements-section">
<<<<<<< HEAD
              <h2 className="section-title">📢 Latest Announcements</h2>
              
=======
              <h2 className="section-title">
                <svg style={{ display: 'inline-block', width: '28px', height: '28px', marginRight: '8px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4 8v8l8 6 8-6V8l-8-6z" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M12 8v8" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8.5 10.5l7 3" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8.5 13.5l7-3" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Latest Announcements
              </h2>

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading announcements...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-message">⚠️ {error}</p>
<<<<<<< HEAD
                  <button 
                    onClick={() => window.location.reload()} 
=======
                  <button
                    onClick={() => window.location.reload()}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                    className="retry-button"
                  >
                    Retry
                  </button>
                </div>
              ) : announcements.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-message">No announcements available at the moment.</p>
                </div>
              ) : (
                <div className="announcements-grid">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="announcement-card">
                      <div className="announcement-header">
                        <h3 className="announcement-title">{announcement.title}</h3>
<<<<<<< HEAD
                        <span 
=======
                        <span
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                        >
                          {announcement.priority || 'Normal'}
                        </span>
                      </div>
<<<<<<< HEAD
                      
                      <p className="announcement-content">{announcement.content}</p>
                      
=======

                      <p className="announcement-content">{announcement.content}</p>

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                      <div className="announcement-footer">
                        <span className="announcement-date">
                          📅 {formatDate(announcement.createdAt)}
                        </span>
                        {announcement.expiresAt && (
                          <span className="announcement-expires">
                            ⏰ Expires: {formatDate(announcement.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <FarmerContractsTab />
        )}
      </div>

      <style jsx>{`
        .farmer-dashboard-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          color: #2c5530;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          color: #666;
          font-size: 1.1rem;
        }

        .tab-navigation {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e9ecef;
        }

        .tab-button {
          background: none;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          color: #6c757d;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          color: #2c5530;
          background: #f8f9fa;
        }

        .tab-button.active {
          color: #2c5530;
          border-bottom-color: #4caf50;
        }

        .tab-content {
          min-height: 400px;
        }

        .overview-tab {
          width: 100%;
        }

        .announcements-section {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .section-title {
          color: #2c5530;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #4caf50;
          padding-bottom: 0.5rem;
        }

        .loading-container {
          text-align: center;
          padding: 3rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          margin: 0 auto 1rem;
        }

        .error-container {
          text-align: center;
          padding: 2rem;
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 8px;
        }

        .error-message {
          color: #c53030;
          margin-bottom: 1rem;
        }

        .retry-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .announcements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .announcement-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .announcement-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .announcement-title {
          color: #2c5530;
          font-size: 1.2rem;
          margin: 0;
          flex: 1;
          margin-right: 1rem;
        }

        .priority-badge {
          color: white;
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .announcement-content {
          color: #555;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .announcement-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #777;
          border-top: 1px solid #e9ecef;
          padding-top: 1rem;
        }

        .announcement-date,
        .announcement-expires {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .farmer-dashboard-page {
            padding: 1rem;
          }

          .dashboard-header h1 {
            font-size: 2rem;
          }

          .tab-navigation {
            justify-content: stretch;
          }

          .tab-button {
            flex: 1;
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }

          .announcements-grid {
            grid-template-columns: 1fr;
          }

          .announcement-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .announcement-title {
            margin-right: 0;
          }

          .announcement-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FarmerDashboardPage;
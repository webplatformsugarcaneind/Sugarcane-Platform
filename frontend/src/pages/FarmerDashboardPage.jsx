import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * FarmerDashboardPage Component
 * 
 * Main dashboard page for farmers showing overview of their activities,
 * announcements, recent listings, and quick actions.
 */
const FarmerDashboardPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get JWT token from localStorage
        const token = localStorage.getItem('token');
        
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
          err.response?.data?.message || 
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
        <h1>Farmer Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening on your farm.</p>
      </div>

      {/* Announcements Section */}
      <div className="announcements-section">
        <h2 className="section-title">📢 Latest Announcements</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">⚠️ {error}</p>
            <button 
              onClick={() => window.location.reload()} 
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
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                  >
                    {announcement.priority || 'Normal'}
                  </span>
                </div>
                
                <p className="announcement-content">{announcement.content}</p>
                
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

      <style jsx>{`
        .farmer-dashboard-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
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
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
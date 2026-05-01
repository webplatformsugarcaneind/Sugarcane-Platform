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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await axios.get('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // The response shape is { success, data: { notifications: [...] } } or { data: [...] }
        setNotifications(response.data?.data?.notifications || response.data?.data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(
          err.response?.data?.message || 
          'Failed to fetch notifications. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
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

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete('/api/notifications/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  return (
    <div className="farmer-dashboard-page">
      <div className="dashboard-header">
        <h1>🌾 Farmer Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Manage your farm activities and job requests.</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
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
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Announcements Section */}
            <div className="announcements-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>🔔 Latest Notifications</h2>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    title="Clear all notifications"
                    style={{
                      background: 'none',
                      border: '1px solid #dee2e6',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      color: '#636e72',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.target.style.backgroundColor = '#e74c3c'; e.target.style.color = 'white'; e.target.style.borderColor = '#e74c3c'; }}
                    onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#636e72'; e.target.style.borderColor = '#dee2e6'; }}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading notifications...</p>
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
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-message">No notifications available at the moment.</p>
                </div>
              ) : (
                <div className="announcements-grid">
                  {notifications.map((notif) => (
                    <div key={notif._id} className="announcement-card" style={{ borderLeft: notif.isRead ? 'none' : '4px solid #4caf50' }}>
                      <div className="announcement-header">
                        <h3 className="announcement-title">{notif.type?.replace(/_/g, ' ')}</h3>
                        <span 
                          className="priority-badge"
                          style={{ backgroundColor: getPriorityColor(notif.priority) }}
                        >
                          {notif.priority || 'Normal'}
                        </span>
                      </div>
                      
                      <p className="announcement-content">{notif.message}</p>
                      
                      <div className="announcement-footer">
                        <span className="announcement-date">
                          📅 {formatDate(notif.createdAt)}
                        </span>
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

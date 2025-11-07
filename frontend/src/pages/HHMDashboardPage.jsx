import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const HHMDashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Fetch dashboard data from API
        const response = await axios.get('/api/hhm/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setDashboardData(response.data.data);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorMessage}>
          <h2>⚠️ Error Loading Dashboard</h2>
          <p>{error}</p>
          <button
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.title}>HHM Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome to your Hub Head Manager dashboard. Monitor job schedules, applications, and worker availability.
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        {/* Schedules Card */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Job Schedules</h3>
            <div style={styles.statNumbers}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{dashboardData?.schedules?.total || 0}</span>
                <span style={styles.statLabel}>Total</span>
              </div>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#27ae60' }}>{dashboardData?.schedules?.open || 0}</span>
                <span style={styles.statLabel}>Open</span>
              </div>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#e74c3c' }}>{dashboardData?.schedules?.closed || 0}</span>
                <span style={styles.statLabel}>Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Card */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Applications</h3>
            <div style={styles.statNumbers}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{dashboardData?.applications?.total || 0}</span>
                <span style={styles.statLabel}>Total</span>
              </div>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#f39c12' }}>{dashboardData?.applications?.pending || 0}</span>
                <span style={styles.statLabel}>Pending</span>
              </div>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#27ae60' }}>{dashboardData?.applications?.approved || 0}</span>
                <span style={styles.statLabel}>Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workers Card */}
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👷</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Workers</h3>
            <div style={styles.statNumbers}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{dashboardData?.workers?.total || 0}</span>
                <span style={styles.statLabel}>Total</span>
              </div>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#27ae60' }}>{dashboardData?.workers?.available || 0}</span>
                <span style={styles.statLabel}>Available</span>
              </div>
              <div style={styles.statItem}>
                <span style={{ ...styles.statValue, color: '#95a5a6' }}>{dashboardData?.workers?.unavailable || 0}</span>
                <span style={styles.statLabel}>Busy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Navigation Cards */}
      <div style={styles.quickActionsSection}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickActionsGrid}>
          {/* Factory Invitations */}
          <div
            style={styles.actionCard}
            onClick={() => navigate('/hhm/factory-invitations')}
          >
            <div style={{ ...styles.actionIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>📨</div>
            <h3 style={styles.actionTitle}>Received Factory Invitations</h3>
            <p style={styles.actionDescription}>View and respond to factory collaboration invitations</p>
            <button style={styles.actionButton}>View Invitations →</button>
          </div>

          {/* Sent Factory Invitations */}
          <div
            style={styles.actionCard}
            onClick={() => navigate('/hhm/sent-factory-invitations')}
          >
            <div style={{ ...styles.actionIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>📤</div>
            <h3 style={styles.actionTitle}>Sent Factory Invitations</h3>
            <p style={styles.actionDescription}>View invitations you sent to factories</p>
            <button style={styles.actionButton}>View Sent →</button>
          </div>

          {/* Associated Factories */}
          <div
            style={styles.actionCard}
            onClick={() => navigate('/hhm/associated-factories')}
          >
            <div style={{ ...styles.actionIcon, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>🏭</div>
            <h3 style={styles.actionTitle}>My Factories</h3>
            <p style={styles.actionDescription}>Manage your associated factories and collaborations</p>
            <button style={styles.actionButton}>View Factories →</button>
          </div>

          {/* Performance Dashboard */}
          <div
            style={styles.actionCard}
            onClick={() => navigate('/hhm/performance')}
          >
            <div style={{ ...styles.actionIcon, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>📊</div>
            <h3 style={styles.actionTitle}>My Performance</h3>
            <p style={styles.actionDescription}>Track your success metrics and KPIs</p>
            <button style={styles.actionButton}>View Performance →</button>
          </div>

          {/* Notification Center */}
          <div
            style={styles.actionCard}
            onClick={() => navigate('/hhm/notifications')}
          >
            <div style={{ ...styles.actionIcon, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>🔔</div>
            <h3 style={styles.actionTitle}>Notifications</h3>
            <p style={styles.actionDescription}>Stay updated with important activities</p>
            {dashboardData?.notifications?.unread > 0 && (
              <div style={styles.notificationBadge}>{dashboardData.notifications.unread} New</div>
            )}
            <button style={styles.actionButton}>View All →</button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.recentActivity}>
        <h2 style={styles.sectionTitle}>Recent Activity</h2>
        <div style={styles.activityPlaceholder}>
          <div style={styles.placeholderIcon}>📊</div>
          <p style={styles.placeholderText}>Recent activity tracking is coming soon!</p>
          <p style={styles.placeholderSubtext}>
            We're building a comprehensive activity feed to help you track applications,
            schedule updates, and worker interactions.
          </p>
        </div>
      </div>
    </div>
  );
};

// Styles object
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    color: '#2d3436',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#636e72',
    margin: '0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
    cursor: 'pointer'
  },
  statIcon: {
    fontSize: '3rem',
    marginRight: '1rem'
  },
  statContent: {
    flex: 1
  },
  statTitle: {
    fontSize: '1.2rem',
    color: '#2d3436',
    margin: '0 0 1rem 0'
  },
  statNumbers: {
    display: 'flex',
    gap: '1rem'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#636e72'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  recentActivity: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  activityPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    textAlign: 'center'
  },
  placeholderIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.6
  },
  placeholderText: {
    fontSize: '1.2rem',
    color: '#2d3436',
    margin: '0 0 0.5rem 0',
    fontWeight: '500'
  },
  placeholderSubtext: {
    fontSize: '1rem',
    color: '#636e72',
    margin: '0',
    maxWidth: '400px',
    lineHeight: 1.5
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  errorMessage: {
    textAlign: 'center',
    padding: '4rem',
    color: '#e74c3c'
  },
  retryButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem'
  },
  quickActionsSection: {
    marginBottom: '3rem'
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  actionIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    marginBottom: '1rem',
    color: 'white'
  },
  actionTitle: {
    fontSize: '1.2rem',
    color: '#2d3436',
    margin: '0 0 0.5rem 0',
    fontWeight: '600'
  },
  actionDescription: {
    fontSize: '0.95rem',
    color: '#636e72',
    margin: '0 0 1rem 0',
    lineHeight: '1.5'
  },
  actionButton: {
    backgroundColor: 'transparent',
    border: '2px solid #667eea',
    color: '#667eea',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    marginTop: 'auto'
  },
  notificationBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '0.3rem 0.8rem',
    borderRadius: '50px',
    fontSize: '0.8rem',
    fontWeight: '600'
  }
};

export default HHMDashboardPage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HHMDashboardPage = () => {
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

        // Mock data for now - replace with actual API call
        setTimeout(() => {
          const mockData = {
            schedules: {
              open: 12,
              closed: 8,
              total: 20
            },
            applications: {
              pending: 25,
              approved: 18,
              rejected: 7,
              total: 50
            },
            workers: {
              available: 150,
              unavailable: 30,
              total: 180
            }
          };
          
          setDashboardData(mockData);
          setLoading(false);
        }, 1000);

        // Uncomment this when backend API is ready
        /*
        const response = await axios.get('/api/hhm/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setDashboardData(response.data.data);
        setLoading(false);
        */

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
                <span style={{...styles.statValue, color: '#27ae60'}}>{dashboardData?.schedules?.open || 0}</span>
                <span style={styles.statLabel}>Open</span>
              </div>
              <div style={styles.statItem}>
                <span style={{...styles.statValue, color: '#e74c3c'}}>{dashboardData?.schedules?.closed || 0}</span>
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
                <span style={{...styles.statValue, color: '#f39c12'}}>{dashboardData?.applications?.pending || 0}</span>
                <span style={styles.statLabel}>Pending</span>
              </div>
              <div style={styles.statItem}>
                <span style={{...styles.statValue, color: '#27ae60'}}>{dashboardData?.applications?.approved || 0}</span>
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
                <span style={{...styles.statValue, color: '#27ae60'}}>{dashboardData?.workers?.available || 0}</span>
                <span style={styles.statLabel}>Available</span>
              </div>
              <div style={styles.statItem}>
                <span style={{...styles.statValue, color: '#95a5a6'}}>{dashboardData?.workers?.unavailable || 0}</span>
                <span style={styles.statLabel}>Busy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionGrid}>
          <button style={styles.actionButton}>
            <span style={styles.actionIcon}>➕</span>
            <span>Create New Schedule</span>
          </button>
          <button style={styles.actionButton}>
            <span style={styles.actionIcon}>👥</span>
            <span>Browse Workers</span>
          </button>
          <button style={styles.actionButton}>
            <span style={styles.actionIcon}>📝</span>
            <span>Review Applications</span>
          </button>
          <button style={styles.actionButton}>
            <span style={styles.actionIcon}>💌</span>
            <span>Send Invitations</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.recentActivity}>
        <h2 style={styles.sectionTitle}>Recent Activity</h2>
        <div style={styles.activityList}>
          <div style={styles.activityItem}>
            <span style={styles.activityIcon}>📝</span>
            <div style={styles.activityContent}>
              <p style={styles.activityText}>New application received for "Sugarcane Harvesting - Batch A"</p>
              <span style={styles.activityTime}>2 hours ago</span>
            </div>
          </div>
          <div style={styles.activityItem}>
            <span style={styles.activityIcon}>✅</span>
            <div style={styles.activityContent}>
              <p style={styles.activityText}>Worker invitation accepted for "Field Preparation Project"</p>
              <span style={styles.activityTime}>4 hours ago</span>
            </div>
          </div>
          <div style={styles.activityItem}>
            <span style={styles.activityIcon}>📅</span>
            <div style={styles.activityContent}>
              <p style={styles.activityText}>New job schedule created: "Irrigation System Maintenance"</p>
              <span style={styles.activityTime}>1 day ago</span>
            </div>
          </div>
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
  quickActions: {
    marginBottom: '3rem'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2d3436',
    marginBottom: '1rem'
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  actionButton: {
    backgroundColor: 'white',
    border: '2px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    gap: '0.5rem'
  },
  actionIcon: {
    fontSize: '1.2rem'
  },
  recentActivity: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  activityIcon: {
    fontSize: '1.5rem'
  },
  activityContent: {
    flex: 1
  },
  activityText: {
    margin: '0 0 0.5rem 0',
    color: '#2d3436'
  },
  activityTime: {
    fontSize: '0.9rem',
    color: '#636e72'
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
  }
};

export default HHMDashboardPage;
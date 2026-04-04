import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostBillForm from '../components/PostBillForm.jsx';
import FactoryNotifications from '../components/FactoryNotifications.jsx';
import { CRUSHING_STATUS, getCrushingStatusDisplay, DEFAULT_CRUSHING_STATUS } from '../constants/crushingStatus.js';
import { handleApiError, handleAuthError } from '../utils/authUtils';
import './FactoryDashboardPage.css';

const FactoryDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    activeHHMs: 0,
    totalRevenue: 0,
    productionVolume: 0,
    totalOrders: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [crushingStatus, setCrushingStatus] = useState(DEFAULT_CRUSHING_STATUS);
  const [crushingStatusLoading, setCrushingStatusLoading] = useState(true);
  const [crushingStatusUpdating, setCrushingStatusUpdating] = useState(false);
  const navigate = useNavigate();

  // Get user information on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Set initial crushing status from localStorage if available
        if (parsedUser.crushingStatus) {
          setCrushingStatus(parsedUser.crushingStatus);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/factory/dashboard-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setDashboardStats(data.data);
        } else {
          console.error('Failed to fetch dashboard stats:', data.message);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch crushing status
  useEffect(() => {
    const fetchCrushingStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/factory/crushing-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setCrushingStatus(data.data.crushingStatus);
        } else {
          // Handle authentication errors for fetch API
          if (response.status === 401) {
            const error = { 
              response: { 
                status: 401, 
                data: { message: data.message } 
              } 
            };
            if (handleAuthError(error, setError)) {
              return;
            }
          }
          console.error('Failed to fetch crushing status:', data.message);
        }
      } catch (error) {
        console.error('Error fetching crushing status:', error);
      } finally {
        setCrushingStatusLoading(false);
      }
    };

    fetchCrushingStatus();
  }, []);

  const handlePostBill = () => {
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleBillSubmit = async (billData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/factory/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          farmerId: billData.farmerId,
          cropQuantity: billData.cropQuantity,
          totalAmount: billData.totalAmount
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Bill created successfully for ${billData.farmerDetails.name}!`);
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.message || 'Failed to create bill. Please try again.');
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCrushingStatusChange = async (newStatus) => {
    if (crushingStatusUpdating) return;

    setCrushingStatusUpdating(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/factory/crushing-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ crushingStatus: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCrushingStatus(newStatus);
        
        // Update localStorage with new crushing status
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            parsedUser.crushingStatus = newStatus;
            localStorage.setItem('user', JSON.stringify(parsedUser));
          } catch (error) {
            console.error('Error updating user data in localStorage:', error);
          }
        }
        
        setSuccess(`Crushing status updated to ${newStatus}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // Handle authentication errors for fetch API
        if (response.status === 401) {
          const error = { 
            response: { 
              status: 401, 
              data: { message: data.message } 
            } 
          };
          if (handleAuthError(error, setError)) {
            return;
          }
        }
        setError(data.message || 'Failed to update crushing status');
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error('Error updating crushing status:', error);
      setError('Network error. Please check your connection and try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setCrushingStatusUpdating(false);
    }
  };

  return (
    <div className="factory-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-grid">
          <div className="welcome-section">
            <h1 className="dashboard-title">
              Welcome, {user?.name || 'Factory User'}!
            </h1>
            <p className="dashboard-subtitle">
              Manage your factory operations and connect with the sugarcane ecosystem
            </p>
          </div>
          
          {/* Crushing Status Control */}
          <div className="crushing-status-section">
            <h3 className="crushing-status-title">Sugarcane Crushing Status</h3>
            <div className="crushing-status-control">
              {crushingStatusLoading ? (
                <div className="crushing-status-loading">Loading...</div>
              ) : (
                <div className="crushing-status-toggle">
                  <button
                    onClick={() => handleCrushingStatusChange(crushingStatus === CRUSHING_STATUS.ON ? CRUSHING_STATUS.OFF : CRUSHING_STATUS.ON)}
                    disabled={crushingStatusUpdating}
                    className={`status-indicator ${crushingStatus === CRUSHING_STATUS.ON ? 'status-on' : 'status-off'}`}
                  >
                    {getCrushingStatusDisplay(crushingStatus).icon} {getCrushingStatusDisplay(crushingStatus).label}
                  </button>
                  
                  {crushingStatusUpdating && (
                    <span className="status-updating">Updating...</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <FactoryNotifications />

      {/* Action Cards Section */}
      <div className="action-cards-container">
        <h2 className="section-title">Factory Operations</h2>

        <div className="action-cards-grid">
          {/* Post Bill Card */}
          <div
            className="action-card billing-card"
            onClick={handlePostBill}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handlePostBill();
              }
            }}
          >
            <div className="card-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Post Bill</h3>
              <p className="card-description">
                Create and manage billing records for farmers, track payments, and view billing history
              </p>
              <div className="card-features">
                <span className="feature-tag">• Create New Bills</span>
                <span className="feature-tag">• Track Payments</span>
                <span className="feature-tag">• View History</span>
              </div>
            </div>
            <div className="card-arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="arrow-icon"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* My Associated HHMs Card */}
          <div
            className="action-card associated-card"
            onClick={() => navigate('/factory/associated-hhms')}
            role="button"
            tabIndex={0}
          >
            <div className="card-icon">
              🤝
            </div>
            <div className="card-content">
              <h3 className="card-title">My Associated HHMs</h3>
              <p className="card-description">
                View and manage your HHM partnerships
              </p>
              <div className="card-features">
                <span className="feature-tag">• View Partners</span>
                <span className="feature-tag">• Contact HHMs</span>
              </div>
            </div>
            <div className="card-arrow">
              →
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="quick-stats-section">
        <h2 className="section-title">Quick Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">
              {statsLoading ? '...' : dashboardStats.activeHHMs}
            </div>
            <div className="stat-label">Active HHMs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {statsLoading ? '...' : `₹${dashboardStats.totalRevenue.toLocaleString()}`}
            </div>
            <div className="stat-label">Factory Revenue</div>
            <div className="stat-note">Coming Soon</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {statsLoading ? '...' : `${dashboardStats.productionVolume} MT`}
            </div>
            <div className="stat-label">Sugar Production</div>
            <div className="stat-note">Coming Soon</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {statsLoading ? '...' : dashboardStats.totalOrders}
            </div>
            <div className="stat-label">Customer Orders</div>
            <div className="stat-note">Coming Soon</div>
          </div>
        </div>
      </div>

      {/* Post Bill Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Bill</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                {success}
              </div>
            )}

            <PostBillForm
              onSubmit={handleBillSubmit}
              onCancel={handleCloseModal}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoryDashboardPage;

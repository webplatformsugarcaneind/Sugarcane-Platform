import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PostBillForm from '../components/PostBillForm.jsx';
import './FactoryDashboardPage.css';

const FactoryDashboardPage = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Get user information on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleTrackInviteHHM = () => {
    navigate('/factory/maintenance');
  };

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

  return (
    <div className="factory-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            Welcome, {user?.name || 'Factory User'}!
          </h1>
          <p className="dashboard-subtitle">
            Manage your factory operations and connect with the sugarcane ecosystem
          </p>
        </div>
      </div>

      {/* Action Cards Section */}
      <div className="action-cards-container">
        <h2 className="section-title">Factory Operations</h2>
        
        <div className="action-cards-grid">
          {/* Track / Invite HHM Card */}
          <div 
            className="action-card hhm-card"
            onClick={handleTrackInviteHHM}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleTrackInviteHHM();
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Track / Invite HHM</h3>
              <p className="card-description">
                Manage Hub Head Managers, track their performance, and send invitations to new HHMs
              </p>
              <div className="card-features">
                <span className="feature-tag">• View HHM Directory</span>
                <span className="feature-tag">• Send Invitations</span>
                <span className="feature-tag">• Track Performance</span>
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
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>

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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
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
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="quick-stats-section">
        <h2 className="section-title">Quick Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">--</div>
            <div className="stat-label">Active HHMs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">--</div>
            <div className="stat-label">Pending Bills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">--</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">--</div>
            <div className="stat-label">Active Jobs</div>
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
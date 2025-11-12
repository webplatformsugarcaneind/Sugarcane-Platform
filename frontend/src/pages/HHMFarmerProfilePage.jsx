import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * HHMFarmerProfilePage Component
 * 
 * Displays detailed farmer profile for HHM users.
 * Shows comprehensive farmer information and contact options.
 */
const HHMFarmerProfilePage = () => {
  const { id } = useParams(); // Get farmer ID from URL
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFarmerProfile = useCallback(async () => {
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
      const response = await axios.get(`/api/hhm/farmer/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const farmerData = response.data.data || response.data.farmer;
      setFarmer(farmerData);
    } catch (err) {
      console.error('Error fetching farmer profile:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch farmer profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchFarmerProfile();
    }
  }, [id, fetchFarmerProfile]);

  const handleBackToDirectory = () => {
    navigate('/hhm/farmers');
  };

  const handleContactFarmer = () => {
    if (farmer && farmer.email) {
      window.location.href = `mailto:${farmer.email}`;
    } else if (farmer && farmer.phone) {
      window.location.href = `tel:${farmer.phone}`;
    } else {
      alert('No contact information available for this farmer.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="farmer-profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading farmer profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="farmer-profile-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Profile</h3>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={fetchFarmerProfile} className="retry-button">
              Try Again
            </button>
            <button onClick={handleBackToDirectory} className="back-button">
              Back to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="farmer-profile-page">
        <div className="not-found-container">
          <div className="not-found-icon">🌾</div>
          <h3>Farmer Not Found</h3>
          <p>The requested farmer profile could not be found.</p>
          <button onClick={handleBackToDirectory} className="back-button">
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="farmer-profile-page">
      {/* Header */}
      <div className="profile-header">
        <button onClick={handleBackToDirectory} className="back-btn">
          ← Back to Directory
        </button>
        <h1>👨‍🌾 Farmer Profile</h1>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Main Profile Card */}
        <div className="main-profile-card">
          <div className="farmer-header">
            <div className="farmer-avatar">
              <span className="avatar-icon">🌾</span>
            </div>
            <div className="farmer-details">
              <h2 className="farmer-name">{farmer.name || 'Unknown Name'}</h2>
              <p className="farmer-username">@{farmer.username}</p>
              <span className="farmer-role">Farmer</span>
              <div className="farmer-status">
                <span className={`status-badge ${farmer.isActive ? 'active' : 'inactive'}`}>
                  {farmer.isActive ? '✅ Active' : '⚪ Inactive'}
                </span>
              </div>
            </div>
            <div className="profile-actions">
              <button 
                className="contact-farmer-btn"
                onClick={handleContactFarmer}
              >
                📧 Contact Farmer
              </button>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="info-sections">
          {/* Contact Information */}
          <div className="info-section">
            <h3>📞 Contact Information</h3>
            <div className="info-content">
              {farmer.email && (
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  <div className="info-text">
                    <label>Email</label>
                    <span>{farmer.email}</span>
                  </div>
                </div>
              )}
              {farmer.phone && (
                <div className="info-item">
                  <span className="info-icon">📱</span>
                  <div className="info-text">
                    <label>Phone</label>
                    <span>{farmer.phone}</span>
                  </div>
                </div>
              )}
              {farmer.location && (
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <div className="info-text">
                    <label>Location</label>
                    <span>{farmer.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Farm Information */}
          <div className="info-section">
            <h3>🚜 Farm Information</h3>
            <div className="info-content">
              {farmer.farmSize && (
                <div className="info-item">
                  <span className="info-icon">📏</span>
                  <div className="info-text">
                    <label>Farm Size</label>
                    <span>{farmer.farmSize} acres</span>
                  </div>
                </div>
              )}
              {farmer.farmType && (
                <div className="info-item">
                  <span className="info-icon">🌱</span>
                  <div className="info-text">
                    <label>Farm Type</label>
                    <span>{farmer.farmType}</span>
                  </div>
                </div>
              )}
              {farmer.experience && (
                <div className="info-item">
                  <span className="info-icon">⏳</span>
                  <div className="info-text">
                    <label>Experience</label>
                    <span>{farmer.experience} years</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="info-section">
            <h3>ℹ️ Additional Information</h3>
            <div className="info-content">
              <div className="info-item">
                <span className="info-icon">📅</span>
                <div className="info-text">
                  <label>Member Since</label>
                  <span>{formatDate(farmer.createdAt)}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🔄</span>
                <div className="info-text">
                  <label>Last Updated</label>
                  <span>{formatDateTime(farmer.updatedAt)}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">🆔</span>
                <div className="info-text">
                  <label>User ID</label>
                  <span className="user-id">{farmer._id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="info-section">
            <h3>📊 Profile Completion</h3>
            <div className="info-content">
              <div className="profile-completion">
                {(() => {
                  const fields = [
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'location', label: 'Location' },
                    { key: 'farmSize', label: 'Farm Size' },
                    { key: 'farmType', label: 'Farm Type' },
                    { key: 'experience', label: 'Experience' }
                  ];
                  
                  const completedFields = fields.filter(field => 
                    farmer[field.key] && farmer[field.key] !== ''
                  );
                  
                  const completionPercentage = Math.round((completedFields.length / fields.length) * 100);
                  
                  return (
                    <>
                      <div className="completion-bar">
                        <div 
                          className="completion-fill"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                      <p className="completion-text">
                        {completionPercentage}% Complete ({completedFields.length}/{fields.length} fields)
                      </p>
                      <div className="field-status">
                        {fields.map(field => (
                          <span 
                            key={field.key}
                            className={`field-badge ${farmer[field.key] ? 'completed' : 'missing'}`}
                            title={`${field.label}: ${farmer[field.key] ? 'Completed' : 'Missing'}`}
                          >
                            {farmer[field.key] ? '✓' : '✗'} {field.label}
                          </span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="action-section">
          <h3>🤝 Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary" onClick={handleContactFarmer}>
              📧 Send Email
            </button>
            {farmer.phone && (
              <button 
                className="action-btn secondary"
                onClick={() => window.location.href = `tel:${farmer.phone}`}
              >
                📞 Call Phone
              </button>
            )}
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/hhm/farmers')}
            >
              📋 View All Farmers
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .farmer-profile-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .loading-container,
        .error-container,
        .not-found-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: white;
          border-radius: 12px;
          margin: 2rem 0;
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

        .error-icon,
        .not-found-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .back-btn {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .profile-header h1 {
          color: #1565c0;
          font-size: 2rem;
          margin: 0;
        }

        .main-profile-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .farmer-header {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .farmer-avatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #1565c0, #0d47a1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar-icon {
          font-size: 2.5rem;
          color: white;
        }

        .farmer-details {
          flex: 1;
        }

        .farmer-name {
          color: #1565c0;
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
        }

        .farmer-username {
          color: #666;
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
        }

        .farmer-role {
          background: #e3f2fd;
          color: #1565c0;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .farmer-status {
          margin-top: 0.5rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
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

        .profile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-farmer-btn {
          background: #1565c0;
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }

        .contact-farmer-btn:hover {
          background: #0d47a1;
        }

        .info-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .info-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .info-section h3 {
          color: #1565c0;
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          border-bottom: 2px solid #e3f2fd;
          padding-bottom: 0.5rem;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-icon {
          font-size: 1.5rem;
          width: 30px;
          text-align: center;
          flex-shrink: 0;
        }

        .info-text {
          flex: 1;
        }

        .info-text label {
          display: block;
          color: #666;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .info-text span {
          color: #1565c0;
          font-weight: 500;
        }

        .user-id {
          font-family: monospace;
          font-size: 0.8rem !important;
        }

        .profile-completion {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .completion-bar {
          width: 100%;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
        }

        .completion-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745, #20c997);
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .completion-text {
          text-align: center;
          color: #1565c0;
          font-weight: 500;
          margin: 0;
        }

        .field-status {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .field-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .field-badge.completed {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .field-badge.missing {
          background: #ffeaa7;
          color: #d68910;
        }

        .action-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .action-section h3 {
          color: #1565c0;
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .action-btn {
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn.primary {
          background: #1565c0;
          color: white;
        }

        .action-btn.primary:hover {
          background: #0d47a1;
        }

        .action-btn.secondary {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
        }

        .action-btn.secondary:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .retry-button,
        .back-button {
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-button {
          background: #1565c0;
          color: white;
        }

        .retry-button:hover {
          background: #0d47a1;
        }

        .back-button {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
        }

        .back-button:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        @media (max-width: 768px) {
          .farmer-profile-page {
            padding: 1rem;
          }

          .farmer-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .profile-actions {
            width: 100%;
          }

          .info-sections {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }

          .error-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default HHMFarmerProfilePage;
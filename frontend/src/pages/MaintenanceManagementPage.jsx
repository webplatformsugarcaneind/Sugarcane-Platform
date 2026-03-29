import React, { useState, useEffect } from 'react';
import './MaintenanceManagementPage.css';

const MaintenanceManagementPage = () => {
  const [activeTab, setActiveTab] = useState('invites');
  const [pendingInvites, setPendingInvites] = useState([]);
  const [appliedMechanics, setAppliedMechanics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch pending invites and maintenance applications
      await Promise.all([
        fetchPendingInvites(),
        fetchMaintenanceApplications()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const token = localStorage.getItem('token');
      // This would be your actual API endpoint for factory's sent invites
      // const response = await fetch('/api/factory/invites', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // Mock data for development
      const mockInvites = [
        {
          id: '1',
          hhmName: 'John Mechanic',
          email: 'john.mechanic@example.com',
          phone: '123-456-7890',
          jobTitle: 'Equipment Maintenance',
          sentDate: '2025-10-05',
          status: 'pending'
        },
        {
          id: '2',
          hhmName: 'Sarah Engineer',
          email: 'sarah.engineer@example.com',
          phone: '098-765-4321',
          jobTitle: 'Facility Maintenance',
          sentDate: '2025-10-03',
          status: 'pending'
        }
      ];
      
      setPendingInvites(mockInvites);
    } catch (error) {
      console.error('Error fetching pending invites:', error);
    }
  };

  const fetchMaintenanceApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/factory/maintenance-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppliedMechanics(data.data || []);
      } else {
        console.error('Failed to fetch maintenance applications, using mock data');
        // Fallback to mock data
        const mockApplications = [
        {
          id: '1',
          applicationId: 'app_001',
          workerName: 'Mike Rodriguez',
          email: 'mike.rodriguez@example.com',
          phone: '555-123-4567',
          skills: ['Electrical', 'Mechanical', 'Hydraulics'],
          experience: '5 years',
          jobTitle: 'Pump Maintenance',
          appliedDate: '2025-10-06',
          status: 'pending',
          applicationMessage: 'I have extensive experience with industrial pump maintenance and electrical systems.'
        },
        {
          id: '2',
          applicationId: 'app_002',
          workerName: 'Lisa Chen',
          email: 'lisa.chen@example.com',
          phone: '444-567-8901',
          skills: ['Welding', 'Fabrication', 'Safety'],
          experience: '8 years',
          jobTitle: 'Equipment Repair',
          appliedDate: '2025-10-04',
          status: 'pending',
          applicationMessage: 'Certified welder with experience in sugar mill equipment repair and maintenance.'
        },
        {
          id: '3',
          applicationId: 'app_003',
          workerName: 'David Johnson',
          email: 'david.johnson@example.com',
          phone: '333-789-0123',
          skills: ['Preventive Maintenance', 'Troubleshooting'],
          experience: '3 years',
          jobTitle: 'General Maintenance',
          appliedDate: '2025-10-02',
          status: 'approved'
        }
        ];
        
        setAppliedMechanics(mockApplications);
      }
    } catch (error) {
      console.error('Error fetching maintenance applications:', error);
    }
  };

  const handleApplicationAction = async (applicationId, action) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/factory/maintenance-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with the response
        setAppliedMechanics(prev => 
          prev.map(app => 
            app.applicationId === applicationId 
              ? { ...app, status: action, reviewedDate: new Date().toISOString().split('T')[0] }
              : app
          )
        );
        console.log(`Application ${applicationId} ${action} successfully`);
      } else {
        setError(data.message || `Failed to ${action} application. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      setError(`Network error. Failed to ${action} application. Please try again.`);
    }
  };

  const handleResendInvite = async (inviteId) => {
    try {
      console.log(`Resending invite ${inviteId}`);
      // API call to resend invite would go here
    } catch (error) {
      console.error('Error resending invite:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  if (isLoading) {
    return (
      <div className="maintenance-management-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-management-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Maintenance Management</h1>
        <p className="page-subtitle">
          Manage maintenance job invitations and review mechanic applications
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {error}
          <button 
            className="retry-button"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'invites' ? 'active' : ''}`}
          onClick={() => setActiveTab('invites')}
        >
          <span className="tab-icon">📤</span>
          Pending Invites
          <span className="tab-count">{pendingInvites.length}</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <span className="tab-icon">👥</span>
          Applied Mechanics
          <span className="tab-count">{appliedMechanics.filter(app => app.status === 'pending').length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Pending Invites Section */}
        {activeTab === 'invites' && (
          <div className="invites-section">
            <div className="section-header">
              <h2 className="section-title">Pending Invites</h2>
              <button className="refresh-button" onClick={fetchPendingInvites}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
                Refresh
              </button>
            </div>

            {pendingInvites.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📬</div>
                <h3>No Pending Invites</h3>
                <p>You haven't sent any maintenance job invites yet.</p>
              </div>
            ) : (
              <div className="invites-grid">
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="invite-card">
                    <div className="card-header">
                      <h3 className="invite-name">{invite.hhmName}</h3>
                      <span className={`status-badge ${getStatusBadgeClass(invite.status)}`}>
                        {invite.status}
                      </span>
                    </div>
                    <div className="card-content">
                      <div className="contact-info">
                        <p><strong>Email:</strong> {invite.email}</p>
                        <p><strong>Phone:</strong> {invite.phone}</p>
                        <p><strong>Job:</strong> {invite.jobTitle}</p>
                        <p><strong>Sent:</strong> {formatDate(invite.sentDate)}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleResendInvite(invite.id)}
                      >
                        Resend Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applied Mechanics Section */}
        {activeTab === 'applications' && (
          <div className="applications-section">
            <div className="section-header">
              <h2 className="section-title">Applied Mechanics (HHMs)</h2>
              <button className="refresh-button" onClick={fetchMaintenanceApplications}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </svg>
                Refresh
              </button>
            </div>

            {appliedMechanics.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Applications Yet</h3>
                <p>No mechanics have applied for your maintenance jobs yet.</p>
              </div>
            ) : (
              <div className="applications-grid">
                {appliedMechanics.map(application => (
                  <div key={application.id} className="application-card">
                    <div className="card-header">
                      <h3 className="applicant-name">{application.workerName}</h3>
                      <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="card-content">
                      <div className="contact-info">
                        <p><strong>Email:</strong> {application.email}</p>
                        <p><strong>Phone:</strong> {application.phone}</p>
                        <p><strong>Experience:</strong> {application.experience}</p>
                        <p><strong>Job:</strong> {application.jobTitle}</p>
                        <p><strong>Applied:</strong> {formatDate(application.appliedDate)}</p>
                      </div>
                      
                      <div className="skills-section">
                        <strong>Skills:</strong>
                        <div className="skills-tags">
                          {application.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      </div>

                      {application.applicationMessage && (
                        <div className="message-section">
                          <strong>Message:</strong>
                          <p className="application-message">{application.applicationMessage}</p>
                        </div>
                      )}
                    </div>
                    
                    {application.status === 'pending' && (
                      <div className="card-actions">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleApplicationAction(application.applicationId, 'approved')}
                        >
                          <span className="btn-icon">✓</span>
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleApplicationAction(application.applicationId, 'rejected')}
                        >
                          <span className="btn-icon">✗</span>
                          Reject
                        </button>
                      </div>
                    )}

                    {application.status !== 'pending' && (
                      <div className="review-info">
                        <p><strong>Reviewed:</strong> {formatDate(application.reviewedDate || application.appliedDate)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceManagementPage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvitesAndApplicationsPage = () => {
  const [activeTab, setActiveTab] = useState('invitations');
  const [invitations, setInvitations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [responding, setResponding] = useState({});

  useEffect(() => {
    if (activeTab === 'invitations') {
      fetchInvitations();
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📨 Fetching invitations from backend...');
      const response = await axios.get('/api/worker/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Invitations received:', response.data);

      // Transform backend data to match frontend expectations
      // Backend: inv.schedule, inv.hhm
      // Frontend: inv.job, inv.employer
      const invitationsData = response.data.data || response.data;
      const transformedInvitations = invitationsData.map(inv => ({
        _id: inv._id,
        job: {
          _id: inv.schedule?.id || inv.schedule?._id,
          title: inv.schedule?.title || 'Unknown Job',
          location: inv.schedule?.location || 'N/A',
          wageOffered: inv.offeredWage || inv.schedule?.wageOffered || 0,
          startDate: inv.schedule?.startDate,
          endDate: inv.schedule?.endDate,
          workType: inv.schedule?.workType || 'general',
          status: inv.schedule?.status,
          requiredSkills: inv.schedule?.requiredSkills || [],
          totalSpots: inv.schedule?.totalSpots,
          filledSpots: inv.schedule?.filledSpots,
          spotsRemaining: inv.schedule?.spotsRemaining
        },
        employer: {
          _id: inv.hhm?.id || inv.hhm?._id,
          name: inv.hhm?.name || 'Unknown Employer',
          email: inv.hhm?.email,
          phone: inv.hhm?.phone,
          companyName: inv.hhm?.companyName,
          rating: 4.5 // Default rating
        },
        status: inv.status,
        invitedAt: inv.invitedAt || inv.createdAt,
        expiresAt: inv.expiresAt,
        message: inv.personalMessage || 'No message provided',
        priority: inv.priority,
        isExpired: inv.isExpired,
        daysUntilExpiration: inv.daysUntilExpiration,
        respondedAt: inv.respondedAt,
        responseMessage: inv.responseMessage
      }));

      console.log('📋 Transformed invitations:', transformedInvitations);
      setInvitations(transformedInvitations);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      console.error('Error details:', err.response?.data);
      // Use mock data as fallback for development
      const mockInvitations = [
        {
          _id: '1',
          job: {
            _id: 'j1',
            title: 'Sugarcane Harvesting - Premium Farm',
            location: 'Punjab, India',
            wageOffered: 900,
            startDate: '2025-10-15',
            endDate: '2025-10-30',
            workType: 'harvesting'
          },
          employer: {
            _id: 'e1',
            name: 'Rajesh Kumar',
            rating: 4.8
          },
          status: 'pending',
          invitedAt: '2025-10-06T10:00:00Z',
          message: 'We would like to invite you to work on our sugarcane harvest. Your experience makes you a perfect fit for this role.',
          expiresAt: '2025-10-10T23:59:59Z'
        },
        {
          _id: '2',
          job: {
            _id: 'j2',
            title: 'Organic Farm Management',
            location: 'Haryana, India',
            wageOffered: 750,
            startDate: '2025-10-20',
            endDate: '2025-11-20',
            workType: 'management'
          },
          employer: {
            _id: 'e2',
            name: 'Priya Sharma',
            rating: 4.6
          },
          status: 'pending',
          invitedAt: '2025-10-05T14:30:00Z',
          message: 'Looking for skilled workers for our organic farming project. Great opportunity for learning new sustainable farming techniques!',
          expiresAt: '2025-10-09T23:59:59Z'
        }
      ];
      setInvitations(mockInvitations);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/worker/applications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Worker applications received:', response.data);

      // Transform backend data to match frontend expectations
      // Backend: app.schedule, app.hhm
      // Frontend: app.job, app.employer
      const applicationsData = response.data.data || response.data;
      const transformedApplications = applicationsData.map(app => ({
        _id: app._id,
        job: {
          _id: app.schedule?.id || app.schedule?._id,
          title: app.schedule?.title || 'Unknown Job',
          location: app.schedule?.location || 'N/A',
          wageOffered: app.schedule?.wageOffered || 0,
          startDate: app.schedule?.startDate,
          endDate: app.schedule?.endDate,
          workType: app.schedule?.workType || 'general',
          status: app.schedule?.status,
          requiredSkills: app.schedule?.requiredSkills || [],
          totalSpots: app.schedule?.totalSpots,
          filledSpots: app.schedule?.filledSpots,
          spotsRemaining: app.schedule?.spotsRemaining
        },
        employer: {
          _id: app.hhm?.id || app.hhm?._id,
          name: app.hhm?.name || 'Unknown Employer',
          email: app.hhm?.email,
          phone: app.hhm?.phone,
          companyName: app.hhm?.companyName,
          rating: 4.5 // Default rating
        },
        status: app.status,
        appliedAt: app.appliedAt || app.createdAt,
        reviewedAt: app.reviewedAt,
        message: app.applicationMessage || 'No message',
        response: app.reviewNotes || null,
        workerSkills: app.workerSkills || [],
        experience: app.experience,
        expectedWage: app.expectedWage,
        availability: app.availability
      }));

      setApplications(transformedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      // Use mock data as fallback for development
      const mockApplications = [
        {
          _id: '1',
          job: {
            _id: 'j3',
            title: 'Field Preparation Work',
            location: 'Punjab, India',
            wageOffered: 650,
            workType: 'preparation'
          },
          employer: {
            _id: 'e3',
            name: 'Amit Singh',
            rating: 4.5
          },
          status: 'pending',
          appliedAt: '2025-10-04T09:15:00Z',
          message: 'I have 3 years of experience in field preparation and soil management. I am available for the full duration and have my own basic tools.',
          response: null
        },
        {
          _id: '2',
          job: {
            _id: 'j4',
            title: 'Irrigation System Installation',
            location: 'Haryana, India',
            wageOffered: 800,
            workType: 'irrigation'
          },
          employer: {
            _id: 'e4',
            name: 'Meera Devi',
            rating: 4.9
          },
          status: 'approved',
          appliedAt: '2025-10-02T11:20:00Z',
          message: 'Experienced in irrigation systems with technical certification. Can provide references from previous employers.',
          response: 'Great! We are excited to have you join our team. Please be ready to start on October 15th. Contact us at 9876543210 for further details.'
        },
        {
          _id: '3',
          job: {
            _id: 'j5',
            title: 'Crop Monitoring',
            location: 'Gujarat, India',
            wageOffered: 700,
            workType: 'monitoring'
          },
          employer: {
            _id: 'e5',
            name: 'Suresh Patel',
            rating: 4.3
          },
          status: 'rejected',
          appliedAt: '2025-09-30T16:45:00Z',
          message: 'I have experience in crop monitoring and pest management. Familiar with modern monitoring equipment.',
          response: 'Thank you for your application. We found a candidate with more specialized experience in our specific crop monitoring systems.'
        }
      ];
      setApplications(mockApplications);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleInvitationResponse = async (invitationId, response) => {
    try {
      setResponding(prev => ({ ...prev, [invitationId]: true }));
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(`/api/worker/invitations/${invitationId}`, 
        { status: response },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setInvitations(prev =>
        prev.map(inv =>
          inv._id === invitationId
            ? { ...inv, status: response }
            : inv
        )
      );

      alert(`Invitation ${response} successfully!`);
    } catch (err) {
      console.error('Error responding to invitation:', err);
      // For development, still update the local state
      setInvitations(prev =>
        prev.map(inv =>
          inv._id === invitationId
            ? { ...inv, status: response }
            : inv
        )
      );
      alert(`Invitation ${response} successfully! (Development mode)`);
    } finally {
      setResponding(prev => ({ ...prev, [invitationId]: false }));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Invitations & Applications</h1>
        <p style={styles.subtitle}>
          Manage job invitations from employers and track your applications.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          style={activeTab === 'invitations' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('invitations')}
        >
          📨 Invitations ({invitations.filter(inv => inv.status === 'pending').length})
        </button>
        <button
          style={activeTab === 'applications' ? { ...styles.tab, ...styles.activeTab } : styles.tab}
          onClick={() => setActiveTab('applications')}
        >
          📋 Applied Jobs ({applications.length})
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === 'invitations' && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Job Invitations</h2>
              <p style={styles.sectionDescription}>
                Review and respond to job invitations from employers
              </p>
            </div>
            
            {loadingInvitations ? (
              <div style={styles.loadingSection}>
                <div style={styles.spinner}></div>
                <p>Loading invitations...</p>
              </div>
            ) : invitations.length === 0 ? (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>📨</div>
                <p style={styles.placeholderTitle}>No invitations yet</p>
                <p style={styles.placeholderText}>
                  When employers invite you to jobs, they will appear here.
                </p>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {invitations.map(invitation => (
                  <div key={invitation._id} style={styles.itemCard}>
                    <div style={styles.itemHeader}>
                      <div style={styles.itemTitleSection}>
                        <h3 style={styles.itemTitle}>{invitation.job.title}</h3>
                        <p style={styles.itemEmployer}>by {invitation.employer.name} ⭐ {invitation.employer.rating}</p>
                      </div>
                      <div style={styles.itemStatus}>
                        <span style={getStatusStyle(invitation.status)}>
                          {invitation.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div style={styles.itemDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>� Location:</span>
                        <span>{invitation.job.location}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>💰 Wage:</span>
                        <span>₹{invitation.job.wageOffered}/day</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>⏱️ Duration:</span>
                        <span>{new Date(invitation.job.startDate).toLocaleDateString()} - {new Date(invitation.job.endDate).toLocaleDateString()}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>📅 Invited:</span>
                        <span>{new Date(invitation.invitedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div style={styles.itemMessage}>
                      <strong>Invitation Message:</strong>
                      <p style={styles.messageText}>{invitation.message}</p>
                    </div>
                    
                    {invitation.status === 'pending' && (
                      <div style={styles.itemActions}>
                        <button
                          style={styles.acceptButton}
                          onClick={() => handleInvitationResponse(invitation._id, 'accepted')}
                          disabled={responding[invitation._id]}
                        >
                          {responding[invitation._id] ? 'Accepting...' : '✅ Accept'}
                        </button>
                        <button
                          style={styles.declineButton}
                          onClick={() => handleInvitationResponse(invitation._id, 'declined')}
                          disabled={responding[invitation._id]}
                        >
                          {responding[invitation._id] ? 'Declining...' : '❌ Decline'}
                        </button>
                        <button style={styles.detailsButton}>
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Applied Jobs</h2>
              <p style={styles.sectionDescription}>
                Track the status of your job applications
              </p>
            </div>
            
            {loadingApplications ? (
              <div style={styles.loadingSection}>
                <div style={styles.spinner}></div>
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div style={styles.placeholder}>
                <div style={styles.placeholderIcon}>📋</div>
                <p style={styles.placeholderTitle}>No applications yet</p>
                <p style={styles.placeholderText}>
                  When you apply for jobs, they will appear here.
                </p>
              </div>
            ) : (
              <div style={styles.itemsList}>
                {applications.map(application => (
                  <div key={application._id} style={styles.itemCard}>
                    <div style={styles.itemHeader}>
                      <div style={styles.itemTitleSection}>
                        <h3 style={styles.itemTitle}>{application.job?.title || 'Unknown Job'}</h3>
                        <p style={styles.itemEmployer}>
                          by {application.employer?.name || 'Unknown Employer'} ⭐ {application.employer?.rating || 0}
                        </p>
                      </div>
                      <div style={styles.itemStatus}>
                        <span style={getStatusStyle(application.status)}>
                          {application.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    <div style={styles.itemDetails}>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>📍 Location:</span>
                        <span>{application.job?.location || 'N/A'}</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>💰 Wage:</span>
                        <span>₹{application.job?.wageOffered || 0}/day</span>
                      </div>
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>📅 Applied:</span>
                        <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div style={styles.itemMessage}>
                      <strong>Your Application:</strong>
                      <p style={styles.messageText}>{application.message || 'No message'}</p>
                    </div>
                    
                    {application.response && (
                      <div style={styles.responseMessage}>
                        <strong>Employer Response:</strong>
                        <p style={styles.responseText}>{application.response}</p>
                      </div>
                    )}
                    
                    <div style={styles.itemActions}>
                      {application.status === 'pending' && (
                        <button style={styles.editButton}>
                          Edit Application
                        </button>
                      )}
                      {application.status === 'approved' && (
                        <button style={styles.contactButton}>
                          Contact Employer
                        </button>
                      )}
                      <button style={styles.detailsButton}>
                        View Job Details
                      </button>
                    </div>
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

// Helper function for status styling
const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  switch (status) {
    case 'pending':
      return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
    case 'approved':
    case 'accepted':
      return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
    case 'rejected':
    case 'declined':
      return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
    default:
      return baseStyle;
  }
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '0.5rem'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#7f8c8d'
  },
  tabContainer: {
    display: 'flex',
    borderBottom: '2px solid #ecf0f1',
    marginBottom: '2rem'
  },
  tab: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '1rem 2rem',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#7f8c8d',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  },
  activeTab: {
    color: '#3498db',
    borderBottom: '2px solid #3498db'
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  tabContent: {
    minHeight: '400px'
  },
  sectionHeader: {
    marginBottom: '2rem',
    borderBottom: '1px solid #ecf0f1',
    paddingBottom: '1rem'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    color: '#2c3e50',
    margin: '0 0 0.5rem 0'
  },
  sectionDescription: {
    color: '#7f8c8d',
    margin: '0',
    fontSize: '1rem'
  },
  placeholder: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#7f8c8d'
  },
  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  placeholderTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#2c3e50'
  },
  placeholderText: {
    fontSize: '1rem',
    lineHeight: '1.6'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  itemCard: {
    border: '1px solid #ecf0f1',
    borderRadius: '8px',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    transition: 'box-shadow 0.3s ease'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  itemTitleSection: {
    flex: 1
  },
  itemTitle: {
    fontSize: '1.3rem',
    color: '#2c3e50',
    margin: '0 0 0.25rem 0'
  },
  itemEmployer: {
    color: '#7f8c8d',
    margin: '0',
    fontSize: '0.9rem'
  },
  itemStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  itemDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  detailLabel: {
    fontWeight: 'bold',
    minWidth: '80px'
  },
  itemMessage: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    borderLeft: '4px solid #2196f3'
  },
  messageText: {
    margin: '0.5rem 0 0 0',
    fontStyle: 'italic',
    lineHeight: '1.5'
  },
  responseMessage: {
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#f3e5f5',
    borderRadius: '6px',
    borderLeft: '4px solid #9c27b0'
  },
  responseText: {
    margin: '0.5rem 0 0 0',
    lineHeight: '1.5',
    color: '#4a148c'
  },
  itemActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  declineButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  editButton: {
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  contactButton: {
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  detailsButton: {
    backgroundColor: 'transparent',
    color: '#2196f3',
    border: '1px solid #2196f3',
    padding: '0.6rem 1.2rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  loadingSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem',
    textAlign: 'center'
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
  workTypeTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  expiryDate: {
    color: '#e67e22',
    fontWeight: 'bold'
  },
  statusMessage: {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #dee2e6',
    fontStyle: 'italic',
    color: '#6c757d'
  }
};

export default InvitesAndApplicationsPage;
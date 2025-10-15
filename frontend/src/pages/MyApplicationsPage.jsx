import React, { useState, useEffect } from 'react';

/**
 * MyApplicationsPage component for displaying user job applications
 * @returns {JSX.Element} The applications page component
 */
const MyApplicationsPage = () => {
  const [loading, _setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with actual API calls when backend is ready
    const mockApplications = [
      {
        _id: '1',
        jobTitle: 'Sugarcane Harvesting - Batch A',
        farmer: {
          name: 'Rajesh Kumar',
          rating: 4.5
        },
        appliedAt: '2025-10-05',
        status: 'pending',
        location: 'Field A-1, Punjab',
        wageOffered: 800,
        startDate: '2025-10-15',
        message: 'I have 5 years of experience in sugarcane harvesting and own basic harvesting tools.',
        lastUpdated: '2025-10-05'
      },
      {
        _id: '2',
        jobTitle: 'Field Preparation Project',
        farmer: {
          name: 'Priya Sharma',
          rating: 4.8
        },
        appliedAt: '2025-10-03',
        status: 'approved',
        location: 'Field B-2, Haryana',
        wageOffered: 600,
        startDate: '2025-10-20',
        message: 'Experienced in soil preparation and planting. Available for the full duration.',
        lastUpdated: '2025-10-04',
        approvalMessage: 'Great! We are impressed with your experience. Please be ready to start on October 20th.'
      },
      {
        _id: '3',
        jobTitle: 'Irrigation System Maintenance',
        farmer: {
          name: 'Amit Singh',
          rating: 4.2
        },
        appliedAt: '2025-09-28',
        status: 'rejected',
        location: 'Multiple Fields, Punjab',
        wageOffered: 700,
        startDate: '2025-10-10',
        message: 'I have basic irrigation maintenance skills and am eager to learn more.',
        lastUpdated: '2025-09-30',
        rejectionMessage: 'Thank you for your application. We need someone with more specialized irrigation experience for this project.'
      },
      {
        _id: '4',
        jobTitle: 'Organic Farming Assistance',
        farmer: {
          name: 'Meera Devi',
          rating: 4.9
        },
        appliedAt: '2025-10-01',
        status: 'approved',
        location: 'Green Valley Farm, Haryana',
        wageOffered: 750,
        startDate: '2025-10-12',
        message: 'Passionate about organic farming practices and have worked on organic farms before.',
        lastUpdated: '2025-10-02',
        approvalMessage: 'Perfect fit! Your organic farming background is exactly what we need.'
      },
      {
        _id: '5',
        jobTitle: 'Pesticide Application',
        farmer: {
          name: 'Suresh Patel',
          rating: 4.0
        },
        appliedAt: '2025-09-25',
        status: 'completed',
        location: 'Field C-3, Punjab',
        wageOffered: 850,
        startDate: '2025-09-30',
        message: 'Certified in safe pesticide application with 3 years experience.',
        lastUpdated: '2025-10-05',
        completionMessage: 'Excellent work! Payment has been processed.',
        rating: 5
      }
    ];

    setApplications(mockApplications);
  }, []);

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
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
      case 'rejected':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' };
      default:
        return baseStyle;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'all') return true;
    return app.status === activeFilter;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    completed: applications.filter(app => app.status === 'completed').length
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Applications</h1>
        <p style={styles.subtitle}>
          Track the status of your job applications and manage your work history
        </p>
      </div>

      {/* Status Filters */}
      <div style={styles.filtersSection}>
        <div style={styles.filterButtons}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              style={activeFilter === status ? styles.activeFilterButton : styles.filterButton}
              onClick={() => setActiveFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div style={styles.applicationsSection}>
        {filteredApplications.length === 0 ? (
          <div style={styles.noApplications}>
            <h3>No applications found</h3>
            <p>
              {activeFilter === 'all' 
                ? "You haven't applied for any jobs yet. Check out available positions to get started!"
                : `No ${activeFilter} applications found.`
              }
            </p>
            {activeFilter === 'all' && (
              <button style={styles.browseJobsButton}>
                Browse Available Jobs
              </button>
            )}
          </div>
        ) : (
          <div style={styles.applicationsList}>
            {filteredApplications.map(application => (
              <div key={application._id} style={styles.applicationCard}>
                <div style={styles.applicationHeader}>
                  <div style={styles.applicationTitle}>
                    <h3>{application.jobTitle}</h3>
                    <span style={getStatusStyle(application.status)}>
                      {application.status}
                    </span>
                  </div>
                  <div style={styles.applicationMeta}>
                    <p>📍 {application.location}</p>
                    <p>💰 ₹{application.wageOffered}/day</p>
                  </div>
                </div>

                <div style={styles.applicationContent}>
                  <div style={styles.farmerInfo}>
                    <strong>Farmer:</strong> {application.farmer.name} 
                    <span style={styles.rating}>⭐ {application.farmer.rating}</span>
                  </div>

                  <div style={styles.applicationDetails}>
                    <div style={styles.detailItem}>
                      <strong>Applied:</strong> {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                    <div style={styles.detailItem}>
                      <strong>Start Date:</strong> {new Date(application.startDate).toLocaleDateString()}
                    </div>
                    <div style={styles.detailItem}>
                      <strong>Last Updated:</strong> {new Date(application.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={styles.messageSection}>
                    <strong>Your Application Message:</strong>
                    <p style={styles.message}>{application.message}</p>
                  </div>

                  {/* Status-specific messages */}
                  {application.status === 'approved' && application.approvalMessage && (
                    <div style={styles.responseMessage}>
                      <strong>✅ Approval Message:</strong>
                      <p style={styles.approvalMessage}>{application.approvalMessage}</p>
                    </div>
                  )}

                  {application.status === 'rejected' && application.rejectionMessage && (
                    <div style={styles.responseMessage}>
                      <strong>❌ Rejection Message:</strong>
                      <p style={styles.rejectionMessage}>{application.rejectionMessage}</p>
                    </div>
                  )}

                  {application.status === 'completed' && (
                    <div style={styles.responseMessage}>
                      <strong>🏆 Job Completed:</strong>
                      <p style={styles.completionMessage}>{application.completionMessage}</p>
                      {application.rating && (
                        <p style={styles.completionRating}>
                          Your Rating: {'⭐'.repeat(application.rating)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div style={styles.applicationActions}>
                  {application.status === 'pending' && (
                    <>
                      <button style={styles.editButton}>Edit Application</button>
                      <button style={styles.withdrawButton}>Withdraw</button>
                    </>
                  )}
                  {application.status === 'approved' && (
                    <button style={styles.contactButton}>Contact Farmer</button>
                  )}
                  <button style={styles.detailsButton}>View Job Details</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa'
  },
  header: {
    marginBottom: '2rem'
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
  filtersSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '0.8rem 1.2rem',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease'
  },
  activeFilterButton: {
    padding: '0.8rem 1.2rem',
    border: '1px solid #3498db',
    backgroundColor: '#3498db',
    color: 'white',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  applicationsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  applicationCard: {
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa'
  },
  applicationHeader: {
    marginBottom: '1rem'
  },
  applicationTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  applicationMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.9rem',
    color: '#636e72'
  },
  applicationContent: {
    marginBottom: '1.5rem'
  },
  farmerInfo: {
    marginBottom: '1rem'
  },
  rating: {
    marginLeft: '0.5rem',
    color: '#f39c12'
  },
  applicationDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  detailItem: {
    fontSize: '0.9rem'
  },
  messageSection: {
    marginBottom: '1rem'
  },
  message: {
    backgroundColor: '#e3f2fd',
    padding: '1rem',
    borderRadius: '8px',
    margin: '0.5rem 0',
    fontStyle: 'italic'
  },
  responseMessage: {
    marginBottom: '1rem'
  },
  approvalMessage: {
    backgroundColor: '#d4edda',
    padding: '1rem',
    borderRadius: '8px',
    margin: '0.5rem 0',
    color: '#155724'
  },
  rejectionMessage: {
    backgroundColor: '#f8d7da',
    padding: '1rem',
    borderRadius: '8px',
    margin: '0.5rem 0',
    color: '#721c24'
  },
  completionMessage: {
    backgroundColor: '#d1ecf1',
    padding: '1rem',
    borderRadius: '8px',
    margin: '0.5rem 0',
    color: '#0c5460'
  },
  completionRating: {
    fontSize: '1.1rem',
    color: '#f39c12',
    margin: '0.5rem 0'
  },
  applicationActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  editButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  withdrawButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  contactButton: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  detailsButton: {
    backgroundColor: 'transparent',
    color: '#636e72',
    border: '1px solid #ddd',
    padding: '0.8rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  noApplications: {
    textAlign: 'center',
    padding: '3rem',
    color: '#636e72'
  },
  browseJobsButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem'
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
  }
};

export default MyApplicationsPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

const ContractsDashboard = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check authentication and get user role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token) {
      navigate('/login');
      return;
    }

    setUserRole(role);
    fetchContracts();
  }, [navigate]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/contracts/my-contracts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setContracts(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch contracts');
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      textTransform: 'capitalize'
    };

    switch (status?.toLowerCase()) {
      case 'factory_invite':
        return { ...baseStyle, backgroundColor: '#e7f3ff', color: '#0056b3', border: '1px solid #b3d9ff' };
      case 'pending':
      case 'hhm_pending':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' };
      case 'approved':
      case 'hhm_accepted':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
      case 'rejected':
      case 'hhm_rejected':
      case 'factory_rejected':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
      case 'active':
      case 'factory_offer':
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' };
      case 'expired':
        return { ...baseStyle, backgroundColor: '#f5f5f5', color: '#6c757d', border: '1px solid #dee2e6' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' };
      default:
        return { ...baseStyle, backgroundColor: '#f8f9fa', color: '#6c757d', border: '1px solid #dee2e6' };
    }
  };

  const getContractTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'seasonal':
        return '🌱';
      case 'permanent':
        return '🏭';
      case 'project-based':
        return '📋';
      case 'temporary':
        return '⏰';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBackToDashboard = () => {
    if (userRole === 'hhm') {
      navigate('/hhm/dashboard');
    } else if (userRole === 'factory') {
      navigate('/factory/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleAcceptInvite = async (contractId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/contracts/${contractId}/accept-invite`, {
        response_message: 'Thank you for the invitation. We accept and look forward to partnering with you.'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('✅ Invitation accepted successfully!');
      fetchContracts(); // Refresh the contracts list
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('❌ Failed to accept invitation: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectInvite = async (contractId) => {
    const reason = window.prompt('Reason for rejecting (optional):');
    if (reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/contracts/${contractId}/reject-invite`, {
        response_message: reason || 'We are unable to accept this invitation at this time.'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('✅ Invitation rejected.');
      fetchContracts(); // Refresh the contracts list
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      alert('❌ Failed to reject invitation: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSection}>
          <div style={styles.spinner}></div>
          <h2 style={styles.loadingTitle}>Loading Contracts...</h2>
          <p style={styles.loadingText}>Please wait while we fetch your contract information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorSection}>
          <div style={styles.errorIcon}>❌</div>
          <h2 style={styles.errorTitle}>Unable to Load Contracts</h2>
          <p style={styles.errorText}>{error}</p>
          <div style={styles.errorActions}>
            <button style={styles.retryButton} onClick={fetchContracts}>
              🔄 Try Again
            </button>
            <button style={styles.backButton} onClick={handleBackToDashboard}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <div style={styles.titleSection}>
          <h1 style={styles.pageTitle}>📋 Contract Management</h1>
          <p style={styles.pageSubtitle}>
            Manage your contract requests and agreements
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{contracts.length}</div>
            <div style={styles.statLabel}>Total Contracts</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>
              {contracts.filter(c => c.status === 'pending').length}
            </div>
            <div style={styles.statLabel}>Pending</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>
              {contracts.filter(c => c.status === 'approved' || c.status === 'active').length}
            </div>
            <div style={styles.statLabel}>Approved/Active</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>
              {contracts.filter(c => c.status === 'completed').length}
            </div>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div style={styles.contractsSection}>
        <h2 style={styles.sectionTitle}>Your Contracts</h2>
        
        {contracts.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h3 style={styles.emptyTitle}>No Contracts Yet</h3>
            <p style={styles.emptyText}>
              {userRole === 'hhm' 
                ? 'Start by browsing factories and requesting contracts to begin partnerships.'
                : 'Contract requests from HHMs will appear here once submitted.'
              }
            </p>
            {userRole === 'hhm' && (
              <button 
                style={styles.primaryButton}
                onClick={() => navigate('/hhm/public-factories')}
              >
                🔍 Browse Factories
              </button>
            )}
          </div>
        ) : (
          <div style={styles.contractsList}>
            {contracts.map((contract) => (
              <div key={contract._id} style={styles.contractCard}>
                <div style={styles.contractHeader}>
                  <div style={styles.contractMainInfo}>
                    <div style={styles.contractTitle}>
                      {getContractTypeIcon(contract.contractType)} 
                      {userRole === 'hhm' ? contract.factory?.name : contract.hhm?.username} Contract
                    </div>
                    <div style={styles.contractMeta}>
                      <span style={styles.contractId}>ID: {contract._id.slice(-8)}</span>
                      <span style={styles.contractDate}>
                        Requested: {formatDate(contract.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div style={getStatusBadgeStyle(contract.status)}>
                    {contract.status}
                  </div>
                </div>

                <div style={styles.contractDetails}>
                  <div style={styles.detailRow}>
                    <div style={styles.detailItem}>
                      <strong>🚗 Vehicle:</strong> {contract.vehicle || 'Not specified'}
                    </div>
                    <div style={styles.detailItem}>
                      <strong>👥 Labor:</strong> {contract.labor || 'Not specified'}
                    </div>
                    <div style={styles.detailItem}>
                      <strong>📋 Type:</strong> {contract.contractType || 'Not specified'}
                    </div>
                  </div>
                  
                  {contract.notes && (
                    <div style={styles.contractNotes}>
                      <strong>📝 Notes:</strong> {contract.notes}
                    </div>
                  )}
                  
                  {contract.responseMessage && (
                    <div style={styles.responseMessage}>
                      <strong>💬 Response:</strong> {contract.responseMessage}
                    </div>
                  )}
                </div>

                {/* Contract Actions */}
                <div style={styles.contractActions}>
                  {userRole === 'hhm' && (
                    <>
                      {contract.status === 'factory_invite' && (
                        <div style={styles.actionButtons}>
                          <button 
                            style={styles.approveButton}
                            onClick={() => handleAcceptInvite(contract._id)}
                          >
                            ✅ Accept Invitation
                          </button>
                          <button 
                            style={styles.rejectButton}
                            onClick={() => handleRejectInvite(contract._id)}
                          >
                            ❌ Reject Invitation
                          </button>
                        </div>
                      )}
                      {(contract.status === 'pending' || contract.status === 'hhm_pending') && (
                        <span style={styles.actionText}>⏳ Awaiting factory response</span>
                      )}
                      {(contract.status === 'approved' || contract.status === 'hhm_accepted') && (
                        <span style={styles.actionText}>✅ Contract approved - Ready to begin</span>
                      )}
                    </>
                  )}
                  
                  {userRole === 'factory' && (contract.status === 'pending' || contract.status === 'hhm_pending') && (
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.approveButton}
                        onClick={() => {/* TODO: Implement approve function */}}
                      >
                        ✅ Approve
                      </button>
                      <button 
                        style={styles.rejectButton}
                        onClick={() => {/* TODO: Implement reject function */}}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                  
                  {userRole === 'factory' && contract.status === 'factory_invite' && (
                    <span style={styles.actionText}>📨 Invitation sent - Awaiting HHM response</span>
                  )}
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
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '2rem'
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    marginBottom: '1rem'
  },
  titleSection: {
    textAlign: 'center'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.5rem 0'
  },
  pageSubtitle: {
    fontSize: '1.1rem',
    color: '#636e72',
    margin: 0
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)'
    }
  },
  statIcon: {
    fontSize: '2.5rem',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: 0
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#636e72',
    margin: 0
  },
  contractsSection: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 1.5rem 0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 1rem 0'
  },
  emptyText: {
    fontSize: '1rem',
    color: '#636e72',
    margin: '0 0 2rem 0',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  contractsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  contractCard: {
    border: '1px solid #e9ecef',
    borderRadius: '12px',
    padding: '1.5rem',
    backgroundColor: '#fafafa',
    transition: 'all 0.2s'
  },
  contractHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  contractMainInfo: {
    flex: 1
  },
  contractTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.5rem 0'
  },
  contractMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.9rem',
    color: '#636e72'
  },
  contractDetails: {
    marginBottom: '1rem'
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  detailItem: {
    fontSize: '0.95rem',
    color: '#495057'
  },
  contractNotes: {
    fontSize: '0.95rem',
    color: '#495057',
    backgroundColor: '#e7f3ff',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '0.5rem'
  },
  responseMessage: {
    fontSize: '0.95rem',
    color: '#495057',
    backgroundColor: '#f0f9ff',
    padding: '0.75rem',
    borderRadius: '6px'
  },
  contractActions: {
    borderTop: '1px solid #dee2e6',
    paddingTop: '1rem'
  },
  actionText: {
    fontSize: '0.9rem',
    color: '#6c757d',
    fontStyle: 'italic'
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem'
  },
  approveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  rejectButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  primaryButton: {
    padding: '1rem 2rem',
    backgroundColor: '#2c5f2d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  loadingSection: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2c5f2d',
    borderRadius: '50%',
    margin: '0 auto 1.5rem auto'
  },
  loadingTitle: {
    fontSize: '1.5rem',
    color: '#2d3436',
    margin: '0 0 0.5rem 0'
  },
  loadingText: {
    fontSize: '1rem',
    color: '#636e72',
    margin: 0
  },
  errorSection: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: '#dc3545',
    margin: '0 0 1rem 0'
  },
  errorText: {
    fontSize: '1rem',
    color: '#636e72',
    margin: '0 0 2rem 0'
  },
  errorActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2c5f2d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500'
  }
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
export default ContractsDashboard;
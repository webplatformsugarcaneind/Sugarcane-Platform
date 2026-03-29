import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FarmerContractsDashboard.css';

const FarmerContractsDashboard = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/farmer-contracts/my-contracts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setContracts(data.data || []);
      } else {
        setError('Failed to load contracts');
      }
    } catch (err) {
      setError('Error loading contracts');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContracts = () => {
    switch (filter) {
      case 'pending':
        return contracts.filter(c => c.status === 'farmer_pending');
      case 'accepted':
        return contracts.filter(c => c.status === 'hhm_accepted');
      case 'rejected':
        return contracts.filter(c => c.status === 'hhm_rejected');
      case 'cancelled':
        return contracts.filter(c => c.status === 'auto_cancelled');
      default:
        return contracts;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      farmer_pending: { text: 'Pending', class: 'status-pending' },
      hhm_accepted: { text: 'Accepted', class: 'status-accepted' },
      hhm_rejected: { text: 'Rejected', class: 'status-rejected' },
      auto_cancelled: { text: 'Cancelled', class: 'status-cancelled' }
    };
    
    const badge = badges[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredContracts = getFilteredContracts();

  if (loading) {
    return (
      <div className="farmer-contracts-dashboard">
        <div className="loading">Loading your contracts...</div>
      </div>
    );
  }

  return (
    <div className="farmer-contracts-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>My Contract Requests</h1>
          <p>Track your contract requests sent to HHMs</p>
        </div>
        
        <div className="header-actions">
          <button 
            className="new-contract-btn"
            onClick={() => navigate('/farmer/hhms')}
          >
            + Send New Contract Request
          </button>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({contracts.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({contracts.filter(c => c.status === 'farmer_pending').length})
          </button>
          <button 
            className={filter === 'accepted' ? 'active' : ''}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({contracts.filter(c => c.status === 'hhm_accepted').length})
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({contracts.filter(c => c.status === 'hhm_rejected').length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="contracts-container">
        {filteredContracts.length === 0 ? (
          <div className="no-contracts">
            <div className="no-contracts-icon">📋</div>
            <h3>No contract requests found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't sent any contract requests yet."
                : `No ${filter} contracts found.`
              }
            </p>
            <button 
              className="browse-hhms-btn"
              onClick={() => navigate('/farmer/hhms')}
            >
              Browse HHMs to Send Requests
            </button>
          </div>
        ) : (
          <div className="contracts-list">
            {filteredContracts.map(contract => (
              <div key={contract._id} className="contract-card">
                <div className="contract-header">
                  <div className="hhm-info">
                    <h3>{contract.hhm_id?.name || 'Unknown HHM'}</h3>
                    <p>{contract.hhm_id?.email}</p>
                    <p>{contract.hhm_id?.phone}</p>
                  </div>
                  <div className="contract-status">
                    {getStatusBadge(contract.status)}
                    <span className="request-date">
                      Sent: {formatDate(contract.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="contract-summary">
                  <div className="summary-item">
                    <strong>Work:</strong>
                    <span>{contract.contract_details?.workType || 'Not specified'}</span>
                  </div>
                  
                  <div className="summary-item">
                    <strong>Location:</strong>
                    <span>{contract.contract_details?.farmLocation || 'Not specified'}</span>
                  </div>
                  
                  <div className="summary-item">
                    <strong>Duration:</strong>
                    <span>{contract.duration_days} days</span>
                  </div>
                  
                  <div className="summary-item">
                    <strong>Payment:</strong>
                    <span>{contract.contract_details?.paymentTerms || 'Not specified'}</span>
                  </div>
                </div>

                <div className="contract-details">
                  {contract.contract_details?.startDate && (
                    <div className="detail-row">
                      <strong>Timeline:</strong>
                      <span>
                        {formatDate(contract.contract_details.startDate)} 
                        {' to '} 
                        {contract.contract_details?.endDate ? formatDate(contract.contract_details.endDate) : 'TBD'}
                      </span>
                    </div>
                  )}

                  {contract.contract_details?.requirements && (
                    <div className="detail-row">
                      <strong>Requirements:</strong>
                      <p>{contract.contract_details.requirements}</p>
                    </div>
                  )}

                  {contract.contract_details?.additionalNotes && (
                    <div className="detail-row">
                      <strong>Notes:</strong>
                      <p>{contract.contract_details.additionalNotes}</p>
                    </div>
                  )}
                </div>

                <div className="contract-footer">
                  {contract.status === 'farmer_pending' && (
                    <div className="pending-info">
                      <span className="status-text">
                        ⏳ Waiting for HHM response 
                        {contract.grace_period_days && (
                          ` (${contract.grace_period_days} days grace period)`
                        )}
                      </span>
                    </div>
                  )}

                  {contract.status === 'hhm_accepted' && (
                    <div className="accepted-info">
                      <span className="status-text">
                        ✅ Contract accepted! You can now coordinate with the HHM.
                      </span>
                      <div className="contact-actions">
                        <a 
                          href={`tel:${contract.hhm_id?.phone}`} 
                          className="contact-btn phone"
                        >
                          📞 Call HHM
                        </a>
                        <a 
                          href={`mailto:${contract.hhm_id?.email}`} 
                          className="contact-btn email"
                        >
                          ✉️ Email HHM
                        </a>
                      </div>
                    </div>
                  )}

                  {contract.status === 'hhm_rejected' && (
                    <div className="rejected-info">
                      <span className="status-text">
                        ❌ Contract was rejected by the HHM.
                      </span>
                      <button 
                        className="retry-btn"
                        onClick={() => navigate(`/farmer/hhms/${contract.hhm_id?._id}/contract`)}
                      >
                        Send New Request
                      </button>
                    </div>
                  )}

                  {contract.status === 'auto_cancelled' && (
                    <div className="cancelled-info">
                      <span className="status-text">
                        ⏰ Request expired due to no response within grace period.
                      </span>
                      <button 
                        className="retry-btn"
                        onClick={() => navigate(`/farmer/hhms/${contract.hhm_id?._id}/contract`)}
                      >
                        Send New Request
                      </button>
                    </div>
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

export default FarmerContractsDashboard;
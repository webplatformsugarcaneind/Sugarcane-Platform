import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HHMContractDashboard.css';

const HHMContractDashboard = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [responding, setResponding] = useState(null);

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

  const handleContractResponse = async (contractId, decision) => {
    setResponding(contractId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/farmer-contracts/respond/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ decision })
      });

      if (response.ok) {
        // Refresh contracts after response
        await fetchContracts();
        setError('');
      } else {
        const data = await response.json();
        setError(data.message || `Failed to ${decision} contract`);
      }
    } catch (err) {
      setError(`Error ${decision}ing contract`);
      console.error('Error:', err);
    } finally {
      setResponding(null);
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
      farmer_pending: { text: 'Pending Response', class: 'status-pending' },
      hhm_accepted: { text: 'Accepted', class: 'status-accepted' },
      hhm_rejected: { text: 'Rejected', class: 'status-rejected' },
      auto_cancelled: { text: 'Auto Cancelled', class: 'status-cancelled' }
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
      <div className="contract-dashboard">
        <div className="loading">Loading contracts...</div>
      </div>
    );
  }

  return (
    <div className="contract-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Contract Management</h1>
          <p>Manage farmer contract requests and track active contracts</p>
        </div>
        
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
            <h3>No contracts found</h3>
            <p>
              {filter === 'pending' 
                ? "No pending contract requests at the moment."
                : `No ${filter === 'all' ? '' : filter} contracts found.`
              }
            </p>
          </div>
        ) : (
          <div className="contracts-grid">
            {filteredContracts.map(contract => (
              <div key={contract._id} className="contract-card">
                <div className="contract-header">
                  <div className="farmer-info">
                    <h3>{contract.farmer_id?.name || 'Unknown Farmer'}</h3>
                    <p>{contract.farmer_id?.email}</p>
                    <p>{contract.farmer_id?.phone}</p>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>

                <div className="contract-details">
                  <div className="detail-item">
                    <strong>Work Type:</strong>
                    <span>{contract.contract_details?.workType || 'Not specified'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <strong>Location:</strong>
                    <span>{contract.contract_details?.farmLocation || 'Not specified'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <strong>Duration:</strong>
                    <span>{contract.duration_days} days</span>
                  </div>
                  
                  <div className="detail-item">
                    <strong>Payment:</strong>
                    <span>{contract.contract_details?.paymentTerms || 'Not specified'}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Timeline:</strong>
                    <span>
                      {contract.contract_details?.startDate ? formatDate(contract.contract_details.startDate) : 'TBD'} 
                      {' to '} 
                      {contract.contract_details?.endDate ? formatDate(contract.contract_details.endDate) : 'TBD'}
                    </span>
                  </div>

                  {contract.contract_details?.requirements && (
                    <div className="detail-item full-width">
                      <strong>Requirements:</strong>
                      <p>{contract.contract_details.requirements}</p>
                    </div>
                  )}

                  {contract.contract_details?.additionalNotes && (
                    <div className="detail-item full-width">
                      <strong>Additional Notes:</strong>
                      <p>{contract.contract_details.additionalNotes}</p>
                    </div>
                  )}
                </div>

                <div className="contract-meta">
                  <span className="created-date">
                    Requested: {formatDate(contract.createdAt)}
                  </span>
                  {contract.grace_period_days && (
                    <span className="grace-period">
                      Grace Period: {contract.grace_period_days} days
                    </span>
                  )}
                </div>

                {contract.status === 'farmer_pending' && (
                  <div className="contract-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleContractResponse(contract._id, 'accept')}
                      disabled={responding === contract._id}
                    >
                      {responding === contract._id ? 'Processing...' : 'Accept Contract'}
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleContractResponse(contract._id, 'reject')}
                      disabled={responding === contract._id}
                    >
                      {responding === contract._id ? 'Processing...' : 'Reject Contract'}
                    </button>
                  </div>
                )}

                {contract.status === 'hhm_accepted' && (
                  <div className="contract-status-info accepted">
                    <span>✅ Contract accepted and active</span>
                  </div>
                )}

                {contract.status === 'hhm_rejected' && (
                  <div className="contract-status-info rejected">
                    <span>❌ Contract rejected</span>
                  </div>
                )}

                {contract.status === 'auto_cancelled' && (
                  <div className="contract-status-info cancelled">
                    <span>⏰ Contract auto-cancelled due to timeout</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HHMContractDashboard;
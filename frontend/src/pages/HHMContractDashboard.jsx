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
<<<<<<< HEAD
      const response = await fetch('http://localhost:5000/api/farmer-contracts/my-contracts', {
=======
      const response = await fetch(apiURL('/api/farmer-contracts/my-contracts'), {
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
      const response = await fetch(`http://localhost:5000/api/farmer-contracts/respond/${contractId}`, {
=======
      const response = await fetch(apiURL(`/api/farmer-contracts/respond/${contractId}`), {
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
    
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
        
        <div className="filter-tabs">
          <button 
=======

        <div className="filter-tabs">
          <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({contracts.length})
          </button>
<<<<<<< HEAD
          <button 
=======
          <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({contracts.filter(c => c.status === 'farmer_pending').length})
          </button>
<<<<<<< HEAD
          <button 
=======
          <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            className={filter === 'accepted' ? 'active' : ''}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({contracts.filter(c => c.status === 'hhm_accepted').length})
          </button>
<<<<<<< HEAD
          <button 
=======
          <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
            <div className="no-contracts-icon">📋</div>
            <h3>No contracts found</h3>
            <p>
              {filter === 'pending' 
=======
            <div className="no-contracts-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>No contracts found</h3>
            <p>
              {filter === 'pending'
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                  
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                  <div className="detail-item">
                    <strong>Location:</strong>
                    <span>{contract.contract_details?.farmLocation || 'Not specified'}</span>
                  </div>
<<<<<<< HEAD
                  
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                  <div className="detail-item">
                    <strong>Duration:</strong>
                    <span>{contract.duration_days} days</span>
                  </div>
<<<<<<< HEAD
                  
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                  <div className="detail-item">
                    <strong>Payment:</strong>
                    <span>{contract.contract_details?.paymentTerms || 'Not specified'}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Timeline:</strong>
                    <span>
<<<<<<< HEAD
                      {contract.contract_details?.startDate ? formatDate(contract.contract_details.startDate) : 'TBD'} 
                      {' to '} 
=======
                      {contract.contract_details?.startDate ? formatDate(contract.contract_details.startDate) : 'TBD'}
                      {' to '}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
                    <span>✅ Contract accepted and active</span>
=======
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                      Contract accepted and active
                    </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                  </div>
                )}

                {contract.status === 'hhm_rejected' && (
                  <div className="contract-status-info rejected">
<<<<<<< HEAD
                    <span>❌ Contract rejected</span>
=======
                    <span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                      Contract rejected
                    </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
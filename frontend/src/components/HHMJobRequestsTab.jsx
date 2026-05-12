import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Icons = {
  List: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>),
  Empty: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" /></svg>),
  Alert: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" /></svg>),
  Check: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>),
  Close: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  User: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>),
  Location: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>),
  Money: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
  Worker: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>),
  Document: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>)
};

/**
 * HHMJobRequestsTab Component
 * Displays job requests received by HHM and allows accepting/rejecting them
 */
const HHMJobRequestsTab = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('farmer_pending');
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/farmer-contracts/my-contracts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('HHM contracts response:', response.data);
      const hhmContracts = response.data.data.contractsAsHHM || 
                          response.data.data.contracts?.filter(c => c.hhm_id && typeof c.hhm_id === 'object') || 
                          [];
      setContracts(hhmContracts);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err.response?.data?.message || 'Failed to load job requests');
    } finally {
      setLoading(false);
    }
  };

  const handleContractResponse = async (contractId, decision) => {
    try {
      setRespondingTo(contractId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `/api/farmer-contracts/respond/${contractId}`,
        { decision },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response sent successfully:', response.data);

      if (decision === 'accept') {
        const autoCancelled = response.data.data.farmerExclusivity?.autoCancelledContracts || 0;
        if (autoCancelled > 0) {
          alert(`Job request accepted! ${autoCancelled} other pending requests from this farmer were automatically cancelled.`);
        } else {
          alert('Job request accepted successfully!');
        }
      } else {
        alert('Job request rejected.');
      }

      await fetchContracts();

    } catch (err) {
      console.error('Error responding to contract:', err);
      alert(err.response?.data?.message || `Failed to ${decision} the job request. Please try again.`);
    } finally {
      setRespondingTo(null);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (statusFilter === 'all') return true;
    return contract.status === statusFilter;
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'farmer_pending': return 'pending';
      case 'hhm_accepted': return 'accepted';
      case 'hhm_rejected': return 'rejected';
      case 'auto_cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      farmer_pending: 'Pending Response',
      hhm_accepted: 'Accepted',
      hhm_rejected: 'Rejected',
      auto_cancelled: 'Cancelled'
    };
    return labels[status] || 'Pending';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'farmer_pending': return <Icons.Clock />;
      case 'hhm_accepted': return <Icons.Check />;
      case 'hhm_rejected': return <Icons.Close />;
      case 'auto_cancelled': return <Icons.Close />;
      default: return <Icons.Clock />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusCounts = () => {
    return {
      total: contracts.length,
      pending: contracts.filter(c => c.status === 'farmer_pending').length,
      accepted: contracts.filter(c => c.status === 'hhm_accepted').length,
      rejected: contracts.filter(c => c.status === 'hhm_rejected').length,
      autoCancelled: contracts.filter(c => c.status === 'auto_cancelled').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="fr-loading">
        <div className="fr-spinner"></div>
        <p>Loading job requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fr-empty">
        <div className="fr-empty-icon fr-error"><Icons.Alert /></div>
        <h3 className="fr-error-text">Error Loading Job Requests</h3>
        <p>{error}</p>
        <button onClick={fetchContracts} className="fr-retry-btn" style={{ marginTop: '1rem' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fr-contracts-tab">
      <div className="fr-contracts-header">
        <h2 className="fr-section-title">
          <span className="fr-title-icon"><Icons.Worker /></span>
          Farmer Job Requests
        </h2>
      </div>

      <div className="fr-filter-bar">
        <label htmlFor="statusFilter">Filter Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="fr-select"
        >
          <option value="all">All Requests ({statusCounts.total})</option>
          <option value="farmer_pending">Pending ({statusCounts.pending})</option>
          <option value="hhm_accepted">Accepted ({statusCounts.accepted})</option>
          <option value="hhm_rejected">Rejected ({statusCounts.rejected})</option>
        </select>
      </div>

      {filteredContracts.length === 0 ? (
        <div className="fr-empty">
          <div className="fr-empty-icon"><Icons.Empty /></div>
          <h3>No Requests Found</h3>
          <p>
            {contracts.length === 0
              ? "You haven't received any job requests from farmers yet."
              : `No requests with status "${statusFilter}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="fr-contracts-list">
          {filteredContracts.map((contract) => {
            const isPending = contract.status === 'farmer_pending';
            const isResponding = respondingTo === contract.id;

            return (
              <div key={contract.id} className="fr-contract-card">
                <div className="fr-contract-top">
                  <div className="fr-contract-info-main">
                    <h4>{contract.contract_details?.workType || 'Job Request'}</h4>
                    <span className="fr-contract-date">
                      <Icons.Calendar />
                      Received: {formatDate(contract.createdAt)}
                    </span>
                  </div>
                  <span className={`fr-badge ${getStatusBadgeClass(contract.status)}`}>
                    {getStatusIcon(contract.status)}
                    {getStatusLabel(contract.status)}
                  </span>
                </div>

                <div className="fr-contract-grid">
                  <div className="fr-detail-item">
                    <span className="fr-detail-label">Farmer Partner</span>
                    <span className="fr-detail-val">
                      <Icons.User />
                      {contract.farmer_id?.name || 'Unknown Farmer'}
                    </span>
                  </div>
                  <div className="fr-detail-item">
                    <span className="fr-detail-label">Location</span>
                    <span className="fr-detail-val">
                      <Icons.Location />
                      {contract.contract_details?.farmLocation || 'Not specified'}
                    </span>
                  </div>
                  <div className="fr-detail-item">
                    <span className="fr-detail-label">Requirements</span>
                    <span className="fr-detail-val" style={{fontSize: '0.85rem'}}>
                      <Icons.Document />
                      {contract.contract_details?.requirements || 'Not specified'}
                    </span>
                  </div>
                  <div className="fr-detail-item">
                    <span className="fr-detail-label">Payment Terms</span>
                    <span className="fr-detail-val">
                      <Icons.Money />
                      {contract.contract_details?.paymentTerms || 'Not specified'}
                    </span>
                  </div>
                  <div className="fr-detail-item">
                    <span className="fr-detail-label">Duration</span>
                    <span className="fr-detail-val">
                      <Icons.Clock />
                      {contract.duration_days} Days
                    </span>
                  </div>
                  {contract.contract_details?.startDate && (
                    <div className="fr-detail-item">
                      <span className="fr-detail-label">Proposed Start</span>
                      <span className="fr-detail-val">
                        <Icons.Calendar />
                        {formatDate(contract.contract_details.startDate)}
                      </span>
                    </div>
                  )}
                </div>

                {contract.contract_details?.additionalNotes && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(91,143,255,0.05)', borderRadius: '12px', border: '1px solid rgba(91,143,255,0.1)' }}>
                    <div style={{ color: 'var(--blue)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Additional Notes</div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                      {contract.contract_details.additionalNotes}
                    </p>
                  </div>
                )}

                {isPending && (
                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleContractResponse(contract.id, 'accept')}
                      className="fr-tab-btn active"
                      disabled={isResponding}
                      style={{ padding: '8px 24px', background: 'rgba(126,200,67,0.15)', color: 'var(--green)', boxShadow: 'none' }}
                    >
                      {isResponding ? 'Processing...' : 'Accept Request'}
                    </button>
                    <button
                      onClick={() => handleContractResponse(contract.id, 'reject')}
                      className="fr-tab-btn active"
                      disabled={isResponding}
                      style={{ padding: '8px 24px', background: 'rgba(255,107,107,0.1)', color: 'var(--red)', boxShadow: 'none' }}
                    >
                      Reject Request
                    </button>
                  </div>
                )}

                {!isPending && (
                  <div className={`fr-status-box ${getStatusBadgeClass(contract.status)}`}>
                    {getStatusIcon(contract.status)}
                    {contract.status === 'hhm_accepted' && (
                      <div>You have accepted this job request. The farmer has been notified.</div>
                    )}
                    {contract.status === 'hhm_rejected' && (
                      <div>You have rejected this job request.</div>
                    )}
                    {contract.status === 'auto_cancelled' && (
                      <div>This request was automatically cancelled.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HHMJobRequestsTab;
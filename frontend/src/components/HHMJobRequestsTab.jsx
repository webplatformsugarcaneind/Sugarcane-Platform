import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      // Filter to show only contracts where current user is the HHM
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

  // Handle contract response (accept/reject)
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

      // Show success message
      if (decision === 'accept') {
        const autoCancelled = response.data.data.farmerExclusivity?.autoCancelledContracts || 0;
        if (autoCancelled > 0) {
          alert(`✅ Job request accepted! ${autoCancelled} other pending requests from this farmer were automatically cancelled.`);
        } else {
          alert('✅ Job request accepted successfully!');
        }
      } else {
        alert('❌ Job request rejected.');
      }

      // Refresh the contracts list
      await fetchContracts();

    } catch (err) {
      console.error('Error responding to contract:', err);
      alert(err.response?.data?.message || `Failed to ${decision} the job request. Please try again.`);
    } finally {
      setRespondingTo(null);
    }
  };

  // Filter contracts based on status
  const filteredContracts = contracts.filter(contract => {
    if (statusFilter === 'all') return true;
    return contract.status === statusFilter;
  });

  // Get contract status badge style
  const getStatusBadge = (status) => {
    const styles = {
      farmer_pending: { bg: '#fff3cd', color: '#856404', label: 'Pending Response' },
      hhm_accepted: { bg: '#d4edda', color: '#155724', label: 'Accepted' },
      hhm_rejected: { bg: '#f8d7da', color: '#721c24', label: 'Rejected' },
      auto_cancelled: { bg: '#e2e3e5', color: '#495057', label: 'Auto-Cancelled' }
    };
    return styles[status] || styles.farmer_pending;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status counts
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
      <div className="hhm-job-requests-tab">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading job requests...</p>
        </div>

        <style jsx>{`
          .hhm-job-requests-tab {
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: #6c757d;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #1565c0;
            border-radius: 50%;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hhm-job-requests-tab">
        <div className="error-state">
          <h3>❌ Error Loading Job Requests</h3>
          <p>{error}</p>
          <button onClick={fetchContracts} className="btn btn-primary">
            Try Again
          </button>
        </div>

        <style jsx>{`
          .hhm-job-requests-tab {
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }

          .error-state {
            text-align: center;
            padding: 3rem;
            color: #dc3545;
          }

          .error-state h3 {
            margin-bottom: 1rem;
          }

          .error-state p {
            color: #6c757d;
            margin-bottom: 2rem;
          }

          .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-primary {
            background: #1565c0;
            color: white;
          }

          .btn-primary:hover {
            background: #0d47a1;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="hhm-job-requests-tab">
      {/* Header */}
      <div className="tab-header">
        <h2>👨‍💼 Farmer Job Requests</h2>
        <p>Manage job requests received from farmers</p>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card total">
          <span className="stat-number">{statusCounts.total}</span>
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-number">{statusCounts.pending}</span>
          <span className="stat-label">Pending Response</span>
        </div>
        <div className="stat-card accepted">
          <span className="stat-number">{statusCounts.accepted}</span>
          <span className="stat-label">Accepted</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-number">{statusCounts.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="filter-section">
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="status-filter"
        >
          <option value="farmer_pending">Pending Response ({statusCounts.pending})</option>
          <option value="all">All Requests ({statusCounts.total})</option>
          <option value="hhm_accepted">Accepted ({statusCounts.accepted})</option>
          <option value="hhm_rejected">Rejected ({statusCounts.rejected})</option>
        </select>
      </div>

      {/* Job Requests List */}
      {filteredContracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📥</div>
          <h3>No Job Requests Found</h3>
          <p>
            {contracts.length === 0
              ? "You haven't received any job requests from farmers yet."
              : `No requests with status "${statusFilter}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="contracts-list">
          {filteredContracts.map((contract) => {
            const statusStyle = getStatusBadge(contract.status);
            const isPending = contract.status === 'farmer_pending';
            const isResponding = respondingTo === contract.id;

            return (
              <div key={contract.id} className="contract-card">
                <div className="contract-header">
                  <div className="contract-title">
                    <h4>{contract.contract_details?.workType || 'Job Request'}</h4>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: statusStyle.bg, 
                        color: statusStyle.color 
                      }}
                    >
                      {statusStyle.label}
                    </span>
                  </div>
                  <div className="contract-meta">
                    <span className="farmer-name">
                      From: <strong>{contract.farmer_id?.name || 'Unknown Farmer'}</strong>
                    </span>
                    <span className="request-date">
                      Received: {formatDate(contract.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="contract-body">
                  <div className="contract-info">
                    <div className="info-row">
                      <span className="label">Location:</span>
                      <span className="value">{contract.contract_details?.farmLocation || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Requirements:</span>
                      <span className="value">{contract.contract_details?.requirements || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Payment Terms:</span>
                      <span className="value">{contract.contract_details?.paymentTerms || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Duration:</span>
                      <span className="value">{contract.duration_days} days</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Grace Period:</span>
                      <span className="value">{contract.grace_period_days} days</span>
                    </div>
                    {contract.contract_details?.startDate && (
                      <div className="info-row">
                        <span className="label">Proposed Start:</span>
                        <span className="value">{formatDate(contract.contract_details.startDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Notes */}
                  {contract.contract_details?.additionalNotes && (
                    <div className="additional-notes">
                      <h5>📝 Additional Notes:</h5>
                      <p>{contract.contract_details.additionalNotes}</p>
                    </div>
                  )}

                  {/* Action Buttons for Pending Requests */}
                  {isPending && (
                    <div className="action-buttons">
                      <button
                        onClick={() => handleContractResponse(contract.id, 'accept')}
                        className="btn btn-success"
                        disabled={isResponding}
                      >
                        {isResponding ? (
                          <>
                            <span className="spinner-small"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            ✅ Accept Request
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleContractResponse(contract.id, 'reject')}
                        className="btn btn-danger"
                        disabled={isResponding}
                      >
                        ❌ Reject Request
                      </button>
                    </div>
                  )}

                  {/* Status Messages */}
                  {contract.status === 'hhm_accepted' && (
                    <div className="status-info accepted">
                      <p>✅ You have accepted this job request. The farmer has been notified.</p>
                    </div>
                  )}

                  {contract.status === 'hhm_rejected' && (
                    <div className="status-info rejected">
                      <p>❌ You have rejected this job request.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Component Styles */}
      <style jsx>{`
        .hhm-job-requests-tab {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tab-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .tab-header h2 {
          color: #1565c0;
          margin-bottom: 0.5rem;
          font-size: 1.8rem;
        }

        .tab-header p {
          color: #6c757d;
          font-size: 1.1rem;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          border: 2px solid #e9ecef;
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-card.total { border-color: #1565c0; }
        .stat-card.pending { border-color: #ffc107; }
        .stat-card.accepted { border-color: #28a745; }
        .stat-card.rejected { border-color: #dc3545; }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-card.total .stat-number { color: #1565c0; }
        .stat-card.pending .stat-number { color: #ffc107; }
        .stat-card.accepted .stat-number { color: #28a745; }
        .stat-card.rejected .stat-number { color: #dc3545; }

        .stat-label {
          color: #6c757d;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .filter-section {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .filter-section label {
          font-weight: 600;
          color: #1565c0;
        }

        .status-filter {
          padding: 0.5rem 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 1rem;
          background: white;
        }

        .status-filter:focus {
          outline: none;
          border-color: #1565c0;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          border: 2px dashed #e9ecef;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #495057;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: #6c757d;
          font-size: 1.1rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .contracts-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contract-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s ease;
        }

        .contract-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .contract-header {
          border-bottom: 1px solid #f8f9fa;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .contract-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .contract-title h4 {
          margin: 0;
          color: #1565c0;
          font-size: 1.2rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .contract-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .farmer-name {
          color: #28a745;
          font-weight: 500;
        }

        .contract-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .contract-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0.75rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .info-row .label {
          font-weight: 600;
          color: #495057;
        }

        .info-row .value {
          color: #1565c0;
          text-align: right;
          word-break: break-word;
        }

        .additional-notes {
          padding: 1rem;
          background: #f0f7ff;
          border-radius: 8px;
          border: 1px solid #b8daff;
        }

        .additional-notes h5 {
          margin: 0 0 0.5rem 0;
          color: #1565c0;
        }

        .additional-notes p {
          margin: 0;
          color: #495057;
          line-height: 1.5;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding-top: 1rem;
          border-top: 1px solid #f8f9fa;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-1px);
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
        }

        .status-info {
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .status-info.accepted {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-info.rejected {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f1aeb5;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .summary-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          }

          .filter-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .contract-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .contract-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .contract-info {
            grid-template-columns: 1fr;
          }

          .info-row {
            flex-direction: column;
            gap: 0.25rem;
          }

          .info-row .value {
            text-align: left;
            font-weight: 600;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default HHMJobRequestsTab;
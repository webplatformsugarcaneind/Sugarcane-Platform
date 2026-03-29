import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * FarmerContractsTab Component
 * Displays farmer's contract requests and their statuses
 */
const FarmerContractsTab = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

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

      console.log('Farmer contracts response:', response.data);
      setContracts(response.data.data.contracts || []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
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
      farmer_pending: { bg: '#fff3cd', color: '#856404', label: 'Pending' },
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
      day: 'numeric'
    });
  };

  // Get status counts for summary
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
      <div className="farmer-contracts-tab">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your contract requests...</p>
        </div>

        <style jsx>{`
          .farmer-contracts-tab {
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
            border-top: 4px solid #28a745;
            border-radius: 50%;
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="farmer-contracts-tab">
        <div className="error-state">
          <h3>❌ Error Loading Contracts</h3>
          <p>{error}</p>
          <button onClick={fetchContracts} className="btn btn-primary">
            Try Again
          </button>
        </div>

        <style jsx>{`
          .farmer-contracts-tab {
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
            background: #28a745;
            color: white;
          }

          .btn-primary:hover {
            background: #218838;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="farmer-contracts-tab">
      {/* Header */}
      <div className="tab-header">
        <h2>📋 My Job Requests</h2>
        <p>Track the status of job requests you've sent to HHMs</p>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card total">
          <span className="stat-number">{statusCounts.total}</span>
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-number">{statusCounts.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card accepted">
          <span className="stat-number">{statusCounts.accepted}</span>
          <span className="stat-label">Accepted</span>
        </div>
        <div className="stat-card rejected">
          <span className="stat-number">{statusCounts.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
        <div className="stat-card cancelled">
          <span className="stat-number">{statusCounts.autoCancelled}</span>
          <span className="stat-label">Auto-Cancelled</span>
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
          <option value="all">All Requests ({statusCounts.total})</option>
          <option value="farmer_pending">Pending ({statusCounts.pending})</option>
          <option value="hhm_accepted">Accepted ({statusCounts.accepted})</option>
          <option value="hhm_rejected">Rejected ({statusCounts.rejected})</option>
          <option value="auto_cancelled">Auto-Cancelled ({statusCounts.autoCancelled})</option>
        </select>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Requests Found</h3>
          <p>
            {contracts.length === 0
              ? "You haven't sent any job requests yet. Visit an HHM's profile to send your first request!"
              : `No requests with status "${statusFilter}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="contracts-list">
          {filteredContracts.map((contract) => {
            const statusStyle = getStatusBadge(contract.status);
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
                    <span className="request-date">
                      Sent on {formatDate(contract.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="contract-body">
                  <div className="contract-info">
                    <div className="info-row">
                      <span className="label">HHM:</span>
                      <span className="value">{contract.hhm_id?.name || 'Unknown'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Location:</span>
                      <span className="value">{contract.contract_details?.farmLocation || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Requirements:</span>
                      <span className="value">{contract.contract_details?.requirements || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Payment:</span>
                      <span className="value">{contract.contract_details?.paymentTerms || 'Not specified'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Duration:</span>
                      <span className="value">{contract.duration_days} days</span>
                    </div>
                  </div>

                  {/* Show additional info based on status */}
                  {contract.status === 'hhm_accepted' && (
                    <div className="status-info accepted">
                      <p>✅ Great! This HHM has accepted your job request. You can expect them to contact you soon.</p>
                    </div>
                  )}

                  {contract.status === 'auto_cancelled' && (
                    <div className="status-info cancelled">
                      <p>🚫 This request was automatically cancelled because another HHM accepted a different request from you.</p>
                    </div>
                  )}

                  {contract.status === 'hhm_rejected' && (
                    <div className="status-info rejected">
                      <p>❌ Unfortunately, this HHM couldn't take on your job request. You can send requests to other HHMs.</p>
                    </div>
                  )}

                  {contract.status === 'farmer_pending' && (
                    <div className="status-info pending">
                      <p>⏳ Waiting for HHM response. They have {contract.grace_period_days} days to respond.</p>
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
        .farmer-contracts-tab {
          max-width: 1200px;
          margin: 0 auto;
        }

        .tab-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .tab-header h2 {
          color: #2c5f2d;
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

        .stat-card.total { border-color: #007bff; }
        .stat-card.pending { border-color: #ffc107; }
        .stat-card.accepted { border-color: #28a745; }
        .stat-card.rejected { border-color: #dc3545; }
        .stat-card.cancelled { border-color: #6c757d; }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-card.total .stat-number { color: #007bff; }
        .stat-card.pending .stat-number { color: #ffc107; }
        .stat-card.accepted .stat-number { color: #28a745; }
        .stat-card.rejected .stat-number { color: #dc3545; }
        .stat-card.cancelled .stat-number { color: #6c757d; }

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
          color: #2c5f2d;
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
          border-color: #28a745;
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
          color: #2c5f2d;
          font-size: 1.2rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .contract-meta {
          color: #6c757d;
          font-size: 0.9rem;
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
          color: #2c5f2d;
          text-align: right;
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

        .status-info.cancelled {
          background: #e2e3e5;
          color: #495057;
          border: 1px solid #d1d3d4;
        }

        .status-info.rejected {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f1aeb5;
        }

        .status-info.pending {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffd60a;
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
        }
      `}</style>
    </div>
  );
};

export default FarmerContractsTab;
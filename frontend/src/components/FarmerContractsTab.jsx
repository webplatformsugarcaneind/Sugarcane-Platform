import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

/**
 * Premium SVG Icons
 */
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
  Calendar: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>)
};

/**
 * FarmerContractsTab Component
 * Displays farmer's contract requests and their statuses
 */
const FarmerContractsTab = () => {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifError, setNotifError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchContracts();
    fetchNotifications();
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

      setContracts(response.data.data.contracts || []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err.response?.data?.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      setNotifError(null);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data?.data?.notifications || response.data?.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifError('Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const clearNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete('/api/notifications/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
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
      farmer_pending: t('farmerContracts.statusPending'),
      hhm_accepted: t('farmerContracts.statusAccepted'),
      hhm_rejected: t('farmerContracts.statusRejected'),
      auto_cancelled: t('farmerContracts.statusCancelled')
    };
    return labels[status] || t('farmerContracts.statusPending');
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

  if (loading) {
    return (
      <div className="fr-loading">
        <div className="fr-spinner"></div>
        <p>{t('farmerContracts.loadingReq')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fr-empty">
        <div className="fr-empty-icon fr-error"><Icons.Alert /></div>
        <h3 className="fr-error-text">{t('farmerContracts.errLoading')}</h3>
        <p>{error}</p>
        <button onClick={fetchContracts} className="fr-retry-btn" style={{ marginTop: '1rem' }}>
          {t('farmerContracts.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="fr-contracts-tab">
      <div className="fr-contracts-header">
        <h2 className="fr-section-title">
          <span className="fr-title-icon"><Icons.List /></span>
          {t('farmerContracts.myJobReq')}
        </h2>
      </div>

      <div className="fr-filter-bar">
        <label htmlFor="statusFilter">{t('farmerContracts.filterStatus')}</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="fr-select"
        >
          <option value="all">{t('farmerContracts.optAll')}</option>
          <option value="farmer_pending">{t('farmerContracts.optPending')}</option>
          <option value="hhm_accepted">{t('farmerContracts.optAccepted')}</option>
          <option value="hhm_rejected">{t('farmerContracts.optRejected')}</option>
          <option value="auto_cancelled">{t('farmerContracts.optCancelled')}</option>
        </select>
      </div>



      {filteredContracts.length === 0 ? (
        <div className="fr-empty">
          <div className="fr-empty-icon"><Icons.Empty /></div>
          <h3>{t('farmerContracts.noReqFound')}</h3>
          <p>
            {contracts.length === 0
              ? t('farmerContracts.emptyNoRequests')
              : t('farmerContracts.emptyFilter')
            }
          </p>
        </div>
      ) : (
        <div className="fr-contracts-list">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="fr-contract-card">
              <div className="fr-contract-top">
                <div className="fr-contract-info-main">
                  <h4>{contract.contract_details?.workType || 'Job Request'}</h4>
                  <span className="fr-contract-date">
                    <Icons.Calendar />
                    Sent on {formatDate(contract.createdAt)}
                  </span>
                </div>
                <span className={`fr-badge ${getStatusBadgeClass(contract.status)}`}>
                  {getStatusIcon(contract.status)}
                  {getStatusLabel(contract.status)}
                </span>
              </div>

              <div className="fr-contract-grid">
                <div className="fr-detail-item">
                  <span className="fr-detail-label">{t('farmerContracts.hhmPartner')}</span>
                  <span className="fr-detail-val">
                    <Icons.User />
                    {contract.hhm_id?.name || t('farmerContracts.unknown')}
                  </span>
                </div>
                <div className="fr-detail-item">
                  <span className="fr-detail-label">{t('farmerContracts.location')}</span>
                  <span className="fr-detail-val">
                    <Icons.Location />
                    {contract.contract_details?.farmLocation || t('farmerContracts.notSpecified')}
                  </span>
                </div>
                <div className="fr-detail-item">
                  <span className="fr-detail-label">{t('farmerContracts.payment')}</span>
                  <span className="fr-detail-val">
                    <Icons.Money />
                    {contract.contract_details?.paymentTerms || t('farmerContracts.notSpecified')}
                  </span>
                </div>
                <div className="fr-detail-item">
                  <span className="fr-detail-label">{t('farmerContracts.duration')}</span>
                  <span className="fr-detail-val">
                    <Icons.Clock />
                    {contract.duration_days} {t('farmerContracts.days')}
                  </span>
                </div>
              </div>

              <div className={`fr-status-box ${getStatusBadgeClass(contract.status)}`}>
                {getStatusIcon(contract.status)}
                {contract.status === 'hhm_accepted' && (
                  <div>{t('farmerContracts.msgAccepted')}</div>
                )}
                {contract.status === 'auto_cancelled' && (
                  <div>{t('farmerContracts.msgCancelled')}</div>
                )}
                {contract.status === 'hhm_rejected' && (
                  <div>{t('farmerContracts.msgRejected')}</div>
                )}
                {contract.status === 'farmer_pending' && (
                  <div>{t('farmerContracts.msgPending1')} {contract.grace_period_days} {t('farmerContracts.msgPending2')}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RECENT NOTIFICATIONS SECTION */}
      <div className="fr-section" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div className="fr-section-header">
          <h2 className="fr-section-title">
            <span className="fr-title-icon"><Icons.Alert /></span>
            {t('farmerContracts.recentNotifs')}
          </h2>
          {notifications.length > 0 && (
            <button onClick={clearNotifications} className="fr-clear-btn">
              {t('farmerContracts.clearAll')}
            </button>
          )}
        </div>
        
        {notifLoading ? (
          <div className="fr-loading">
            <div className="fr-spinner"></div>
            <p>{t('farmerContracts.loadingAlerts')}</p>
          </div>
        ) : notifError ? (
          <div className="fr-empty">
            <p className="fr-error-text">{notifError}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="fr-empty" style={{ padding: '20px' }}>
            <p>{t('farmerContracts.noNewNotifs')}</p>
          </div>
        ) : (
          <div className="fr-notif-grid">
            {notifications.map((notif) => (
              <div key={notif._id} className="fr-notif-card">
                {!notif.isRead && <div className="fr-notif-unread" />}
                <div className="fr-notif-header">
                  <span className="fr-notif-type">{notif.type?.replace(/_/g, ' ')}</span>
                  <span className={`fr-priority ${getPriorityClass(notif.priority)}`}>
                    {notif.priority || 'Normal'}
                  </span>
                </div>
                <p className="fr-notif-msg">{notif.message}</p>
                <div className="fr-notif-footer">
                  <span className="fr-footer-icon"><Icons.Calendar /></span>
                  {formatDate(notif.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerContractsTab;

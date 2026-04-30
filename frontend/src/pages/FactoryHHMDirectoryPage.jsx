import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationToast from '../components/NotificationToast';
import useNotifications from '../hooks/useNotifications';
import './FactoryHHMDirectoryPage.css';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const FactoryHHMDirectoryPage = () => {
  const navigate = useNavigate();
  const { notifications, dismissNotification, notify } = useNotifications();
  const [hhms, setHhms] = useState([]);
  const [filteredHhms, setFilteredHhms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isListView, setIsListView] = useState(false);

  // Invitation modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedHHM, setSelectedHHM] = useState(null);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState(null);

  // Sub-navigation state
  const [activeTab, setActiveTab] = useState('allHHMs');

  // Request and Application states
  const [myRequests, setMyRequests] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Filter and sort function
  const filterAndSortHHMs = useCallback(() => {
    let filtered = [...hhms];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(hhm =>
        hhm.name?.toLowerCase().includes(q) ||
        hhm.username?.toLowerCase().includes(q) ||
        hhm.email?.toLowerCase().includes(q) ||
        hhm.phone?.includes(q) ||
        hhm.specialization?.toLowerCase().includes(q)
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter(hhm =>
        hhm.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'username') return (a.username || '').localeCompare(b.username || '');
      if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
      if (sortBy === 'location') return (a.location || '').localeCompare(b.location || '');
      return 0;
    });

    setFilteredHhms(filtered);
  }, [hhms, searchTerm, selectedLocation, sortBy]);

  useEffect(() => { fetchHHMs(); }, []);
  useEffect(() => { filterAndSortHHMs(); }, [filterAndSortHHMs]);
  useEffect(() => {
    if (activeTab === 'myRequests') fetchMyRequests();
    else if (activeTab === 'receivedApplications') fetchReceivedApplications();
  }, [activeTab]);

  const fetchHHMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) { setError('No authentication token found. Please login again.'); return; }
      
      const response = await axios.get('/api/factory/hhms', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const hhmData = response.data.data || response.data.hhms || response.data || [];
      setHhms(Array.isArray(hhmData) ? hhmData : []);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError('Access denied. Please ensure you are logged in with the correct Factory role.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch HHM directory. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('/api/factory/invitations', { headers: { 'Authorization': `Bearer ${token}` } });
      setMyRequests(response.data.data || []);
    } catch (err) {
      console.error('Error fetching sent invitations:', err);
    } finally { setRequestsLoading(false); }
  };

  const fetchReceivedApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('/api/factory/received-invitations', { headers: { 'Authorization': `Bearer ${token}` } });
      setReceivedApplications(response.data.data || []);
    } catch (err) {
      console.error('Error fetching received invitations:', err);
    } finally { setApplicationsLoading(false); }
  };

  const handleApplicationResponse = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await axios.put(`/api/factory/received-invitations/${applicationId}`, { status }, { headers: { 'Authorization': `Bearer ${token}` } });
      await fetchReceivedApplications();
      setInvitationSuccess(`Application ${status} successfully!`);
      setTimeout(() => setInvitationSuccess(null), 3000);
    } catch (err) {
      setError('Failed to respond to application. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSortBy('name');
  };

  const uniqueLocations = [...new Set(hhms.map(hhm => hhm.location).filter(Boolean))];
  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const handleInviteClick = (hhm) => {
    setSelectedHHM(hhm);
    setInvitationMessage('');
    setInvitationSuccess(null);
    setShowInviteModal(true);
  };

  const handleSendInvitation = async () => {
    if (!selectedHHM) return;
    try {
      setSendingInvitation(true);
      const token = localStorage.getItem('token');
      if (!token) { setInvitationSuccess({ type: 'error', message: 'Authentication required. Please login again.' }); return; }
      if (!selectedHHM._id || selectedHHM._id.length !== 24) { setInvitationSuccess({ type: 'error', message: 'Invalid HHM selected. Please refresh the page and try again.' }); return; }
      
      await axios.post('/api/factory/invite-hhm', { hhmId: selectedHHM._id, personalMessage: invitationMessage }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      notify.hhmInvitationSent('Factory', selectedHHM.name);
      setTimeout(() => { setShowInviteModal(false); setSelectedHHM(null); setInvitationMessage(''); }, 2000);
    } catch (err) {
      let errorMessage = 'Failed to send invitation. Please try again.';
      if (err.response?.status === 401) errorMessage = 'Your session has expired. Please login again.';
      else if (err.response?.status === 403) errorMessage = 'You do not have permission to send invitations. Please contact support.';
      else if (err.response?.status === 409) errorMessage = err.response.data.message || 'You have already sent an invitation to this HHM.';
      else if (err.response?.status === 429) errorMessage = err.response.data.message || 'Please wait before sending another invitation to this HHM.';
      else if (err.response?.status === 400) errorMessage = err.response.data.message || 'Invalid invitation request.';
      else if (err.response?.status === 404) errorMessage = 'The selected HHM was not found. Please refresh the page and try again.';
      else if (err.response?.data?.message) errorMessage = err.response.data.message;
      setInvitationSuccess({ type: 'error', message: errorMessage });
    } finally {
      setSendingInvitation(false);
    }
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedHHM(null);
    setInvitationMessage('');
    setInvitationSuccess(null);
  };

  const kpiTotal = hhms.length;
  const kpiActive = hhms.filter(h => h.isActive !== false).length;
  const kpiLocations = uniqueLocations.length;
  const kpiRecent = hhms.filter(h => { if (!h.createdAt) return false; const d = new Date(h.createdAt); const now = new Date(); return (now - d) < 30 * 24 * 60 * 60 * 1000; }).length;

  return (
    <div className="hd-page">
      {/* HEADER */}
      <div className="hd-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">Factory View</div>
            <h1 className="hd-title">HHM <em>Directory</em></h1>
            <p className="hd-sub">Connect with experienced Harvest Managers for efficient crop coordination</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="hd-tabs">
        <button className={`hd-tab ${activeTab === 'allHHMs' ? 'active' : ''}`} onClick={() => setActiveTab('allHHMs')}>
          <span className="hd-tab-icon">👥</span> All HHMs
        </button>
        <button className={`hd-tab ${activeTab === 'myRequests' ? 'active' : ''}`} onClick={() => setActiveTab('myRequests')}>
          <span className="hd-tab-icon">📤</span> My Requests {requestsLoading && <span>...</span>}
        </button>
        <button className={`hd-tab ${activeTab === 'receivedApplications' ? 'active' : ''}`} onClick={() => setActiveTab('receivedApplications')}>
          <span className="hd-tab-icon">📥</span> Received Applications {applicationsLoading && <span>...</span>}
        </button>
      </div>

      {/* KPI ROW (Only in All HHMs tab) */}
      {activeTab === 'allHHMs' && (
        <div className="hd-kpi-row">
          <div className="hd-kpi g"><div className="hd-kpi-label">Total HHMs</div><div className="hd-kpi-val g">{kpiTotal}</div><div className="hd-kpi-sub">In directory</div></div>
          <div className="hd-kpi a"><div className="hd-kpi-label">Active HHMs</div><div className="hd-kpi-val a">{kpiActive}</div><div className="hd-kpi-sub">Ready to coordinate</div></div>
          <div className="hd-kpi b"><div className="hd-kpi-label">Locations</div><div className="hd-kpi-val b">{kpiLocations}</div><div className="hd-kpi-sub">Regions covered</div></div>
          <div className="hd-kpi g"><div className="hd-kpi-label">New This Month</div><div className="hd-kpi-val g">{kpiRecent}</div><div className="hd-kpi-sub">Recently joined</div></div>
        </div>
      )}

      {invitationSuccess && typeof invitationSuccess === 'string' && (
        <div className="hd-success-banner">{invitationSuccess}</div>
      )}

      {activeTab === 'allHHMs' && (
        <>
          <div className="hd-toolbar">
            <div className="hd-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)' }}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search by name, specialization, location…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="hd-search" />
            </div>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="hd-filter">
              <option value="">All Locations</option>
              {uniqueLocations.map((loc, i) => <option key={i} value={loc}>📍 {loc}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="hd-filter">
              <option value="name">Sort: Name A–Z</option>
              <option value="experience">Sort: Experience</option>
              <option value="location">Sort: Location</option>
              <option value="username">Sort: Username</option>
            </select>
            <div className="hd-view-toggle">
              <button className={`hd-vt-btn ${!isListView ? 'active' : ''}`} onClick={() => setIsListView(false)} title="Grid view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              <button className={`hd-vt-btn ${isListView ? 'active' : ''}`} onClick={() => setIsListView(true)} title="List view">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div className="hd-results-meta">
            <div className="hd-results-count"><strong>{filteredHhms.length}</strong> of {hhms.length} harvest managers found</div>
          </div>

          <div className={`hd-grid${isListView ? ' list-view' : ''}`}>
            {loading ? (
              <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading HHM directory...</div></div>
            ) : error ? (
              <div className="hd-empty">
                <div className="hd-empty-icon">⚠️</div>
                <div className="hd-empty-title">Error Loading Directory</div>
                <div className="hd-empty-sub">{error}</div>
                <button onClick={fetchHHMs} className="hd-btn-request" style={{ marginTop: 8 }}>Try Again</button>
              </div>
            ) : filteredHhms.length === 0 ? (
              <div className="hd-empty">
                <div className="hd-empty-icon">👥</div>
                <div className="hd-empty-title">No Harvest Managers Found</div>
                <div className="hd-empty-sub">{(searchTerm || selectedLocation) ? 'Try adjusting your search or filter criteria.' : 'No harvest managers are currently available.'}</div>
                {(searchTerm || selectedLocation) && <button onClick={clearFilters} className="hd-btn-profile" style={{marginTop: 16}}>Clear All Filters</button>}
              </div>
            ) : (
              filteredHhms.map((hhm, idx) => (
                <div key={hhm._id || `hhm-${idx}`} className={`hd-card ${hhm.isActive !== false ? 'active' : 'inactive'}`} style={{ animation: `hdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                  <div className="hc-header">
                    <div className="hc-avatar">👤</div>
                    <div className="hc-title-wrap">
                      <div className="hc-name">{hhm.name || 'Unknown Name'}</div>
                      <div className="hc-username">@{hhm.username || 'unknown'}</div>
                      <div className="hc-role-badge">Harvest Manager</div>
                    </div>
                    <div className="hc-status">
                      <span className={`hd-status-badge ${hhm.isActive !== false ? 'active' : 'inactive'}`}>
                        {hhm.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="hc-contact">
                    {hhm.email && (
                      <div className="hc-contact-item">
                        <span className="hc-contact-icon">📧</span>
                        <span className="hc-contact-text">{hhm.email}</span>
                      </div>
                    )}
                    {hhm.phone && (
                      <div className="hc-contact-item">
                        <span className="hc-contact-icon">📱</span>
                        <span className="hc-contact-text">{hhm.phone}</span>
                      </div>
                    )}
                    {hhm.location && (
                      <div className="hc-contact-item">
                        <span className="hc-contact-icon">📍</span>
                        <span className="hc-contact-text">{hhm.location}</span>
                      </div>
                    )}
                    {hhm.experience && (
                      <div className="hc-contact-item">
                        <span className="hc-contact-icon">⭐</span>
                        <span className="hc-contact-text">{hhm.experience} years exp.</span>
                      </div>
                    )}
                  </div>

                  <div className="hc-divider"></div>

                  <div className="hc-meta">
                    <div className="hc-meta-item">Member since: <strong>{formatDate(hhm.createdAt)}</strong></div>
                  </div>

                  <div className="hc-actions">
                    <button className="hd-btn-request" onClick={() => handleInviteClick(hhm)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Send Invite
                    </button>
                    <button className="hd-btn-profile" onClick={() => navigate(`/factory/hhm-directory/${hhm._id}`)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View Profile
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* My Requests Tab */}
      {activeTab === 'myRequests' && (
        <div className="hd-section">
          <h2 className="hd-section-title">📤 My Sent Invitations</h2>
          {requestsLoading ? (
            <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading your requests...</div></div>
          ) : myRequests.length === 0 ? (
            <div className="hd-empty">
              <div className="hd-empty-icon">📤</div>
              <div className="hd-empty-title">No Sent Invitations</div>
              <div className="hd-empty-sub">You haven't sent any invitations to Harvest Managers yet.</div>
            </div>
          ) : (
            <div className="hd-list">
              {myRequests.map((request) => (
                <div key={request._id} className="hd-list-card">
                  <h4>{request.hhmId?.name || request.hhmName || 'Unknown HHM'}</h4>
                  <p><strong>Status:</strong> {request.status}</p>
                  <p><strong>Sent:</strong> {formatDate(request.createdAt)}</p>
                  {request.hhmId?.email && <p><strong>Email:</strong> {request.hhmId.email}</p>}
                  {request.hhmId?.phone && <p><strong>Phone:</strong> {request.hhmId.phone}</p>}
                  {request.message && <p><strong>Message:</strong> {request.message}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Received Applications Tab */}
      {activeTab === 'receivedApplications' && (
        <div className="hd-section">
          <h2 className="hd-section-title">📥 Received Applications</h2>
          {applicationsLoading ? (
            <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading applications...</div></div>
          ) : receivedApplications.length === 0 ? (
            <div className="hd-empty">
              <div className="hd-empty-icon">📥</div>
              <div className="hd-empty-title">No Applications Received</div>
              <div className="hd-empty-sub">No Harvest Managers have applied to work with you yet.</div>
            </div>
          ) : (
            <div className="hd-list">
              {receivedApplications.map((application) => (
                <div key={application._id} className="hd-list-card">
                  <h4>{application.hhmId?.name || application.hhmName || 'Unknown HHM'}</h4>
                  <p><strong>Status:</strong> {application.status}</p>
                  <p><strong>Applied:</strong> {formatDate(application.createdAt)}</p>
                  {application.hhmId?.email && <p><strong>Email:</strong> {application.hhmId.email}</p>}
                  {application.hhmId?.phone && <p><strong>Phone:</strong> {application.hhmId.phone}</p>}
                  {application.hhmId?.experience && <p><strong>Experience:</strong> {application.hhmId.experience} years</p>}
                  {application.message && <p><strong>Message:</strong> {application.message}</p>}
                  {application.status === 'pending' && (
                    <div className="hd-app-actions">
                      <button className="hd-btn-accept" onClick={() => handleApplicationResponse(application._id, 'accepted')}>✅ Accept</button>
                      <button className="hd-btn-decline" onClick={() => handleApplicationResponse(application._id, 'declined')}>❌ Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invitation Modal */}
      {showInviteModal && selectedHHM && (
        <div className="hd-modal-overlay" onClick={closeInviteModal}>
          <div className="hd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hd-modal-header">
              <h2>📨 Send Invitation to {selectedHHM.name}</h2>
              <button className="hd-modal-close" onClick={closeInviteModal}>×</button>
            </div>
            <div className="hd-modal-body">
              {invitationSuccess ? (
                <div className={`hd-alert ${invitationSuccess.type === 'success' ? 'success' : 'error'}`}>{invitationSuccess.message}</div>
              ) : (
                <>
                  <div className="hd-preview">
                    <div className="hd-preview-avatar">👤</div>
                    <div className="hd-preview-info">
                      <h3>{selectedHHM.name}</h3>
                      <p>📍 {selectedHHM.location || 'Location not specified'}</p>
                      <p>📧 {selectedHHM.email}</p>
                    </div>
                  </div>
                  <div className="hd-form-group">
                    <label htmlFor="invitation-message">Message (Optional)</label>
                    <textarea id="invitation-message" value={invitationMessage} onChange={(e) => setInvitationMessage(e.target.value)} placeholder="Add a personal message to your invitation..." rows="4" className="hd-textarea" />
                    <small className="hd-form-hint">Explain why you'd like to partner with this Harvest Manager</small>
                  </div>
                </>
              )}
            </div>
            {!invitationSuccess && (
              <div className="hd-modal-footer">
                <button className="hd-btn-profile" onClick={closeInviteModal} disabled={sendingInvitation}>Cancel</button>
                <button className="hd-btn-request" onClick={handleSendInvitation} disabled={sendingInvitation}>{sendingInvitation ? 'Sending...' : '📨 Send Invitation'}</button>
              </div>
            )}
          </div>
        </div>
      )}

      <NotificationToast notifications={notifications} onDismiss={dismissNotification} position="top-right" />
    </div>
  );
};

export default FactoryHHMDirectoryPage;

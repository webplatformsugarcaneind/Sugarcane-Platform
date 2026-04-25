import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationToast from '../components/NotificationToast';
import useNotifications from '../hooks/useNotifications';
import './FactoryHHMDirectoryPage.css';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

/**
 * FactoryHHMDirectoryPage Component
 * 
 * Page for factory users to view and search through Harvest Managers (HHMs).
 * Includes search functionality, filtering, and displays HHM data in a card format.
 * Adapted for factory perspective with emphasis on harvest coordination and partnerships.
 */
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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(hhm =>
        hhm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hhm.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hhm.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hhm.phone?.includes(searchTerm) ||
        hhm.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(hhm =>
        hhm.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'experience':
          return (b.experience || 0) - (a.experience || 0);
        case 'location':
          return (a.location || '').localeCompare(b.location || '');
        default:
          return 0;
      }
    });

    setFilteredHhms(filtered);
  }, [hhms, searchTerm, selectedLocation, sortBy]);

  useEffect(() => {
    fetchHHMs();
  }, []);

  useEffect(() => {
    filterAndSortHHMs();
  }, [filterAndSortHHMs]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'myRequests') {
      fetchMyRequests();
    } else if (activeTab === 'receivedApplications') {
      fetchReceivedApplications();
    }
  }, [activeTab]);

  const fetchHHMs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Use the new factory/hhms endpoint that's specifically designed for factory users
      const response = await axios.get('/api/factory/hhms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const hhmData = response.data.data || response.data.hhms || response.data || [];
      setHhms(Array.isArray(hhmData) ? hhmData : []);
    } catch (err) {
      console.error('Error fetching HHMs:', err);

      if (err.response?.status === 403 || err.response?.status === 401) {
        setError(
          'Access denied. Please ensure you are logged in with the correct Factory role.'
        );
      } else {
        setError(
          err.response?.data?.message ||
          'Failed to fetch HHM directory. Please try again later.'
        );
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

      console.log('🔍 Fetching factory sent invitations...');

      // Corrected API endpoint for factory's sent invitations to HHMs
      const response = await axios.get('/api/factory/invitations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('🔍 My Requests response:', response.data);
      console.log('🔍 Sent invitations data:', response.data.data);
      console.log('🔍 Sample invitation structure:', response.data.data[0]);

      setMyRequests(response.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching sent invitations:', err);
      console.error('❌ Error response:', err.response?.data);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchReceivedApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;

      console.log('🔍 Fetching factory received invitations...');

      // Corrected API endpoint for invitations received by the factory from HHMs
      const response = await axios.get('/api/factory/received-invitations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('🔍 Received Applications response:', response.data);
      console.log('🔍 Received invitations data:', response.data.data);
      console.log('🔍 Sample received invitation structure:', response.data.data[0]);

      setReceivedApplications(response.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching received invitations:', err);
      console.error('❌ Error response:', err.response?.data);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Handle application response (accept/decline)
  const handleApplicationResponse = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return;

      console.log(`🔄 Responding to application ${applicationId} with status: ${status}`);

      const response = await axios.put(`/api/factory/received-invitations/${applicationId}`, {
        status: status
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ Application response sent:', response.data);

      // Refresh the received applications list
      await fetchReceivedApplications();

      // Show success message using existing state
      setInvitationSuccess(`Application ${status} successfully!`);
      setTimeout(() => setInvitationSuccess(null), 3000);

    } catch (err) {
      console.error('❌ Error responding to application:', err);
      setError('Failed to respond to application. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSortBy('name');
  };

  // Get unique locations for filter dropdown
  const uniqueLocations = [...new Set(hhms
    .map(hhm => hhm.location)
    .filter(location => location)
  )];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInviteClick = (hhm) => {
    setSelectedHHM(hhm);
    setInvitationMessage('');
    setInvitationSuccess(null);
    setShowInviteModal(true);
  };

  const handleViewProfile = (hhm) => {
    console.log('🔍 DEBUG: HHM data for profile viewing:', hhm);
    console.log('🔍 DEBUG: HHM ID:', hhm._id);
    navigate(`/factory/hhm-directory/${hhm._id}`);
  };

  const handleSendInvitation = async () => {
    if (!selectedHHM) return;

    try {
      setSendingInvitation(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setInvitationSuccess({
          type: 'error',
          message: 'Authentication required. Please login again.'
        });
        return;
      }

      console.log('Sending invitation to HHM:', selectedHHM._id);
      console.log('With message:', invitationMessage);
      
      // Validate HHM ID format
      if (!selectedHHM._id || selectedHHM._id.length !== 24) {
        setInvitationSuccess({
          type: 'error',
          message: 'Invalid HHM selected. Please refresh the page and try again.'
        });
        return;
      }
      
      await axios.post(
        '/api/factory/invite-hhm',
        {
          hhmId: selectedHHM._id,
          personalMessage: invitationMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Show simple one-line notification
      notify.hhmInvitationSent('Factory', selectedHHM.name);

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowInviteModal(false);
        setSelectedHHM(null);
        setInvitationMessage('');
      }, 2000);

    } catch (err) {
      console.error('Error sending invitation:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      let errorMessage = 'Failed to send invitation. Please try again.';
      
      if (err.response?.status === 401) {
        // Unauthorized - token expired or invalid
        errorMessage = 'Your session has expired. Please login again.';
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (err.response?.status === 403) {
        // Forbidden - insufficient permissions
        errorMessage = 'You do not have permission to send invitations. Please contact support.';
      } else if (err.response?.status === 409) {
        // Conflict - duplicate invitation
        errorMessage = err.response.data.message || 'You have already sent an invitation to this HHM.';
      } else if (err.response?.status === 429) {
        // Too many requests - recent decline
        errorMessage = err.response.data.message || 'Please wait before sending another invitation to this HHM.';
      } else if (err.response?.status === 400) {
        // Bad request - validation or already associated
        errorMessage = err.response.data.message || 'Invalid invitation request.';
      } else if (err.response?.status === 404) {
        // Not found - HHM doesn't exist
        errorMessage = 'The selected HHM was not found. Please refresh the page and try again.';
      } else if (err.response?.data?.message) {
        // Use server error message if available
        errorMessage = err.response.data.message;
      }
      
      setInvitationSuccess({
        type: 'error',
        message: errorMessage
      });
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

  return (
    <div className="fhd-page">
      {/* Header */}
      <div className="fhd-header">
        <div className="fhd-eyebrow">Factory View</div>
        <h1 className="fhd-title">Harvest Manager <em>Directory</em></h1>
        <p className="fhd-sub">
          Connect with experienced Harvest Managers for efficient crop coordination
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="fhd-tabs">
        <button
          className={`fhd-tab ${activeTab === 'allHHMs' ? 'active' : ''}`}
          onClick={() => setActiveTab('allHHMs')}
        >
          <span className="fhd-tab-icon">👥</span>
          All HHMs
        </button>
        <button
          className={`fhd-tab ${activeTab === 'myRequests' ? 'active' : ''}`}
          onClick={() => setActiveTab('myRequests')}
        >
          <span className="fhd-tab-icon">📤</span>
          My Requests
          {requestsLoading && <span>...</span>}
        </button>
        <button
          className={`fhd-tab ${activeTab === 'receivedApplications' ? 'active' : ''}`}
          onClick={() => setActiveTab('receivedApplications')}
        >
          <span className="fhd-tab-icon">📥</span>
          Received Applications
          {applicationsLoading && <span>...</span>}
        </button>
      </div>

      {/* Success Banner */}
      {invitationSuccess && typeof invitationSuccess === 'string' && (
        <div className="fhd-success-banner">{invitationSuccess}</div>
      )}

      {/* Search and Filter Section - only show for All HHMs tab */}
      {activeTab === 'allHHMs' && (
        <>
          <div className="fhd-toolbar">
            <div className="fhd-search-wrap">
              <span className="fhd-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, specialization, location…"
                value={searchTerm}
                onChange={handleSearchChange}
                className="fhd-search"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              className="fhd-filter"
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((location, index) => (
                <option key={index} value={location}>
                  📍 {location}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={handleSortChange}
              className="fhd-filter"
            >
              <option value="name">Sort: Name A–Z</option>
              <option value="experience">Sort: Experience</option>
              <option value="location">Sort: Location</option>
              <option value="username">Sort: Username</option>
            </select>

            <button onClick={clearFilters} className="fhd-clear-btn">
              Clear Filters
            </button>
          </div>

          <div className="fhd-results-meta">
            <div className="fhd-results-count">
              <strong>{filteredHhms.length}</strong> of {hhms.length} harvest managers found
            </div>
          </div>
        </>
      )}

      {/* Content Section */}
      <div>
        {/* All HHMs Tab Content */}
        {activeTab === 'allHHMs' && (
          <>
            {loading ? (
              <div className="fhd-empty">
                <div className="fhd-spinner"></div>
                <div className="fhd-empty-title">Loading HHM directory...</div>
              </div>
            ) : error ? (
              <div className="fhd-empty">
                <div className="fhd-empty-icon">⚠️</div>
                <div className="fhd-empty-title">Error Loading Directory</div>
                <div className="fhd-empty-sub">{error}</div>
                <button onClick={fetchHHMs} className="fhd-btn-primary" style={{ marginTop: 8 }}>
                  Try Again
                </button>
              </div>
            ) : filteredHhms.length === 0 ? (
              <div className="fhd-empty">
                <div className="fhd-empty-icon">🌾</div>
                <div className="fhd-empty-title">No Harvest Managers Found</div>
                <div className="fhd-empty-sub">
                  {searchTerm || selectedLocation
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No harvest managers are currently available.'}
                </div>
                {(searchTerm || selectedLocation) && (
                  <button onClick={clearFilters} className="fhd-clear-btn">Clear All Filters</button>
                )}
              </div>
            ) : (
              <div className="fhd-grid">
                {filteredHhms.map((hhm, idx) => (
                  <div key={hhm._id} className="fhd-card" style={{ animation: `fhdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
                    <div className="fhd-card-header">
                      <div className="fhd-avatar">🌾</div>
                      <div className="fhd-card-title">
                        <div className="fhd-card-name">{hhm.name || 'Unknown Name'}</div>
                        <div className="fhd-card-username">@{hhm.username || 'unknown'}</div>
                        <div className="fhd-role-badge">Harvest Manager</div>
                      </div>
                    </div>

                    <div className="fhd-contact">
                      <div className="fhd-contact-item">
                        <span className="fhd-contact-icon">📍</span>
                        <span className="fhd-contact-text">{hhm.location || 'Location not specified'}</span>
                      </div>
                      {hhm.email && (
                        <div className="fhd-contact-item">
                          <span className="fhd-contact-icon">📧</span>
                          <span className="fhd-contact-text">{hhm.email}</span>
                        </div>
                      )}
                      {hhm.phone && (
                        <div className="fhd-contact-item">
                          <span className="fhd-contact-icon">📱</span>
                          <span className="fhd-contact-text">{hhm.phone}</span>
                        </div>
                      )}
                      {hhm.specialization && (
                        <div className="fhd-contact-item">
                          <span className="fhd-contact-icon">🎯</span>
                          <span className="fhd-contact-text">{hhm.specialization}</span>
                        </div>
                      )}
                      {hhm.experience && (
                        <div className="fhd-contact-item">
                          <span className="fhd-contact-icon">⭐</span>
                          <span className="fhd-contact-text">{hhm.experience} years experience</span>
                        </div>
                      )}
                    </div>

                    <div className="fhd-divider"></div>

                    <div className="fhd-actions">
                      <button className="fhd-btn-primary" onClick={() => handleInviteClick(hhm)}>
                        📨 Send Invite
                      </button>
                      <button className="fhd-btn-secondary" onClick={() => handleViewProfile(hhm)}>
                        📋 View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Requests Tab Content */}
        {activeTab === 'myRequests' && (
          <div className="fhd-section">
            <h2 className="fhd-section-title">📤 My Sent Invitations</h2>
            {requestsLoading ? (
              <div className="fhd-empty">
                <div className="fhd-spinner"></div>
                <div className="fhd-empty-title">Loading your requests...</div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="fhd-empty">
                <div className="fhd-empty-icon">📤</div>
                <div className="fhd-empty-title">No Sent Invitations</div>
                <div className="fhd-empty-sub">You haven't sent any invitations to Harvest Managers yet.</div>
              </div>
            ) : (
              <div className="fhd-list">
                {myRequests.map((request) => (
                  <div key={request._id} className="fhd-list-card">
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

        {/* Received Applications Tab Content */}
        {activeTab === 'receivedApplications' && (
          <div className="fhd-section">
            <h2 className="fhd-section-title">📥 Received Applications</h2>
            {applicationsLoading ? (
              <div className="fhd-empty">
                <div className="fhd-spinner"></div>
                <div className="fhd-empty-title">Loading applications...</div>
              </div>
            ) : receivedApplications.length === 0 ? (
              <div className="fhd-empty">
                <div className="fhd-empty-icon">📥</div>
                <div className="fhd-empty-title">No Applications Received</div>
                <div className="fhd-empty-sub">No Harvest Managers have applied to work with you yet.</div>
              </div>
            ) : (
              <div className="fhd-list">
                {receivedApplications.map((application) => (
                  <div key={application._id} className="fhd-list-card">
                    <h4>{application.hhmId?.name || application.hhmName || 'Unknown HHM'}</h4>
                    <p><strong>Status:</strong> {application.status}</p>
                    <p><strong>Applied:</strong> {formatDate(application.createdAt)}</p>
                    {application.hhmId?.email && <p><strong>Email:</strong> {application.hhmId.email}</p>}
                    {application.hhmId?.phone && <p><strong>Phone:</strong> {application.hhmId.phone}</p>}
                    {application.hhmId?.experience && <p><strong>Experience:</strong> {application.hhmId.experience} years</p>}
                    {application.message && <p><strong>Message:</strong> {application.message}</p>}
                    {application.status === 'pending' && (
                      <div className="fhd-app-actions">
                        <button
                          className="fhd-btn-accept"
                          onClick={() => handleApplicationResponse(application._id, 'accepted')}
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="fhd-btn-decline"
                          onClick={() => handleApplicationResponse(application._id, 'declined')}
                        >
                          ❌ Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invitation Modal */}
      {showInviteModal && selectedHHM && (
        <div className="fhd-modal-overlay" onClick={closeInviteModal}>
          <div className="fhd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fhd-modal-header">
              <h2>📨 Send Invitation to {selectedHHM.name}</h2>
              <button className="fhd-modal-close" onClick={closeInviteModal}>×</button>
            </div>

            <div className="fhd-modal-body">
              {invitationSuccess ? (
                <div className={`fhd-alert ${invitationSuccess.type === 'success' ? 'success' : 'error'}`}>
                  {invitationSuccess.message}
                </div>
              ) : (
                <>
                  <div className="fhd-preview">
                    <div className="fhd-preview-avatar">🌾</div>
                    <div className="fhd-preview-info">
                      <h3>{selectedHHM.name}</h3>
                      <p>📍 {selectedHHM.location || 'Location not specified'}</p>
                      <p>📧 {selectedHHM.email}</p>
                    </div>
                  </div>

                  <div className="fhd-form-group">
                    <label htmlFor="invitation-message">Message (Optional)</label>
                    <textarea
                      id="invitation-message"
                      value={invitationMessage}
                      onChange={(e) => setInvitationMessage(e.target.value)}
                      placeholder="Add a personal message to your invitation..."
                      rows="4"
                      className="fhd-textarea"
                    />
                    <small className="fhd-form-hint">
                      Explain why you'd like to partner with this Harvest Manager
                    </small>
                  </div>
                </>
              )}
            </div>

            {!invitationSuccess && (
              <div className="fhd-modal-footer">
                <button
                  className="fhd-btn-secondary"
                  onClick={closeInviteModal}
                  disabled={sendingInvitation}
                >
                  Cancel
                </button>
                <button
                  className="fhd-btn-primary"
                  onClick={handleSendInvitation}
                  disabled={sendingInvitation}
                >
                  {sendingInvitation ? 'Sending...' : '📨 Send Invitation'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      <NotificationToast 
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top-right"
      />
    </div>
  );
};

export default FactoryHHMDirectoryPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationToast from '../components/NotificationToast';
import useNotifications from '../hooks/useNotifications';
<<<<<<< HEAD

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';
=======
import { configureAxios } from '../config/api';

// Set axios base URL
configureAxios(axios);
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3

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
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      // Validate HHM ID format
      if (!selectedHHM._id || selectedHHM._id.length !== 24) {
        setInvitationSuccess({
          type: 'error',
          message: 'Invalid HHM selected. Please refresh the page and try again.'
        });
        return;
      }
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
      
      let errorMessage = 'Failed to send invitation. Please try again.';
      
=======

      let errorMessage = 'Failed to send invitation. Please try again.';

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
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
    <div className="hhm-directory-page">
      <div className="page-header">
<<<<<<< HEAD
        <h1>🌾 Harvest Manager Directory</h1>
=======
        <h1>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', width: '32px', height: '32px', verticalAlign: 'middle', marginRight: '0.5rem' }}>
            <path d="M2 13c0-2.5 2-4.5 4.5-4.5S11 10.5 11 13v8H2v-8z" />
            <path d="M13 13c0-2.5 2-4.5 4.5-4.5S22 10.5 22 13v8h-9v-8z" />
            <line x1="6.5" y1="8.5" x2="6.5" y2="3" />
            <line x1="17.5" y1="8.5" x2="17.5" y2="3" />
          </svg>
          Harvest Manager Directory
        </h1>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        <p className="page-subtitle">
          Connect with experienced Harvest Managers for efficient crop coordination
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="sub-navigation">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'allHHMs' ? 'active' : ''}`}
            onClick={() => setActiveTab('allHHMs')}
          >
<<<<<<< HEAD
            <span className="tab-icon">👥</span>
=======
            <span className="tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle' }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            All HHMs
          </button>
          <button
            className={`tab-button ${activeTab === 'myRequests' ? 'active' : ''}`}
            onClick={() => setActiveTab('myRequests')}
          >
<<<<<<< HEAD
            <span className="tab-icon">📤</span>
=======
            <span className="tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle' }}>
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                <line x1="12" y1="8" x2="12" y2="2" />
                <polyline points="9 5 12 2 15 5" />
              </svg>
            </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            My Requests
            {requestsLoading && <span className="loading-spinner">...</span>}
          </button>
          <button
            className={`tab-button ${activeTab === 'receivedApplications' ? 'active' : ''}`}
            onClick={() => setActiveTab('receivedApplications')}
          >
<<<<<<< HEAD
            <span className="tab-icon">📥</span>
=======
            <span className="tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle' }}>
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            </span>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            Received Applications
            {applicationsLoading && <span className="loading-spinner">...</span>}
          </button>
        </div>
      </div>

      {/* Search and Filter Section - only show for All HHMs tab */}
      {activeTab === 'allHHMs' && (
<<<<<<< HEAD
      <div className="filter-section">
        <div className="search-controls">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search harvest managers by name, specialization, location..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              className="filter-select"
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
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="experience">Sort by Experience</option>
              <option value="location">Sort by Location</option>
              <option value="username">Sort by Username</option>
            </select>

            <button
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="results-info">
          <span className="results-count">
            {filteredHhms.length} harvest managers available for coordination
          </span>
        </div>
      </div>
=======
        <div className="filter-section">
          <div className="search-controls">
            <div className="search-input-group">
              <span className="search-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', width: '20px', height: '20px', verticalAlign: 'middle' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search harvest managers by name, specialization, location..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                className="filter-select"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
                <option value="location">Sort by Location</option>
                <option value="username">Sort by Username</option>
              </select>

              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="results-info">
            <span className="results-count">
              {filteredHhms.length} harvest managers available for coordination
            </span>
          </div>
        </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      )}

      {/* Content Section */}
      <div className="content-section">
        {/* All HHMs Tab Content */}
        {activeTab === 'allHHMs' && (
          <>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading harvest manager directory...</p>
              </div>
            ) : error ? (
              <div className="error-container">
<<<<<<< HEAD
                <div className="error-icon">⚠️</div>
=======
                <div className="error-icon">
                  <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                <h3>Error Loading Directory</h3>
                <p className="error-message">{error}</p>
                <button
                  onClick={fetchHHMs}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            ) : filteredHhms.length === 0 ? (
              <div className="empty-state">
<<<<<<< HEAD
                <div className="empty-icon">🌾</div>
=======
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 2v20M2 7h10M2 12h10M2 17h10" />
                    <path d="M12 2l5 5-5 5m0 0l-5-5 5-5" />
                  </svg>
                </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                <h3>No Harvest Managers Found</h3>
                <p>
                  {searchTerm || selectedLocation
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No harvest managers are currently available in the directory.'
                  }
                </p>
                {(searchTerm || selectedLocation) && (
                  <button
                    onClick={clearFilters}
                    className="clear-filters-btn"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
<<<<<<< HEAD
          <div className="hhm-grid">
            {filteredHhms.map((hhm) => (
              <div key={hhm._id} className="hhm-card">
                <div className="card-header">
                  <div className="hhm-avatar">
                    <span className="avatar-icon">🌾</span>
                  </div>
                  <div className="hhm-basic-info">
                    <h3 className="hhm-name">{hhm.name || 'Unknown Name'}</h3>
                    <p className="hhm-username">@{hhm.username || 'unknown'}</p>
                  </div>
                </div>

                <div className="card-body">
                  <div className="hhm-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span className="detail-value">{hhm.location || 'Location not specified'}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📧</span>
                      <span className="detail-value">{hhm.email || 'No email provided'}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📱</span>
                      <span className="detail-value">{hhm.phone || 'No phone provided'}</span>
                    </div>

                    {hhm.specialization && (
                      <div className="detail-item">
                        <span className="detail-icon">🎯</span>
                        <span className="detail-value">{hhm.specialization}</span>
                      </div>
                    )}

                    {hhm.experience && (
                      <div className="detail-item">
                        <span className="detail-icon">⭐</span>
                        <span className="detail-value">{hhm.experience} years experience</span>
                      </div>
                    )}

                    {hhm.certifications && hhm.certifications.length > 0 && (
                      <div className="detail-item">
                        <span className="detail-icon">🏆</span>
                        <span className="detail-value">{hhm.certifications.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button
                      className="contact-btn primary"
                      onClick={() => handleInviteClick(hhm)}
                    >
                      📨 Send Invitation
                    </button>
                    <button
                      className="contact-btn secondary"
                      onClick={() => handleViewProfile(hhm)}
                    >
                      📋 View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
=======
              <div className="hhm-grid">
                {filteredHhms.map((hhm) => (
                  <div key={hhm._id} className="hhm-card">
                    <div className="card-header">
                      <div className="hhm-avatar">
                        <span className="avatar-icon">
                          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M12 2v20M2 7h10M2 12h10M2 17h10" />
                            <path d="M12 2l5 5-5 5m0 0l-5-5 5-5" />
                          </svg>
                        </span>
                      </div>
                      <div className="hhm-basic-info">
                        <h3 className="hhm-name">{hhm.name || 'Unknown Name'}</h3>
                        <p className="hhm-username">@{hhm.username || 'unknown'}</p>
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="hhm-details">
                        <div className="detail-item">
                          <span className="detail-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <span className="detail-value">{hhm.location || 'Location not specified'}</span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                              <rect x="2" y="4" width="20" height="16" rx="2" />
                              <path d="m2 7 10 6 10-6" />
                            </svg>
                          </span>
                          <span className="detail-value">{hhm.email || 'No email provided'}</span>
                        </div>

                        <div className="detail-item">
                          <span className="detail-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                              <line x1="12" y1="18" x2="12.01" y2="18" />
                            </svg>
                          </span>
                          <span className="detail-value">{hhm.phone || 'No phone provided'}</span>
                        </div>

                        {hhm.specialization && (
                          <div className="detail-item">
                            <span className="detail-icon">
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                            </span>
                            <span className="detail-value">{hhm.specialization}</span>
                          </div>
                        )}

                        {hhm.experience && (
                          <div className="detail-item">
                            <span className="detail-icon">
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </span>
                            <span className="detail-value">{hhm.experience} years experience</span>
                          </div>
                        )}

                        {hhm.certifications && hhm.certifications.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-icon">
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <circle cx="12" cy="8" r="7" />
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                              </svg>
                            </span>
                            <span className="detail-value">{hhm.certifications.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="card-actions">
                        <button
                          className="contact-btn primary"
                          onClick={() => handleInviteClick(hhm)}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          Send Invitation
                        </button>
                        <button
                          className="contact-btn secondary"
                          onClick={() => handleViewProfile(hhm)}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            )}
          </>
        )}

        {/* My Requests Tab Content */}
        {activeTab === 'myRequests' && (
          <div className="requests-section">
<<<<<<< HEAD
            <h2>📤 My Sent Invitations</h2>
=======
            <h2>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
                <path d="M12 13l-8 5" />
              </svg>
              My Sent Invitations
            </h2>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            {requestsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your requests...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="empty-state">
<<<<<<< HEAD
                <div className="empty-icon">📤</div>
=======
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                    <path d="M12 13l-8 5" />
                  </svg>
                </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                <h3>No Sent Invitations</h3>
                <p>You haven't sent any invitations to Harvest Managers yet.</p>
              </div>
            ) : (
              <div className="requests-list">
                {myRequests.map((request) => (
                  <div key={request._id} className="request-card">
                    <div className="request-info">
                      <h4>{request.hhmId?.name || request.hhmName || 'Unknown HHM'}</h4>
                      <p><strong>Status:</strong> {request.status}</p>
                      <p><strong>Sent:</strong> {formatDate(request.createdAt)}</p>
                      {request.hhmId?.email && <p><strong>Email:</strong> {request.hhmId.email}</p>}
                      {request.hhmId?.phone && <p><strong>Phone:</strong> {request.hhmId.phone}</p>}
                      {request.message && <p><strong>Message:</strong> {request.message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Received Applications Tab Content */}
        {activeTab === 'receivedApplications' && (
          <div className="applications-section">
<<<<<<< HEAD
            <h2>📥 Received Applications</h2>
=======
            <h2>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}>
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
              Received Applications
            </h2>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            {applicationsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : receivedApplications.length === 0 ? (
              <div className="empty-state">
<<<<<<< HEAD
                <div className="empty-icon">📥</div>
=======
                <div className="empty-icon">
                  <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="2" fill="none">
                    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                  </svg>
                </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                <h3>No Applications Received</h3>
                <p>No Harvest Managers have applied to work with you yet.</p>
              </div>
            ) : (
              <div className="applications-list">
                {receivedApplications.map((application) => (
                  <div key={application._id} className="application-card">
                    <div className="application-info">
                      <h4>{application.hhmId?.name || application.hhmName || 'Unknown HHM'}</h4>
                      <p><strong>Status:</strong> {application.status}</p>
                      <p><strong>Applied:</strong> {formatDate(application.createdAt)}</p>
                      {application.hhmId?.email && <p><strong>Email:</strong> {application.hhmId.email}</p>}
                      {application.hhmId?.phone && <p><strong>Phone:</strong> {application.hhmId.phone}</p>}
                      {application.hhmId?.experience && <p><strong>Experience:</strong> {application.hhmId.experience} years</p>}
                      {application.message && <p><strong>Message:</strong> {application.message}</p>}
                    </div>
                    {application.status === 'pending' && (
                      <div className="application-actions" style={{
                        marginTop: '15px',
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                      }}>
<<<<<<< HEAD
                        <button 
=======
                        <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                          className="btn-accept"
                          onClick={() => handleApplicationResponse(application._id, 'accepted')}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ✅ Accept
                        </button>
<<<<<<< HEAD
                        <button 
=======
                        <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                          className="btn-decline"
                          onClick={() => handleApplicationResponse(application._id, 'declined')}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
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
        <div className="modal-overlay" onClick={closeInviteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📨 Send Invitation to {selectedHHM.name}</h2>
              <button className="modal-close" onClick={closeInviteModal}>×</button>
            </div>

            <div className="modal-body">
              {invitationSuccess ? (
                <div className={`alert ${invitationSuccess.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                  {invitationSuccess.message}
                </div>
              ) : (
                <>
                  <div className="hhm-preview">
                    <div className="hhm-preview-avatar">🌾</div>
                    <div className="hhm-preview-info">
                      <h3>{selectedHHM.name}</h3>
                      <p>📍 {selectedHHM.location || 'Location not specified'}</p>
                      <p>📧 {selectedHHM.email}</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="invitation-message">Message (Optional)</label>
                    <textarea
                      id="invitation-message"
                      value={invitationMessage}
                      onChange={(e) => setInvitationMessage(e.target.value)}
                      placeholder="Add a personal message to your invitation..."
                      rows="4"
                      className="invitation-textarea"
                    />
                    <small className="form-hint">
                      Explain why you'd like to partner with this Harvest Manager
                    </small>
                  </div>
                </>
              )}
            </div>

            {!invitationSuccess && (
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={closeInviteModal}
                  disabled={sendingInvitation}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
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

      <style jsx>{`
        .hhm-directory-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 2rem;
          text-align: center;
          background: white;
          color: #2c5530;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .page-header h1 {
          color: #2c5530;
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        /* Sub-navigation Styles */
        .sub-navigation {
          margin-bottom: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .tab-buttons {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab-button {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          background: white;
          color: #666;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-bottom: 3px solid transparent;
        }

        .tab-button:hover {
          background: #f8fafc;
          color: #2c5530;
        }

        .tab-button.active {
          background: #f0f9ff;
          color: #2c5530;
          border-bottom-color: #2c5530;
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .loading-spinner {
          margin-left: 0.5rem;
        }

        /* Requests and Applications Styles */
        .requests-section,
        .applications-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .requests-section h2,
        .applications-section h2 {
          color: #2c5530;
          margin-bottom: 1.5rem;
        }

        .requests-list,
        .applications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .request-card,
        .application-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .request-card:hover,
        .application-card:hover {
          border-color: #2c5530;
          box-shadow: 0 4px 12px rgba(44, 85, 48, 0.1);
        }

        .request-info h4,
        .application-info h4 {
          color: #2c5530;
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
        }

        .request-info p,
        .application-info p {
          margin: 0.25rem 0;
          color: #666;
        }

        .filter-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-input-group {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.5rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #4caf50;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-select, .sort-select {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          font-size: 0.9rem;
          min-width: 150px;
          transition: border-color 0.2s;
        }

        .filter-select:focus, .sort-select:focus {
          outline: none;
          border-color: #4caf50;
        }

        .clear-filters-btn {
          padding: 0.75rem 1.5rem;
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .results-info {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e1e5e9;
        }

        .results-count {
          color: #666;
          font-size: 0.9rem;
        }

        .content-section {
          margin-top: 2rem;
        }

        .loading-container, .error-container, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        .error-icon, .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-container {
          background: #fff5f5;
          border: 1px solid #fed7d7;
        }

        .error-message {
          color: #e53e3e;
          margin-bottom: 1.5rem;
        }

        .retry-button {
          padding: 0.75rem 1.5rem;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .retry-button:hover {
          background: #45a049;
        }

        .hhm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .hhm-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid transparent;
        }

      .hhm-card:hover {
          background: white;
          transform: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }


        .card-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e1e5e9;
        }

        .hhm-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4caf50, #45a049);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .avatar-icon {
          font-size: 1.8rem;
          color: white;
        }

        .hhm-basic-info {
          flex: 1;
        }

        .hhm-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c5530;
          margin: 0 0 0.25rem 0;
        }

        .hhm-username {
          color: #666;
          margin: 0;
          font-size: 0.9rem;
        }

        .card-body {
          padding: 1.5rem;
        }

        .hhm-details {
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-icon {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        .detail-value {
          flex: 1;
          color: #555;
          font-size: 0.9rem;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .contact-btn {
          flex: 1;
          min-width: 120px;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .contact-btn.primary {
          background: #4caf50;
          color: white;
        }

        .contact-btn.secondary {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e1e5e9;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #2c5530;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .modal-close:hover {
          background: #f8f9fa;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .hhm-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .hhm-preview-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #4caf50, #45a049);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .hhm-preview-info h3 {
          margin: 0 0 0.5rem 0;
          color: #2c5530;
          font-size: 1.1rem;
        }

        .hhm-preview-info p {
          margin: 0.25rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .invitation-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .invitation-textarea:focus {
          outline: none;
          border-color: #4caf50;
        }

        .form-hint {
          display: block;
          margin-top: 0.5rem;
          color: #666;
          font-size: 0.85rem;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e1e5e9;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4caf50;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #45a049;
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #495057;
          border: 2px solid #e1e5e9;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e9ecef;
        }

        /* Profile Modal Styles */
        .profile-modal {
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .profile-body {
          padding: 1.5rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #e1e5e9;
        }

        .profile-avatar-large {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #4caf50, #2c5530);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .profile-title h2 {
          margin: 0;
          color: #2c5530;
          font-size: 1.8rem;
        }

        .profile-username {
          margin: 0.25rem 0 0 0;
          color: #666;
          font-size: 1rem;
        }

        .profile-section {
          margin-bottom: 2rem;
        }

        .profile-section h3 {
          color: #2c5530;
          font-size: 1.2rem;
          margin: 0 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e1e5e9;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .detail-label {
          font-weight: 500;
          color: #666;
          min-width: 180px;
          flex-shrink: 0;
        }

        .detail-value {
          color: #333;
          flex: 1;
        }

        .services-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .service-tag {
          padding: 0.5rem 1rem;
          background: #e8f5e9;
          color: #2c5530;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .certifications-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .certification-item {
          padding: 0.75rem;
          background: #f8f9fa;
          border-left: 3px solid #4caf50;
          border-radius: 4px;
          color: #333;
        }

        .profile-description {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .hhm-directory-page {
            padding: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }

          .search-controls {
            flex-direction: column;
          }

          .filter-controls {
            flex-direction: column;
          }

          .filter-select, .sort-select {
            min-width: auto;
          }

          .hhm-grid {
            grid-template-columns: 1fr;
          }

          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>

      {/* Notifications */}
<<<<<<< HEAD
      <NotificationToast 
=======
      <NotificationToast
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top-right"
      />
    </div>
  );
};

export default FactoryHHMDirectoryPage;
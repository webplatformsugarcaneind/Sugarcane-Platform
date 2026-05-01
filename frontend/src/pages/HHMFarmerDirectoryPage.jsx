import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerHHMDirectoryPage.css'; // Import the shared premium dark theme CSS

/**
 * HHMFarmerDirectoryPage Component
 * 
 * Page for HHMs to view and search through Farmers.
 * Includes search functionality, filtering, and displays farmer data in a card format.
 */
const HHMFarmerDirectoryPage = () => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [isListView, setIsListView] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  useEffect(() => {
    let filtered = [...farmers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(farmer =>
        farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.phone?.includes(searchTerm)
      );
    }

    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(farmer =>
        farmer.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'phone':
          return (a.phone || '').localeCompare(b.phone || '');
        default:
          return 0;
      }
    });

    setFilteredFarmers(filtered);
  }, [farmers, searchTerm, selectedLocation, sortBy]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Make API request with Authorization header
      const response = await axios.get('/api/hhm/farmers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const farmerData = response.data.data || response.data.farmers || [];
      setFarmers(farmerData);
    } catch (err) {
      console.error('Error fetching farmers:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch farmer directory. Please try again.'
      );
    } finally {
      setLoading(false);
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
  const uniqueLocations = [...new Set(farmers
    .map(farmer => farmer.location)
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

  const kpiTotal = farmers.length;
  const kpiActive = farmers.filter(f => f.isActive !== false).length;
  const kpiLocations = uniqueLocations.length;
  const kpiNew = farmers.filter(f => {
    if (!f.createdAt) return false;
    const date = new Date(f.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="hd-page">
      {/* HEADER */}
      <div className="hd-header">
        <div className="ph-top">
          <div>
            <div className="ph-eyebrow">HHM View</div>
            <h1 className="hd-title">Farmer <em>Directory</em></h1>
            <p className="hd-sub">Connect with farmers in your network, view farm details, and manage harvest opportunities directly.</p>
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className="hd-kpi-row">
        <div className="hd-kpi g"><div className="hd-kpi-label">Total Farmers</div><div className="hd-kpi-val g">{kpiTotal}</div><div className="hd-kpi-sub">Registered in network</div></div>
        <div className="hd-kpi a"><div className="hd-kpi-label">Active Farmers</div><div className="hd-kpi-val a">{kpiActive}</div><div className="hd-kpi-sub">Currently available</div></div>
        <div className="hd-kpi b"><div className="hd-kpi-label">Locations</div><div className="hd-kpi-val b">{kpiLocations}</div><div className="hd-kpi-sub">Coverage areas</div></div>
        <div className="hd-kpi g"><div className="hd-kpi-label">New This Month</div><div className="hd-kpi-val g">{kpiNew}</div><div className="hd-kpi-sub">Recent joins</div></div>
      </div>

      {/* TOOLBAR */}
      <div className="hd-toolbar">
        <div className="hd-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search by name, username, email, or phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="hd-search"
          />
        </div>
        <select value={selectedLocation} onChange={handleLocationChange} className="hd-search" style={{ flex: 'none', width: 'auto', minWidth: '160px', paddingLeft: '16px' }}>
          <option value="">All Locations</option>
          {uniqueLocations.map((location, index) => (
            <option key={index} value={location}>{location}</option>
          ))}
        </select>
        <select value={sortBy} onChange={handleSortChange} className="hd-search" style={{ flex: 'none', width: 'auto', minWidth: '160px', paddingLeft: '16px' }}>
          <option value="name">Sort by Name</option>
          <option value="username">Sort by Username</option>
          <option value="email">Sort by Email</option>
          <option value="phone">Sort by Phone</option>
        </select>
      </div>

      {/* FARMER GRID */}
      <div className={`hd-grid${isListView ? ' list-view' : ''}`}>
        {loading ? (
          <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading farmer directory...</div></div>
        ) : error ? (
          <div className="hd-empty"><div className="hd-empty-icon">⚠️</div><div className="hd-empty-title">{error}</div><button className="hd-btn-profile" onClick={fetchFarmers}>Try Again</button></div>
        ) : filteredFarmers.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon">🌾</div><div className="hd-empty-title">No Farmers Found</div><div className="hd-empty-sub">Try adjusting your search or filters.</div></div>
        ) : filteredFarmers.map((farmer, idx) => (
          <div key={farmer._id} className={`hd-card ${farmer.isActive !== false ? 'active' : 'inactive'}`} style={{ animation: `hdFadeUp .6s var(--ease-out) both`, animationDelay: `${idx * 0.05}s` }}>
            <div className="hc-header">
              <div className="hc-avatar">🌾</div>
              <div className="hc-title-wrap">
                <div className="hc-name">{farmer.name || 'Unknown Name'}</div>
                <div className="hc-username">@{farmer.username}</div>
                <div className="hc-role-badge">Farmer</div>
              </div>
              <div className="hc-status">
                <span className={`hd-status-badge ${farmer.isActive !== false ? 'active' : 'inactive'}`}>
                  {farmer.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            <div className="hc-contact">
              {farmer.location && (
                <div className="hc-contact-item"><span className="hc-contact-icon">📍</span><span className="hc-contact-text">{farmer.location}</span></div>
              )}
              {farmer.email && (
                <div className="hc-contact-item"><span className="hc-contact-icon">📧</span><span className="hc-contact-text">{farmer.email}</span></div>
              )}
              {farmer.phone && (
                <div className="hc-contact-item"><span className="hc-contact-icon">📱</span><span className="hc-contact-text">{farmer.phone}</span></div>
              )}
            </div>

            {(farmer.farmSize || farmer.farmType || farmer.experience) && (
              <>
                <div className="hc-divider"></div>
                <div className="hc-contact" style={{ paddingTop: '12px' }}>
                  {farmer.farmSize && (
                    <div className="hc-contact-item"><span className="hc-contact-icon">📏</span><span className="hc-contact-text">{farmer.farmSize} acres</span></div>
                  )}
                  {farmer.farmType && (
                    <div className="hc-contact-item"><span className="hc-contact-icon">🚜</span><span className="hc-contact-text">{farmer.farmType}</span></div>
                  )}
                  {farmer.experience && (
                    <div className="hc-contact-item"><span className="hc-contact-icon">⭐</span><span className="hc-contact-text">{farmer.experience} years exp</span></div>
                  )}
                </div>
              </>
            )}

            <div className="hc-divider"></div>
            <div className="hc-meta">
              <div className="hc-meta-item">Joined: <strong>{formatDate(farmer.createdAt)}</strong></div>
            </div>

            <div className="hc-actions">
              <button className="hd-btn-request" onClick={() => { if (farmer.email) window.location.href = `mailto:${farmer.email}`; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/></svg>
                Contact
              </button>
              <button className="hd-btn-profile" onClick={() => navigate(farmer._id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HHMFarmerDirectoryPage;

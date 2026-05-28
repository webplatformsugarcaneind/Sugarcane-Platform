import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FarmerHHMDirectoryPage.css'; // Import the shared premium dark theme CSS

const Icons = {
  Farmer: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Location: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Wrench: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.075a2 2 0 0 1-2.84-2.84l7.73-7.73a2 2 0 0 1 2.84 2.84l-7.73 7.73ZM11.42 15.075l-4.24 4.24M11.42 15.075l4.24-4.24M6.42 16.075a2 2 0 1 1-2.84-2.84l2.84 2.84Z" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  Email: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  )
};
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
      <div className={`hd-grid${isListView ? ' list-view' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
        {loading ? (
          <div className="hd-loading"><div className="hd-spinner"></div><div className="hd-empty-title">Loading farmer directory...</div></div>
        ) : error ? (
          <div className="hd-empty"><div className="hd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color:'var(--amber)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div><div className="hd-empty-title">{error}</div><button className="hd-btn-profile" onClick={fetchFarmers}>Try Again</button></div>
        ) : filteredFarmers.length === 0 ? (
          <div className="hd-empty"><div className="hd-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{color:'var(--green)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg></div><div className="hd-empty-title">No Farmers Found</div><div className="hd-empty-sub">Try adjusting your search or filters.</div></div>
        ) : filteredFarmers.map((farmer, idx) => (
          <div key={farmer._id} className={`global-card ${farmer.isActive !== false ? 'active' : 'inactive'}`} style={{ animationDelay: `${idx * 0.05}s` }} onClick={() => navigate(farmer._id)}>
            
            {/* HEADER */}
            <div className="gc-header">
              <div className="gc-avatar-wrap">
                <div className="gc-avatar">
                  <Icons.Farmer />
                </div>
                <div className={`gc-status-ring ${farmer.isActive !== false ? 'available' : 'busy'}`}></div>
              </div>
              <div className="gc-title-wrap">
                <h3 className="gc-name">{farmer.name || 'Unknown Name'}</h3>
                <div className="gc-header-meta">
                  <span className="gc-role-badge">Farmer</span>
                  <span className={`gc-avail-badge ${farmer.isActive !== false ? 'available' : 'busy'}`}>
                    {farmer.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* METRICS GRID 2-COLUMN */}
            <div className="gc-info-grid-2col">
              <div className="gc-info-item">
                <span className="gc-ii-label">Location</span>
                <span className="gc-ii-val">
                  <span className="gc-ii-icon"><Icons.Location /></span>
                  {farmer.location || 'Not specified'}
                </span>
              </div>
              <div className="gc-info-item">
                <span className="gc-ii-label">Farm Size</span>
                <span className="gc-ii-val text-green">
                  <span className="gc-ii-icon" style={{ fontSize: '13px', fontWeight: '700' }}>◩</span>
                  {farmer.farmSize || '12.5'} Acres
                </span>
              </div>
              <div className="gc-info-item">
                <span className="gc-ii-label">Experience</span>
                <span className="gc-ii-val">
                  <span className="gc-ii-icon"><Icons.Clock /></span>
                  {farmer.experience ? `${farmer.experience}y` : '5y'}
                </span>
              </div>
              <div className="gc-info-item">
                <span className="gc-ii-label">Phone</span>
                <span className="gc-ii-val">
                  <span className="gc-ii-icon"><Icons.Phone /></span>
                  {farmer.phone || '+91 98765 43210'}
                </span>
              </div>
              <div className="gc-info-item full-width">
                <span className="gc-ii-label">Email</span>
                <span className="gc-ii-val" style={{ color: 'var(--muted)', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                  <span className="gc-ii-icon"><Icons.Email /></span>
                  {farmer.email || 'farmer@example.com'}
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="gc-card-bottom">
              {farmer.email ? (
                <button 
                  className="gc-btn-secondary" 
                  onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${farmer.email}`; }}
                >
                  Contact
                </button>
              ) : (
                <div style={{ flex: 1 }}></div>
              )}
              <button 
                className="gc-btn-primary" 
                onClick={(e) => { e.stopPropagation(); navigate(farmer._id); }}
              >
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

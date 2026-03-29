import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { handleApiError } from '../utils/authUtils';
import './ProfilePage.css';

/**
 * ProfilePage Component - Role-based profile layouts
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  
=======
import './ProfilePage.css';

/**
 * ProfilePage Component - Role-based profile layouts with VIEW/EDIT mode
 */
const ProfilePage = () => {
  const navigate = useNavigate();

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userRole, setUserRole] = useState('');
<<<<<<< HEAD
  
=======
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
  // My Labours state for HHM users
  const [myLabours, setMyLabours] = useState([]);
  const [loadingMyLabours, setLoadingMyLabours] = useState(false);
  const [labourSearchTerm, setLabourSearchTerm] = useState('');
  const [filteredMyLabours, setFilteredMyLabours] = useState([]);

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role || '');
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      // Fetch labours if user is HHM
      if (user.role === 'HHM') {
        fetchMyLabours();
      }
    }
    fetchProfile();
  }, []);

  // Filter labours when search term changes
  useEffect(() => {
    filterMyLabours();
  }, [myLabours, labourSearchTerm]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
<<<<<<< HEAD
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
=======

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        return;
      }

      // Determine API endpoint based on user role
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      let apiEndpoint;
      switch (user.role) {
        case 'Worker':
        case 'Labour':
          apiEndpoint = '/api/worker/profile';
          break;
        case 'Factory':
          apiEndpoint = '/api/factory/profile';
          break;
        case 'HHM':
          apiEndpoint = '/api/hhm/profile';
          break;
        case 'Farmer':
        default:
          apiEndpoint = '/api/farmer/profile';
          break;
      }

      const response = await axios.get(apiEndpoint, {
<<<<<<< HEAD
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Set profile data based on the response
      const profile = response.data.profile || {};
      
      // Debug: Log the received profile data
      console.log('🔍 Received profile data:', profile);
      console.log('🏭 Crushing status from backend:', profile.crushingStatus);
      
      // Fix: Ensure skills is always a string for form input compatibility
      if (profile.skills && Array.isArray(profile.skills)) {
        profile.skills = profile.skills.join(', ');
      }
      
      setProfileData(profile);

    } catch (err) {
      console.error('Error fetching profile:', err);
      handleApiError(err, setError, 'Failed to fetch profile data. Please try again.');
=======
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.profile) {
        setProfileData(response.data.profile);
      } else if (response.data) {
        setProfileData(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load profile. Please try again.'
      );
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
<<<<<<< HEAD
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
=======
    const { name, value } = e.target;

    // Handle nested object updates (e.g., contactInfo.website)
    if (name.includes('.')) {
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
<<<<<<< HEAD
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
=======
          ...(prev[parent] || {}),
          [child]: value
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
<<<<<<< HEAD
        [name]: type === 'checkbox' ? checked : value
=======
        [name]: value
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Determine API endpoint based on user role
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      let apiEndpoint;
      switch (user.role) {
        case 'Worker':
        case 'Labour':
          apiEndpoint = '/api/worker/profile';
          break;
        case 'Factory':
          apiEndpoint = '/api/factory/profile';
          break;
        case 'HHM':
          apiEndpoint = '/api/hhm/profile';
          break;
        case 'Farmer':
        default:
          apiEndpoint = '/api/farmer/profile';
          break;
      }

      const response = await axios.put(apiEndpoint, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage('Profile updated successfully!');
<<<<<<< HEAD
      
      // Update profile data with the response
      if (response.data.profile) {
        setProfileData(response.data.profile);
        
        // Update localStorage with the latest profile data
        try {
          localStorage.setItem('user', JSON.stringify(response.data.profile));
        } catch (error) {
          console.error('Error updating user data in localStorage:', error);
        }
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Error updating profile:', err);
      handleApiError(err, setError, 'Failed to update profile. Please try again.');
=======

      // Update profile data with the response
      if (response.data.profile) {
        setProfileData(response.data.profile);
      }

      // Switch back to view mode after save
      setEditMode(false);

      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to update profile. Please try again.'
      );
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    } finally {
      setSaving(false);
    }
  };

  // Fetch approved labours (workers with approved applications) for HHM
  const fetchMyLabours = async () => {
    try {
      setLoadingMyLabours(true);
      const token = localStorage.getItem('token');
<<<<<<< HEAD
      
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Fetching approved labours from backend...');
      const response = await axios.get('/api/hhm/applications?status=approved', {
        headers: { Authorization: `Bearer ${token}` }
      });

<<<<<<< HEAD
      console.log('✅ Backend response for my labours:', response.data);
      
      const approvedApplications = response.data.data || response.data || [];
      console.log('👥 Approved labours from backend:', approvedApplications.length, 'workers');
      
      // Transform applications to labour data
      const laboursData = approvedApplications.map(app => ({
        _id: app.worker?.id || app._id,
        applicationId: app._id,
        name: app.worker?.name,
        email: app.worker?.email,
        phone: app.worker?.phone,
        skills: app.worker?.skills || app.workerSkills || [],
        experience: app.worker?.experience || app.experience,
        profileImage: app.worker?.profileImage,
        availabilityStatus: app.worker?.availabilityStatus || 'available',
        schedule: {
          title: app.schedule?.title,
          startDate: app.schedule?.startDate,
          location: app.schedule?.location,
          wageOffered: app.schedule?.wageOffered
        },
        appliedAt: app.appliedAt,
        reviewedAt: app.reviewedAt,
        expectedWage: app.expectedWage,
        availability: app.availability
      }));
      
      console.log('✅ Mapped labours:', laboursData);
      setMyLabours(laboursData);
      setFilteredMyLabours(laboursData);
    } catch (err) {
      console.error('❌ Error fetching my labours:', err.response?.data || err.message);
      // Show empty state on error
      setMyLabours([]);
      setFilteredMyLabours([]);
=======
      console.log('✅ Response received:', response.data);

      if (response.data.applications && Array.isArray(response.data.applications)) {
        // Extract unique workers from approved applications
        const uniqueWorkers = new Map();

        response.data.applications.forEach(app => {
          if (app.workerId && app.workerDetails) {
            const workerId = app.workerId._id || app.workerId;
            if (!uniqueWorkers.has(workerId)) {
              uniqueWorkers.set(workerId, {
                ...app.workerDetails,
                _id: workerId,
                applicationId: app._id,
                appliedDate: app.createdAt,
                status: app.status
              });
            }
          }
        });

        const labours = Array.from(uniqueWorkers.values());
        console.log('👷 Extracted labours:', labours);
        setMyLabours(labours);
      } else {
        console.warn('⚠️ No applications array found in response');
        setMyLabours([]);
      }
    } catch (err) {
      console.error('❌ Error fetching labours:', err);
      setMyLabours([]);
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    } finally {
      setLoadingMyLabours(false);
    }
  };

  // Filter my labours based on search term
  const filterMyLabours = useCallback(() => {
<<<<<<< HEAD
    let filtered = [...myLabours];

    if (labourSearchTerm) {
      filtered = filtered.filter(labour =>
        labour.name?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
        labour.email?.toLowerCase().includes(labourSearchTerm.toLowerCase()) ||
        labour.schedule?.title?.toLowerCase().includes(labourSearchTerm.toLowerCase())
      );
    }

    setFilteredMyLabours(filtered);
  }, [myLabours, labourSearchTerm]);

  // Role-specific profile rendering functions
  const renderFarmerProfile = () => (
    <form onSubmit={handleSubmit} className="profile-form farmer-profile">
      <div className="form-section">
        <h2 className="section-title">🌾 Farmer Information</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone || ''}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={profileData.location || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Nashik, Maharashtra"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="farmSize" className="form-label">Farm Size</label>
            <input
              type="text"
              id="farmSize"
              name="farmSize"
              value={profileData.farmSize || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 25 acres"
            />
          </div>
          <div className="form-group">
            <label htmlFor="farmingExperience" className="form-label">Farming Experience</label>
            <input
              type="text"
              id="farmingExperience"
              name="farmingExperience"
              value={profileData.farmingExperience || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 12 years"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cropTypes" className="form-label">Primary Crops</label>
            <input
              type="text"
              id="cropTypes"
              name="cropTypes"
              value={profileData.cropTypes || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Sugarcane, Rice, Wheat"
            />
            <small className="form-help">Separate multiple crops with commas</small>
          </div>
          <div className="form-group">
            <label htmlFor="irrigationType" className="form-label">Irrigation Type</label>
            <select
              id="irrigationType"
              name="irrigationType"
              value={profileData.irrigationType || ''}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select irrigation type</option>
              <option value="drip">Drip Irrigation</option>
              <option value="sprinkler">Sprinkler System</option>
              <option value="flood">Flood Irrigation</option>
              <option value="furrow">Furrow Irrigation</option>
              <option value="rainfed">Rain-fed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farm Equipment & Technology Section */}
      <div className="form-section">
        <h2 className="section-title">🚜 Farm Equipment & Technology</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="equipment" className="form-label">Available Equipment</label>
            <textarea
              id="equipment"
              name="equipment"
              value={profileData.equipment || ''}
              onChange={handleInputChange}
              className="form-input textarea"
              rows="3"
              placeholder="e.g., Tractor, Harvester, Plow, Cultivator, Seed Drill"
            />
            <small className="form-help">List your farm equipment</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="farmingMethods" className="form-label">Farming Methods</label>
            <textarea
              id="farmingMethods"
              name="farmingMethods"
              value={profileData.farmingMethods || ''}
              onChange={handleInputChange}
              className="form-input textarea"
              rows="2"
              placeholder="e.g., Organic farming, Drip irrigation, Crop rotation"
            />
            <small className="form-help">Describe your farming methods and techniques</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="certifications" className="form-label">Certifications</label>
            <input
              type="text"
              id="certifications"
              name="certifications"
              value={profileData.certifications || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Organic Farming Certificate, Good Agricultural Practices (GAP)"
            />
            <small className="form-help">Separate multiple certifications with commas</small>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
=======
    if (!labourSearchTerm.trim()) {
      setFilteredMyLabours(myLabours);
      return;
    }

    const searchLower = labourSearchTerm.toLowerCase();
    const filtered = myLabours.filter(labour =>
      (labour.name && labour.name.toLowerCase().includes(searchLower)) ||
      (labour.skills && labour.skills.toLowerCase().includes(searchLower)) ||
      (labour.phone && labour.phone.includes(searchLower))
    );

    setFilteredMyLabours(filtered);
  }, [myLabours, labourSearchTerm]);

  // Get role icon
  const getRoleIcon = () => {
    switch (userRole) {
      case 'Factory': return '🏭';
      case 'Farmer': return '🌾';
      case 'HHM': return '👔';
      case 'Worker':
      case 'Labour': return '👷';
      default: return '👤';
    }
  };

  // Sidebar profile card component
  const ProfileSidebar = () => (
    <div className="profile-sidebar">
      <div className="sidebar-card">
        <div className="profile-avatar">
          {getRoleIcon()}
        </div>
        <h3 className="profile-name">{profileData.name || profileData.factoryName || 'User'}</h3>
        <p className="profile-location">
          {profileData.location || profileData.factoryLocation || 'Location not set'}
        </p>
        <button
          className="edit-profile-btn"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? '❌ Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="sidebar-menu">
        <button
          className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="menu-icon">📋</span>
          Overview
        </button>
        <button
          className={`menu-item ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveTab('contact')}
        >
          <span className="menu-icon">📞</span>
          Contact Details
        </button>
        {(userRole === 'Factory' || userRole === 'Farmer') && (
          <button
            className={`menu-item ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            <span className="menu-icon">🕒</span>
            Operating Hours
          </button>
        )}
      </div>
    </div>
  );

  // Field component for view/edit mode
  const Field = ({ label, name, value, type = 'text', placeholder, options, rows }) => {
    if (type === 'select') {
      return (
        <div className="field-group">
          <label className="field-label">{label}</label>
          {editMode ? (
            <select
              name={name}
              value={value || ''}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select {label}</option>
              {options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <div className="read-value">{value || '—'}</div>
          )}
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="field-group full-width">
          <label className="field-label">{label}</label>
          {editMode ? (
            <textarea
              name={name}
              value={value || ''}
              onChange={handleInputChange}
              className="form-input"
              rows={rows || 3}
              placeholder={placeholder}
            />
          ) : (
            <div className="read-value">{value || '—'}</div>
          )}
        </div>
      );
    }

    return (
      <div className="field-group">
        <label className="field-label">{label}</label>
        {editMode ? (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={handleInputChange}
            className="form-input"
            placeholder={placeholder}
          />
        ) : (
          <div className="read-value">{value || '—'}</div>
        )}
      </div>
    );
  };

  // Role-specific profile rendering functions
  const renderFarmerProfile = () => (
    <form onSubmit={handleSubmit} className="profile-form">
      {activeTab === 'overview' && (
        <>
          <div className="info-section">
            <h2 className="section-header">
              <span className="section-icon">🌾</span>
              Farmer Information
            </h2>
            <div className="field-grid">
              <Field label="Full Name" name="name" value={profileData.name} />
              <Field label="Email Address" name="email" value={profileData.email} type="email" />
              <Field label="Phone Number" name="phone" value={profileData.phone} type="tel" />
              <Field label="Location" name="location" value={profileData.location} placeholder="e.g., Nashik, Maharashtra" />
              <Field label="Farm Size" name="farmSize" value={profileData.farmSize} placeholder="e.g., 25 acres" />
              <Field label="Farming Experience" name="farmingExperience" value={profileData.farmingExperience} placeholder="e.g., 12 years" />
              <Field label="Primary Crops" name="cropTypes" value={profileData.cropTypes} placeholder="e.g., Sugarcane, Rice" />
              <Field
                label="Irrigation Type"
                name="irrigationType"
                value={profileData.irrigationType}
                type="select"
                options={[
                  { value: 'drip', label: 'Drip Irrigation' },
                  { value: 'sprinkler', label: 'Sprinkler System' },
                  { value: 'flood', label: 'Flood Irrigation' },
                  { value: 'furrow', label: 'Furrow Irrigation' },
                  { value: 'rainfed', label: 'Rain-fed' }
                ]}
              />
            </div>
          </div>

          <div className="info-section">
            <h2 className="section-header">
              <span className="section-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
              </span>
              Farm Equipment & Technology
            </h2>
            <div className="field-grid">
              <Field
                label="Available Equipment"
                name="equipment"
                value={profileData.equipment}
                type="textarea"
                placeholder="e.g., Tractor, Harvester, Plow"
              />
              <Field
                label="Farming Methods"
                name="farmingMethods"
                value={profileData.farmingMethods}
                type="textarea"
                rows={2}
                placeholder="e.g., Organic farming, Drip irrigation"
              />
              <Field
                label="Certifications"
                name="certifications"
                value={profileData.certifications}
                placeholder="e.g., Organic Farming Certificate"
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'contact' && (
        <div className="info-section">
          <h2 className="section-header">
            <span className="section-icon">📞</span>
            Contact Information
          </h2>
          <div className="field-grid">
            <Field label="Email Address" name="email" value={profileData.email} type="email" />
            <Field label="Phone Number" name="phone" value={profileData.phone} type="tel" />
            <Field label="Location" name="location" value={profileData.location} />
          </div>
        </div>
      )}

      {editMode && (
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    </form>
  );

  const renderFactoryProfile = () => (
<<<<<<< HEAD
    <form onSubmit={handleSubmit} className="profile-form factory-profile">
      <div className="form-section">
        <h2 className="section-title">🏭 Factory Information</h2>
        
        <div className="factory-header">
          <div className="factory-name-section">
            <h3>{profileData.factoryName || 'Factory Name'}</h3>
            <p className="factory-location">{profileData.factoryLocation || 'Location'}</p>
          </div>
          <div className="factory-capacity">
            <span className="capacity-label">Daily Capacity</span>
            <span className="capacity-value">{profileData.capacity || 'Not specified'}</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Contact Person Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="factoryName" className="form-label">Factory Name</label>
            <input
              type="text"
              id="factoryName"
              name="factoryName"
              value={profileData.factoryName || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone || ''}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="factoryLocation" className="form-label">Factory Location</label>
            <input
              type="text"
              id="factoryLocation"
              name="factoryLocation"
              value={profileData.factoryLocation || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Pune, Maharashtra"
            />
          </div>
          <div className="form-group">
            <label htmlFor="capacity" className="form-label">Processing Capacity</label>
            <input
              type="text"
              id="capacity"
              name="capacity"
              value={profileData.capacity || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 2500 TCD"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="factoryDescription" className="form-label">Factory Description</label>
            <textarea
              id="factoryDescription"
              name="factoryDescription"
              value={profileData.factoryDescription || ''}
              onChange={handleInputChange}
              className="form-input textarea"
              rows="3"
              placeholder="Describe your factory's capabilities and services..."
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="experience" className="form-label">Years in Operation</label>
            <input
              type="text"
              id="experience"
              name="experience"
              value={profileData.experience || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 15 years"
            />
          </div>
          <div className="form-group">
            <label htmlFor="specialization" className="form-label">Specialization</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={profileData.specialization || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Sugar Processing, Ethanol Production"
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="form-section">
        <h2 className="section-title">📞 Contact Information</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactInfo.website" className="form-label">Website</label>
            <input
              type="url"
              id="contactInfo.website"
              name="contactInfo.website"
              value={profileData.contactInfo?.website || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="https://yourfactory.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactInfo.fax" className="form-label">Fax Number</label>
            <input
              type="tel"
              id="contactInfo.fax"
              name="contactInfo.fax"
              value={profileData.contactInfo?.fax || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="+91-20-12345678"
            />
          </div>
        </div>
      </div>

      {/* Operations Section */}
      <div className="form-section">
        <h2 className="section-title">⚙️ Operations</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="operatingSeason" className="form-label">Operating Season</label>
            <input
              type="text"
              id="operatingSeason"
              name="operatingSeason"
              value={profileData.operatingSeason || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., October to March"
            />
          </div>
          <div className="form-group">
            <label htmlFor="crushingStatus" className="form-label">Operating Status</label>
            <select
              id="crushingStatus"
              name="crushingStatus"
              value={profileData.crushingStatus || 'OFF'}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="OFF">OFF</option>
              <option value="ON">ON</option>
            </select>
          </div>
        </div>

        {/* Display Current Operating Schedule */}
        {(profileData.operatingSeason || profileData.crushingStatus) && (
          <div className="operating-hours-display">
            <h4>Current Operating Schedule:</h4>
            <div className="schedule-grid">
              {profileData.operatingSeason && (
                <div className="schedule-item">
                  <span className="schedule-label">Operating Season:</span>
                  <span className="schedule-value">📅 {profileData.operatingSeason}</span>
                </div>
              )}
              {profileData.crushingStatus && (
                <div className="schedule-item">
                  <span className="schedule-label">Operating Status:</span>
                  <span className="schedule-value">
                    {profileData.crushingStatus === 'ON' ? '🟢 Factory ON' : '🔴 Factory OFF'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Update Factory Profile'}
        </button>
      </div>
=======
    <form onSubmit={handleSubmit} className="profile-form">
      {activeTab === 'overview' && (
        <>
          <div className="info-section">
            <h2 className="section-header">
              <span className="section-icon">🏭</span>
              Factory Information
            </h2>
            <div className="field-grid">
              <Field label="Contact Person Name" name="name" value={profileData.name} />
              <Field label="Factory Name" name="factoryName" value={profileData.factoryName} />
              <Field label="Factory Location" name="factoryLocation" value={profileData.factoryLocation} placeholder="e.g., Pune, Maharashtra" />
              <Field label="Processing Capacity" name="capacity" value={profileData.capacity} placeholder="e.g., 2500 TCD" />
              <Field label="Years in Operation" name="experience" value={profileData.experience} placeholder="e.g., 15 years" />
              <Field label="Specialization" name="specialization" value={profileData.specialization} placeholder="e.g., Sugar Processing" />
              <Field
                label="Factory Description"
                name="factoryDescription"
                value={profileData.factoryDescription}
                type="textarea"
                placeholder="Describe your factory's capabilities..."
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'contact' && (
        <div className="info-section">
          <h2 className="section-header">
            <span className="section-icon">📞</span>
            Contact Details
          </h2>
          <div className="field-grid">
            <Field label="Primary Contact" name="name" value={profileData.name} />
            <Field label="Phone Number" name="phone" value={profileData.phone} type="tel" />
            <Field label="Email Address" name="email" value={profileData.email} type="email" />
            <Field label="Website" name="contactInfo.website" value={profileData.contactInfo?.website} type="url" placeholder="https://yourfactory.com" />
            <Field label="Fax Number" name="contactInfo.fax" value={profileData.contactInfo?.fax} type="tel" placeholder="+91-20-12345678" />
          </div>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="info-section">
          <h2 className="section-header">
            <span className="section-icon">🕒</span>
            Hours of Operation
          </h2>
          <div className="field-grid">
            <Field label="Operating Season" name="operatingHours.season" value={profileData.operatingHours?.season} placeholder="e.g., October to March" />
            <Field label="Monday Hours" name="operatingHours.monday" value={profileData.operatingHours?.monday} placeholder="e.g., 6:00 AM - 10:00 PM" />
            <Field label="Tuesday Hours" name="operatingHours.tuesday" value={profileData.operatingHours?.tuesday} placeholder="e.g., 6:00 AM - 10:00 PM" />
            <Field label="Wednesday Hours" name="operatingHours.wednesday" value={profileData.operatingHours?.wednesday} placeholder="e.g., 6:00 AM - 10:00 PM" />
            <Field label="Thursday Hours" name="operatingHours.thursday" value={profileData.operatingHours?.thursday} placeholder="e.g., 6:00 AM - 10:00 PM" />
            <Field label="Friday Hours" name="operatingHours.friday" value={profileData.operatingHours?.friday} placeholder="e.g., 6:00 AM - 10:00 PM" />
            <Field label="Saturday Hours" name="operatingHours.saturday" value={profileData.operatingHours?.saturday} placeholder="e.g., 6:00 AM - 10:00 PM" />
            <Field label="Sunday Hours" name="operatingHours.sunday" value={profileData.operatingHours?.sunday} placeholder="e.g., Closed" />
          </div>
        </div>
      )}

      {editMode && (
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    </form>
  );

  const renderHHMProfile = () => (
<<<<<<< HEAD
    <form onSubmit={handleSubmit} className="profile-form hhm-profile">
      <div className="form-section">
        <h2 className="section-title">👥 HHM Information</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone || ''}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Management & Operations Section */}
      <div className="form-section">
        <h2 className="section-title">📊 Management & Operations</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="managementExperience" className="form-label">Management Experience</label>
            <input
              type="text"
              id="managementExperience"
              name="managementExperience"
              value={profileData.managementExperience || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 8 years"
            />
          </div>
          <div className="form-group">
            <label htmlFor="teamSize" className="form-label">Team Size</label>
            <input
              type="text"
              id="teamSize"
              name="teamSize"
              value={profileData.teamSize || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 15-20 workers"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="managementOperations" className="form-label">Management Operations</label>
            <textarea
              id="managementOperations"
              name="managementOperations"
              value={profileData.managementOperations || ''}
              onChange={handleInputChange}
              className="form-input textarea"
              rows="3"
              placeholder="e.g., Worker coordination, Task scheduling, Quality control, Safety supervision"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="servicesOffered" className="form-label">Services Offered</label>
            <textarea
              id="servicesOffered"
              name="servicesOffered"
              value={profileData.servicesOffered || ''}
              onChange={handleInputChange}
              className="form-input textarea"
              rows="3"
              placeholder="e.g., Labour contracting, Equipment rental, Field supervision, Training services"
            />
          </div>
        </div>
      </div>

      {/* My Labours Section */}
      <div className="form-section">
        <h2 className="section-title">👥 My Hired Workers</h2>
        <p className="section-description">
          Manage your hired workforce and track their assignments
        </p>
        
        {/* Search Section */}
        <div className="search-section" style={{ marginBottom: '1.5rem' }}>
          <div className="search-input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '12px', color: '#7f8c8d' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by worker name, email, or job title..."
              value={labourSearchTerm}
              onChange={(e) => setLabourSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
            {labourSearchTerm && (
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#7f8c8d'
                }}
                onClick={() => setLabourSearchTerm('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
            {filteredMyLabours.length} hired worker{filteredMyLabours.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Labours List */}
        {loadingMyLabours ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            <div style={{ marginBottom: '1rem' }}>Loading your hired workers...</div>
          </div>
        ) : filteredMyLabours.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👷</div>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {labourSearchTerm
                ? 'No hired workers match your search'
                : myLabours.length === 0
                  ? 'No hired workers yet'
                  : 'No hired workers match your search'}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              {labourSearchTerm
                ? 'Try adjusting your search terms or clear the search to see all hired workers.'
                : 'Approved job applications will appear here as hired workers.'}
            </p>
            {labourSearchTerm && (
              <button
                type="button"
                onClick={() => setLabourSearchTerm('')}
                className="btn"
                style={{ 
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredMyLabours.map(labour => (
              <div key={labour._id} style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{labour.name}</h3>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>{labour.email}</p>
                    {labour.phone && (
                      <p style={{ margin: '0 0 0.25rem 0', color: '#7f8c8d' }}>📞 {labour.phone}</p>
                    )}

                    {/* Skills */}
                    {labour.skills && labour.skills.length > 0 && (
                      <div style={{ margin: '0.5rem 0' }}>
                        {labour.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} style={{
                            display: 'inline-block',
                            backgroundColor: '#ecf0f1',
                            color: '#2c3e50',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            marginRight: '0.5rem',
                            marginBottom: '0.25rem'
                          }}>
                            {skill}
                          </span>
                        ))}
                        {labour.skills.length > 3 && (
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#ecf0f1',
                            color: '#2c3e50',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem'
                          }}>
                            +{labour.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Job Details */}
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Job Assignment:</strong> {labour.schedule?.title || 'Not specified'}
                      </div>
                      {labour.schedule?.location && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Location:</strong> 📍 {labour.schedule.location}
                        </div>
                      )}
                      {labour.schedule?.wageOffered && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Wage:</strong> 💰 ₹{labour.schedule.wageOffered}/day
                        </div>
                      )}
                      {labour.experience && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Experience:</strong> {labour.experience}
                        </div>
                      )}
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Status:</strong> <span style={{ color: '#27ae60' }}>✅ Hired & Active</span>
                      </div>
                      {labour.appliedAt && (
                        <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                          📝 Applied: {new Date(labour.appliedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    👁️ View Full Profile
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2ecc71',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    📞 Contact Worker
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f39c12',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    ⚙️ Manage Assignment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Update HHM Profile'}
        </button>
      </div>
=======
    <form onSubmit={handleSubmit} className="profile-form">
      {activeTab === 'overview' && (
        <>
          <div className="info-section">
            <h2 className="section-header">
              <span className="section-icon">👔</span>
              HHM Information
            </h2>
            <div className="field-grid">
              <Field label="Full Name" name="name" value={profileData.name} />
              <Field label="Email Address" name="email" value={profileData.email} type="email" />
              <Field label="Phone Number" name="phone" value={profileData.phone} type="tel" />
              <Field label="Management Experience" name="managementExperience" value={profileData.managementExperience} placeholder="e.g., 10 years" />
              <Field label="Team Size" name="teamSize" value={profileData.teamSize} placeholder="e.g., 50 workers" />
              <Field
                label="Services Offered"
                name="servicesOffered"
                value={profileData.servicesOffered}
                type="textarea"
                placeholder="e.g., Labour management, Payroll, Scheduling"
              />
              <Field
                label="Management Operations"
                name="managementOperations"
                value={profileData.managementOperations}
                type="textarea"
                placeholder="Describe your operations..."
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'contact' && (
        <div className="info-section">
          <h2 className="section-header">
            <span className="section-icon">📞</span>
            Contact Details
          </h2>
          <div className="field-grid">
            <Field label="Email Address" name="email" value={profileData.email} type="email" />
            <Field label="Phone Number" name="phone" value={profileData.phone} type="tel" />
          </div>
        </div>
      )}

      {editMode && (
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    </form>
  );

  const renderLabourProfile = () => (
<<<<<<< HEAD
    <form onSubmit={handleSubmit} className="profile-form labour-profile">
      <div className="form-section">
        <h2 className="section-title">👷 Worker Information</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email || ''}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone || ''}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="skills" className="form-label">Skills</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={profileData.skills || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Sugarcane cutting, Field preparation, Irrigation, Equipment operation"
            />
            <small className="form-help">Separate multiple skills with commas</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="workExperience" className="form-label">Work Experience</label>
            <input
              type="text"
              id="workExperience"
              name="workExperience"
              value={profileData.workExperience || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 6 years in agricultural work"
            />
          </div>
          <div className="form-group">
            <label htmlFor="wageRate" className="form-label">Wage Rate</label>
            <input
              type="text"
              id="wageRate"
              name="wageRate"
              value={profileData.wageRate || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., ₹350 per day"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="availability" className="form-label">Availability</label>
            <select
              id="availability"
              name="availability"
              value={profileData.availability || 'Available'}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="workPreferences" className="form-label">Work Preferences</label>
            <input
              type="text"
              id="workPreferences"
              name="workPreferences"
              value={profileData.workPreferences || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Full-time, Day shifts, Outdoor work"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Update Worker Profile'}
        </button>
      </div>
=======
    <form onSubmit={handleSubmit} className="profile-form">
      {activeTab === 'overview' && (
        <>
          <div className="info-section">
            <h2 className="section-header">
              <span className="section-icon">👷</span>
              Worker Information
            </h2>
            <div className="field-grid">
              <Field label="Full Name" name="name" value={profileData.name} />
              <Field label="Email Address" name="email" value={profileData.email} type="email" />
              <Field label="Phone Number" name="phone" value={profileData.phone} type="tel" />
              <Field
                label="Skills"
                name="skills"
                value={profileData.skills}
                type="textarea"
                placeholder="e.g., Harvesting, Planting, Machine operation"
              />
              <Field
                label="Work Experience"
                name="workExperience"
                value={profileData.workExperience}
                placeholder="e.g., 5 years"
              />
              <Field
                label="Work Preferences"
                name="workPreferences"
                value={profileData.workPreferences}
                type="textarea"
                placeholder="e.g., Day shift, Weekend availability"
              />
              <Field label="Wage Rate" name="wageRate" value={profileData.wageRate} placeholder="e.g., ₹500/day" />
              <Field
                label="Availability"
                name="availability"
                value={profileData.availability}
                type="select"
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Unavailable', label: 'Unavailable' }
                ]}
              />
            </div>
          </div>
        </>
      )}

      {activeTab === 'contact' && (
        <div className="info-section">
          <h2 className="section-header">
            <span className="section-icon">📞</span>
            Contact Details
          </h2>
          <div className="field-grid">
            <Field label="Email Address" name="email" value={profileData.email} type="email" />
            <Field label="Phone Number" name="phone" value={profileData.phone} type="tel" />
          </div>
        </div>
      )}

      {editMode && (
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    </form>
  );

  const renderProfileByRole = () => {
    switch (userRole) {
      case 'Farmer':
        return renderFarmerProfile();
      case 'Factory':
        return renderFactoryProfile();
      case 'HHM':
        return renderHHMProfile();
      case 'Worker':
      case 'Labour':
        return renderLabourProfile();
      default:
<<<<<<< HEAD
        return renderFarmerProfile(); // Default fallback
=======
        return renderFarmerProfile();
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
<<<<<<< HEAD
      <div className="profile-header">
        <div className="header-content">
          <h1>My Profile</h1>
          <p className="page-subtitle">
            {userRole === 'Factory' && 'Manage your factory information and operations'}
            {userRole === 'Farmer' && 'Manage your farm details and personal information'}
            {userRole === 'HHM' && 'Manage your hub operations and contact details'}
            {(userRole === 'Worker' || userRole === 'Labour') && 'Manage your skills, availability, and work profile'}
          </p>
        </div>
      </div>

      <div className="profile-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
            <button onClick={fetchProfile} className="retry-btn">Retry</button>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            ✅ {successMessage}
          </div>
        )}

        {renderProfileByRole()}
=======
      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {successMessage && (
        <div className="success-banner">
          ✅ {successMessage}
        </div>
      )}

      <div className="profile-container">
        <ProfileSidebar />

        <div className="profile-main">
          {renderProfileByRole()}
        </div>
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default ProfilePage;
=======
export default ProfilePage;
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3

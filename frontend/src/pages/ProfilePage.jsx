import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

/**
 * ProfilePage Component - Role-based profile layouts with VIEW/EDIT mode
 */
const ProfilePage = () => {
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userRole, setUserRole] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found. Please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Determine API endpoint based on user role
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};

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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested object updates (e.g., contactInfo.website)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
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

      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Determine API endpoint based on user role
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};

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
    } finally {
      setSaving(false);
    }
  };

  // Fetch approved labours (workers with approved applications) for HHM
  const fetchMyLabours = async () => {
    try {
      setLoadingMyLabours(true);
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🔄 Fetching approved labours from backend...');
      const response = await axios.get('/api/hhm/applications?status=approved', {
        headers: { Authorization: `Bearer ${token}` }
      });

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
    } finally {
      setLoadingMyLabours(false);
    }
  };

  // Filter my labours based on search term
  const filterMyLabours = useCallback(() => {
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
              <span className="section-icon">🚜</span>
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
    </form>
  );

  const renderFactoryProfile = () => (
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
    </form>
  );

  const renderHHMProfile = () => (
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
    </form>
  );

  const renderLabourProfile = () => (
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
        return renderFarmerProfile();
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
      </div>
    </div>
  );
};

export default ProfilePage;

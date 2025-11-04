import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

/**
 * ProfilePage Component - Role-based profile layouts
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role || '');
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    
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

      const response = await axios.get(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Set profile data based on the response
      const profile = response.data.profile || {};
      setProfileData(profile);

    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(
        err.response?.data?.message || 
        'Failed to fetch profile data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
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
    </form>
  );

  const renderFactoryProfile = () => (
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

      {/* Operating Hours Section */}
      <div className="form-section">
        <h2 className="section-title">🕒 Operating Hours & Schedule</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="operatingHours.season" className="form-label">Operating Season</label>
            <input
              type="text"
              id="operatingHours.season"
              name="operatingHours.season"
              value={profileData.operatingHours?.season || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., October to March"
            />
          </div>
          <div className="form-group">
            <label htmlFor="operatingHours.monday" className="form-label">Monday Hours</label>
            <input
              type="text"
              id="operatingHours.monday"
              name="operatingHours.monday"
              value={profileData.operatingHours?.monday || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 6:00 AM - 10:00 PM"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="operatingHours.tuesday" className="form-label">Tuesday Hours</label>
            <input
              type="text"
              id="operatingHours.tuesday"
              name="operatingHours.tuesday"
              value={profileData.operatingHours?.tuesday || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 6:00 AM - 10:00 PM"
            />
          </div>
        </div>

        {/* Display Current Operating Hours */}
        {(profileData.operatingHours && Object.keys(profileData.operatingHours).length > 0) && (
          <div className="operating-hours-display">
            <h4>Current Operating Schedule:</h4>
            <div className="schedule-grid">
              {Object.entries(profileData.operatingHours).map(([key, value]) => (
                <div key={key} className="schedule-item">
                  <span className="schedule-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                  <span className="schedule-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Update Factory Profile'}
        </button>
      </div>
    </form>
  );

  const renderHHMProfile = () => (
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

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Update HHM Profile'}
        </button>
      </div>
    </form>
  );

  const renderLabourProfile = () => (
    <form onSubmit={handleSubmit} className="profile-form labour-profile">
      <div className="form-section">
        <h2 className="section-title">👷 Worker Information</h2>
        
        <div className="worker-status">
          <div className="status-indicator">
            <span className={`status-badge ${profileData.availabilityStatus === 'available' ? 'available' : 'unavailable'}`}>
              {profileData.availabilityStatus === 'available' ? '🟢 Available' : '🔴 Unavailable'}
            </span>
          </div>
        </div>

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
              <option value="Busy">Busy</option>
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
        return renderFarmerProfile(); // Default fallback
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
      </div>
    </div>
  );
};

export default ProfilePage;
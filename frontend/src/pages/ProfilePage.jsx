import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * ProfilePage Component
 * 
 * Profile page where farmers can view and edit their personal
 * information, farm details, and account settings.
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    farmLocation: '',
    farmSize: '',
    experience: '',
    specialization: '',
    skills: '',
    availabilityStatus: 'available',
    contactPreferences: {
      email: true,
      phone: true,
      sms: false
    },
    privacy: {
      showPhone: true,
      showEmail: false,
      showLocation: true
    }
  });

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
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Determine API endpoint based on user role
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};
      const apiEndpoint = user.role === 'Labour' ? '/api/worker/profile' : '/api/farmer/profile';

      const response = await axios.get(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Merge response data with default structure
      const profile = response.data.profile || {};
      setProfileData(prev => ({
        ...prev,
        ...profile,
        contactPreferences: {
          ...prev.contactPreferences,
          ...(profile.contactPreferences || {})
        },
        privacy: {
          ...prev.privacy,
          ...(profile.privacy || {})
        }
      }));
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
      // Handle nested properties (contactPreferences, privacy)
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
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Determine API endpoint based on user role
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : {};
      const apiEndpoint = user.role === 'Labour' ? '/api/worker/profile' : '/api/farmer/profile';

      const response = await axios.put(apiEndpoint, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage('Profile updated successfully!');
      
      // Update localStorage user data if it exists
      if (userData) {
        const updatedUser = JSON.parse(userData);
        localStorage.setItem('user', JSON.stringify({
          ...updatedUser,
          name: profileData.name,
          email: profileData.email
        }));
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(
        err.response?.data?.message || 
        'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to home page
      navigate('/');
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
            {userRole === 'Labour' 
              ? 'Manage your worker profile, skills, and availability' 
              : 'Manage your personal information and preferences'
            }
          </p>
        </div>
        <button 
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
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

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h2 className="section-title">Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
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
                  value={profileData.email}
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
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Farm/Work Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              {userRole === 'Labour' ? 'Work Information' : 'Farm Information'}
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="farmLocation" className="form-label">
                  {userRole === 'Labour' ? 'Current Location' : 'Farm Location'}
                </label>
                <input
                  type="text"
                  id="farmLocation"
                  name="farmLocation"
                  value={profileData.farmLocation}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>

              {userRole !== 'Labour' && (
                <div className="form-group">
                  <label htmlFor="farmSize" className="form-label">Farm Size (acres)</label>
                  <input
                    type="number"
                    id="farmSize"
                    name="farmSize"
                    value={profileData.farmSize}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    step="0.1"
                    placeholder="e.g., 5.5"
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience" className="form-label">Years of Experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  placeholder="e.g., 10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialization" className="form-label">
                  {userRole === 'Labour' ? 'Primary Work Area' : 'Specialization'}
                </label>
                <input
                  type="text"
                  id="specialization"
                  name="specialization"
                  value={profileData.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={userRole === 'Labour' ? 'e.g., Harvesting, Field Preparation' : 'e.g., Sugarcane, Rice'}
                />
              </div>
            </div>
          </div>

          {/* Labour-specific Information Section */}
          {userRole === 'Labour' && (
            <div className="form-section">
              <h2 className="section-title">Worker Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="skills" className="form-label">Skills</label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={profileData.skills}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="e.g., Harvesting, Planting, Irrigation, Equipment Operation, Pest Control"
                    rows="3"
                  />
                  <small className="form-help">List your agricultural skills separated by commas</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="availabilityStatus" className="form-label">Availability Status</label>
                  <select
                    id="availabilityStatus"
                    name="availabilityStatus"
                    value={profileData.availabilityStatus}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="available">Available for work</option>
                    <option value="busy">Currently busy</option>
                    <option value="partially_available">Partially available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  <small className="form-help">Let employers know your current availability</small>
                </div>
              </div>
            </div>
          )}

          {/* Contact Preferences Section */}
          <div className="form-section">
            <h2 className="section-title">Contact Preferences</h2>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="contactPreferences.email"
                  checked={profileData.contactPreferences.email}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Email notifications</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="contactPreferences.phone"
                  checked={profileData.contactPreferences.phone}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">Phone calls</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="contactPreferences.sms"
                  checked={profileData.contactPreferences.sms}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">SMS notifications</span>
              </label>
            </div>
          </div>

          {/* Privacy Settings Section */}
          <div className="form-section">
            <h2 className="section-title">Privacy Settings</h2>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="privacy.showPhone"
                  checked={profileData.privacy.showPhone}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">
                  {userRole === 'Labour' 
                    ? 'Show phone number to employers' 
                    : 'Show phone number to other farmers'
                  }
                </span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="privacy.showEmail"
                  checked={profileData.privacy.showEmail}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">
                  {userRole === 'Labour' 
                    ? 'Show email address to employers' 
                    : 'Show email address to other farmers'
                  }
                </span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="privacy.showLocation"
                  checked={profileData.privacy.showLocation}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <span className="checkbox-text">
                  {userRole === 'Labour' 
                    ? 'Show current location to employers' 
                    : 'Show farm location to other farmers'
                  }
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              className="cancel-btn"
              onClick={fetchProfile}
              disabled={saving}
            >
              Reset Changes
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .profile-page {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content h1 {
          color: #2c5530;
          font-size: 2.5rem;
          margin: 0;
        }

        .page-subtitle {
          color: #666;
          font-size: 1.1rem;
          margin: 0.5rem 0 0 0;
        }

        .logout-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #c82333;
          transform: translateY(-2px);
        }

        .loading-container {
          text-align: center;
          padding: 4rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4caf50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .profile-content {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          color: #c53030;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .success-message {
          background: #f0fff4;
          border: 1px solid #9ae6b4;
          color: #2f855a;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .retry-btn {
          background: #4caf50;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .section-title {
          color: #2c5530;
          font-size: 1.3rem;
          margin: 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #4caf50;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-input {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-textarea {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
          transition: border-color 0.2s ease;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-select {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 1rem;
          background-color: white;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .form-select:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-help {
          color: #666;
          font-size: 0.85rem;
          margin-top: 0.25rem;
          font-style: italic;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background-color 0.2s ease;
        }

        .checkbox-label:hover {
          background: #f8f9fa;
        }

        .checkbox-input {
          width: 1.2rem;
          height: 1.2rem;
          cursor: pointer;
        }

        .checkbox-text {
          font-size: 1rem;
          color: #333;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }

        .save-btn,
        .cancel-btn {
          padding: 0.875rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn {
          background: #4caf50;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-2px);
        }

        .save-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-2px);
        }

        .cancel-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-page {
            padding: 1rem;
          }

          .profile-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .profile-content {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
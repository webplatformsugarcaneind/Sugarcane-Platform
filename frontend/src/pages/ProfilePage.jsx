import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../utils/authUtils';
import './FarmerProfile.css'; // Inheriting unified dark theme CSS
import './ProfilePage.css'; // For the pp-sticky-save bottom banner

/**
 * ProfilePage Component - Role-based profile layouts (Dark Theme Unified)
 */
const ProfilePage = () => {
    const navigate = useNavigate();
    
    const [profileData, setProfileData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [userRole, setUserRole] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [savedSnapshot, setSavedSnapshot] = useState({});
    
    // Cursor tracking

    useEffect(() => {
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
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            const profile = response.data.profile || {};
            
            // Format arrays to comma separated strings for display
            const arrayFields = ['skills', 'equipment', 'farmingMethods', 'certifications', 'managementOperations', 'servicesOffered', 'specialization'];
            arrayFields.forEach(field => {
                if (profile[field] && Array.isArray(profile[field])) {
                    profile[field] = profile[field].join(', ');
                }
            });

            // Set specific formatings
            if (profile.crushingStatus === true || profile.crushingStatus === 'true') {
                profile.crushingStatus = '1';
            } else if (profile.crushingStatus === false || profile.crushingStatus === 'false') {
                profile.crushingStatus = '0';
            } else if (!profile.crushingStatus) {
                profile.crushingStatus = '0'; 
            }

            // Extract nested contact info for factory
            if (user.role === 'Factory' && profile.contactInfo) {
                profile.email = profile.contactInfo.email || profile.email;
                profile.phone = profile.contactInfo.phone || profile.phone;
                profile.website = profile.contactInfo.website || profile.website;
            }

            setProfileData(profile);
            setSavedSnapshot(profile);
            setHasChanges(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfileData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };
            setHasChanges(JSON.stringify(newData) !== JSON.stringify(savedSnapshot));
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage('');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            let apiEndpoint;
            const updateData = { ...profileData };

            // Fields stay as strings as the backend User model expects Strings (comma-separated if needed)
            // No need to split into arrays here.

            switch (userRole) {
                case 'Worker':
                case 'Labour':
                    apiEndpoint = '/api/worker/profile';
                    break;
                case 'Factory':
                    apiEndpoint = '/api/factory/profile';
                    // We submit as the user typed them; the backend model decides the mapping
                    break;
                case 'HHM':
                    apiEndpoint = '/api/hhm/profile';
                    break;
                case 'Farmer':
                default:
                    apiEndpoint = '/api/farmer/profile';
                    break;
            }

            const response = await axios.put(apiEndpoint, updateData, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            setSuccessMessage(response.data.message || 'Profile updated successfully!');
            setSavedSnapshot(profileData);
            setHasChanges(false);

            // Update local storage name if it changed
            if (updateData.name) {
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                userData.name = updateData.name;
                localStorage.setItem('user', JSON.stringify(userData));
                window.dispatchEvent(new Event('userUpdated'));
            }

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(handleApiError(err) || 'Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="farmer-profile-page" style={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' 
            }}>
                <div style={{ color: 'var(--green)' }}>Loading Profile...</div>
            </div>
        );
    }

    const initials = profileData.name ? profileData.name.substring(0, 2).toUpperCase() : (userRole.substring(0, 2).toUpperCase() || 'US');

    // Role Specific Form Renders
    const renderFarmerProfile = () => (
        <>
            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">👨‍🌾</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Personal Information</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field full-width">
                            <label>Full Name</label>
                            <input type="text" name="name" value={profileData.name || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Email <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem'}}>(Read Only)</span></label>
                            <input type="email" name="email" value={profileData.email || ''} readOnly className="fp-input" style={{ opacity: 0.5,  }} />
                        </div>
                        <div className="fp-field">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={profileData.phone || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Primary Location</label>
                            <input type="text" name="location" value={profileData.location || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., Nashik, Maharashtra" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">🌾</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Farm Details</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field">
                            <label>Farm Size</label>
                            <input type="text" name="farmSize" value={profileData.farmSize || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., 25 acres" />
                        </div>
                        <div className="fp-field">
                            <label>Farming Experience</label>
                            <input type="text" name="farmingExperience" value={profileData.farmingExperience || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., 12 years" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Primary Crops</label>
                            <input type="text" name="cropTypes" value={profileData.cropTypes || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., Sugarcane, Wheat, Rice" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Farming Methods</label>
                            <input type="text" name="farmingMethods" value={profileData.farmingMethods || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., Organic farming, Drip irrigation" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Equipment Owned</label>
                            <input type="text" name="equipment" value={profileData.equipment || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., Tractor, Harvester, Irrigation pumps" />
                        </div>
                        <div className="fp-field">
                            <label>Certifications</label>
                            <input type="text" name="certifications" value={profileData.certifications || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., Organic Farming Certificate" />
                        </div>
                        <div className="fp-field">
                            <label>Irrigation Type</label>
                            <select name="irrigationType" value={profileData.irrigationType || 'drip'} onChange={handleInputChange} className="fp-input" style={{ appearance: 'auto', background: '#0b0f0b', color: 'white' }}>
                                <option value="drip">Drip</option>
                                <option value="sprinkler">Sprinkler</option>
                                <option value="flood">Flood</option>
                                <option value="rainfed">Rain-fed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    const renderFactoryProfile = () => (
        <>
            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">🏭</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Factory Details</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field full-width">
                            <label>Representative Name</label>
                            <input type="text" name="name" value={profileData.name || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Factory Name</label>
                            <input type="text" name="factoryName" value={profileData.factoryName || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Factory Location</label>
                            <input type="text" name="factoryLocation" value={profileData.factoryLocation || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Factory Description</label>
                            <textarea name="factoryDescription" value={profileData.factoryDescription || ''} onChange={handleInputChange} rows="3" className="fp-input" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">⚙️</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Operations & Capacity</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field">
                            <label>Specialization</label>
                            <input type="text" name="specialization" value={profileData.specialization || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Experience</label>
                            <input type="text" name="experience" value={profileData.experience || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Capacity</label>
                            <input type="text" name="capacity" value={profileData.capacity || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Operating Season</label>
                            <input type="text" name="operatingSeason" value={profileData.operatingSeason || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., Oct-April" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Crushing Status</label>
                            <select name="crushingStatus" value={profileData.crushingStatus || 'OFF'} onChange={handleInputChange} className="fp-input" style={{ appearance: 'auto', background: '#0b0f0b', color: 'white' }}>
                                <option value="ON">🟢 ON (Active)</option>
                                <option value="OFF">🔴 OFF (Inactive)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">📞</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Contact Info</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field">
                            <label>Factory Email</label>
                            <input type="email" name="email" value={profileData.email || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Phone Line</label>
                            <input type="tel" name="phone" value={profileData.phone || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Website (Optional)</label>
                            <input type="url" name="website" value={profileData.website || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    const renderHHMProfile = () => (
        <>
            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">👔</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Manager Details</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field full-width">
                            <label>Full Name</label>
                            <input type="text" name="name" value={profileData.name || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Email <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem'}}>(Read Only)</span></label>
                            <input type="email" name="email" value={profileData.email || ''} readOnly className="fp-input" style={{ opacity: 0.5,  }} />
                        </div>
                        <div className="fp-field">
                            <label>Phone</label>
                            <input type="tel" name="phone" value={profileData.phone || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">💼</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Management Expertise</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field">
                            <label>Management Experience</label>
                            <input type="text" name="managementExperience" value={profileData.managementExperience || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., 8 years" />
                        </div>
                        <div className="fp-field">
                            <label>Team Size</label>
                            <input type="text" name="teamSize" value={profileData.teamSize || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., 15-20 workers" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Management Operations</label>
                            <input type="text" name="managementOperations" value={profileData.managementOperations || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field full-width">
                            <label>Services Offered</label>
                            <input type="text" name="servicesOffered" value={profileData.servicesOffered || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    const renderLabourProfile = () => (
        <>
            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">👷</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Worker Profile</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field full-width">
                            <label>Full Name</label>
                            <input type="text" name="name" value={profileData.name || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Phone Number</label>
                            <input type="tel" name="phone" value={profileData.phone || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Email <span style={{color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem'}}>(Read Only)</span></label>
                            <input type="email" name="email" value={profileData.email || ''} readOnly className="fp-input" style={{ opacity: 0.5,  }} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="fp-card">
                <div className="fp-card-header">
                    <div className="fp-card-icon">🛠️</div>
                    <div className="fp-card-txt">
                        <h2 className="fp-card-title">Work Capabilities</h2>
                    </div>
                </div>
                <div className="fp-card-body">
                    <div className="fp-form-grid">
                        <div className="fp-field full-width">
                            <label>Skills (Comma separated)</label>
                            <input type="text" name="skills" value={profileData.skills || ''} onChange={handleInputChange} className="fp-input" placeholder="e.g., Harvesting, Tractor Operation" />
                        </div>
                        <div className="fp-field">
                            <label>Work Experience</label>
                            <input type="text" name="workExperience" value={profileData.workExperience || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Daily Wage Rate (₹)</label>
                            <input type="text" name="wageRate" value={profileData.wageRate || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                        <div className="fp-field">
                            <label>Availability</label>
                            <select name="availability" value={profileData.availability || 'Available'} onChange={handleInputChange} className="fp-input" style={{ appearance: 'auto', background: '#0b0f0b', color: 'white' }}>
                                <option value="Available">Available</option>
                                <option value="Unavailable">Unavailable</option>
                            </select>
                        </div>
                        <div className="fp-field">
                            <label>Work Preferences</label>
                            <input type="text" name="workPreferences" value={profileData.workPreferences || ''} onChange={handleInputChange} className="fp-input" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );

    return (
        <div className="farmer-profile-page" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(126,200,67,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(126,200,67,0.05) 0%, transparent 50%), #0b0f0b' }}>
            <div className="fp-noise" />
            <div className="fp-bg-glow" />

            <div className="fp-layout-shell">
                <aside className="fp-sidebar" >
                    <div className="fp-sidebar-profile">
                        <div className="fp-avatar-wrap">
                            <div className="fp-avatar">{initials}</div>
                            <div className="fp-avatar-ring"></div>
                        </div>
                        <div className="fp-user-name">{profileData.name || 'My Profile'}</div>
                        <div className="fp-user-role">
                            <span className="fp-role-dot" style={{ background: hasChanges ? '#ff9800' : '#4caf50' }}></span>
                            {userRole} Account 
                        </div>
                    </div>

                </aside>

                <main className="fp-main">
                    <div className="fp-page-header">
                        <div className="fp-header-left">
                            <div className="fp-eyebrow">Settings</div>
                            <h1 className="fp-title">My <em className="fp-highlight">Profile</em></h1>
                            <p className="fp-subtitle">Update your personal and operations data</p>
                        </div>
                        <div className="fp-header-right">
                            <button 
                                className={`fp-btn-save-top ${saving ? 'pulse' : ''}`} 
                                onClick={handleSubmit} >
                                {saving ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {successMessage && (
                        <div style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid #4caf50', color: 'var(--green)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            ✅ {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {userRole === 'Farmer' && renderFarmerProfile()}
                        {userRole === 'Factory' && renderFactoryProfile()}
                        {userRole === 'HHM' && renderHHMProfile()}
                        {(userRole === 'Worker' || userRole === 'Labour') && renderLabourProfile()}
                    </form>
                </main>
            </div>

            {/* STICKY SAVE BAR — only visible when user has unsaved changes */}
            <div className={`pp-sticky-save ${hasChanges ? 'visible' : ''}`}>
                <div className="pp-sticky-inner">
                    <div className="pp-sticky-msg">
                        <span className="pp-pulse-dot" />
                        <strong>Unsaved changes</strong> — save to update your profile
                    </div>
                    <div className="pp-sticky-btns">
                        <button
                            type="button"
                            className="pp-btn-discard"
                            onClick={() => { setProfileData(savedSnapshot); setHasChanges(false); }}
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            className="pp-btn-save"
                            disabled={saving}
                            onClick={(e) => { e.target.closest('form') ? e.target.closest('form').requestSubmit() : document.querySelector('form')?.requestSubmit(); }}
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
<<<<<<< HEAD

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:5000';
=======
import { configureAxios } from '../config/api';

// Set axios base URL
configureAxios(axios);
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3

/**
 * HHMProfileViewPage Component
 * 
 * Displays detailed profile information for an HHM.
 * Accessible from Factory Associated HHMs page.
 */
const HHMProfileViewPage = () => {
    const { hhmId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
<<<<<<< HEAD
    
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
    const [hhm, setHhm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHHMProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
<<<<<<< HEAD
            
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            if (!token) {
                setError('Authentication required');
                return;
            }

            // Try to get HHM profile - this might need a different endpoint
            const response = await axios.get(`/api/hhm/profile/${hhmId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setHhm(response.data.data);
        } catch (err) {
            console.error('Error fetching HHM profile:', err);
            setError('Failed to load HHM profile');
        } finally {
            setLoading(false);
        }
    }, [hhmId]);

    useEffect(() => {
        // If HHM data is passed via location state, use it
        if (location.state?.hhmData) {
            setHhm(location.state.hhmData);
            setLoading(false);
        } else if (hhmId) {
            fetchHHMProfile();
        } else {
            setError('HHM ID not provided');
            setLoading(false);
        }
    }, [hhmId, location.state, fetchHHMProfile]);

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

<<<<<<< HEAD
    const handleSendRequest = async (hhmId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to send a request');
                return;
            }

            const confirmed = window.confirm(
                `Send a partnership request to ${hhm.name}?\n\nThis will notify the HHM about your interest in working together.`
            );

            if (!confirmed) return;

            const response = await axios.post('/api/farmer/send-request', {
                hhmId: hhmId,
                message: `Hi ${hhm.name}, I would like to partner with you for harvest management services.`
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                alert('✅ Request sent successfully! The HHM will be notified.');
            } else {
                alert('❌ Failed to send request. Please try again.');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            if (error.response?.status === 400 && error.response?.data?.message?.includes('already sent')) {
                alert('ℹ️ You have already sent a request to this HHM.');
            } else {
                alert('❌ Error sending request. Please try again later.');
            }
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
=======
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                minHeight: '400px',
                flexDirection: 'column'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #4caf50',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                }}></div>
                <p>Loading HHM profile...</p>
            </div>
        );
    }

    if (error || !hhm) {
        return (
<<<<<<< HEAD
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
=======
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                minHeight: '400px',
                flexDirection: 'column',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>Error Loading Profile</h3>
                <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
                    {error || 'HHM profile not found'}
                </p>
<<<<<<< HEAD
                <button 
=======
                <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                    onClick={handleGoBack}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                    }}
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    return (
<<<<<<< HEAD
        <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
=======
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
            padding: '2rem',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #e9ecef'
            }}>
<<<<<<< HEAD
                <button 
=======
                <button
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                    onClick={handleGoBack}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#f8f9fa',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginRight: '1rem',
                        fontSize: '0.9rem'
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ margin: 0, color: '#2c3e50' }}>
                    🌾 HHM Profile
                </h1>
            </div>

            {/* Profile Card */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                {/* Profile Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    padding: '2rem',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        margin: '0 auto 1rem auto'
                    }}>
                        🌾
                    </div>
                    <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                        {hhm.name || 'Unknown Name'}
                    </h2>
<<<<<<< HEAD
                    <p style={{ 
                        margin: 0, 
=======
                    <p style={{
                        margin: 0,
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                        fontSize: '1.1rem',
                        opacity: 0.9
                    }}>
                        @{hhm.username || 'unknown'}
                    </p>
                    {hhm.role && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            display: 'inline-block',
                            marginTop: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {hhm.role.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Profile Details */}
                <div style={{ padding: '2rem' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {/* Contact Information */}
                        <div>
<<<<<<< HEAD
                            <h3 style={{ 
                                color: '#2c3e50', 
=======
                            <h3 style={{
                                color: '#2c3e50',
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                📞 Contact Information
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {hhm.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>📧</span>
                                        <span style={{ color: '#495057' }}>{hhm.email}</span>
                                    </div>
                                )}
                                {hhm.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>📱</span>
                                        <span style={{ color: '#495057' }}>{hhm.phone}</span>
                                    </div>
                                )}
                                {hhm.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>📍</span>
                                        <span style={{ color: '#495057' }}>{hhm.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div>
<<<<<<< HEAD
                            <h3 style={{ 
                                color: '#2c3e50', 
=======
                            <h3 style={{
                                color: '#2c3e50',
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                💼 Professional Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {hhm.experience && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>⭐</span>
                                        <span style={{ color: '#495057' }}>{hhm.experience} years experience</span>
                                    </div>
                                )}
                                {hhm.specialization && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>🎯</span>
                                        <span style={{ color: '#495057' }}>{hhm.specialization}</span>
                                    </div>
                                )}
                                {hhm.managementExperience && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '1.1rem' }}>👥</span>
                                        <span style={{ color: '#495057' }}>{hhm.managementExperience} yrs management</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    {(hhm.bio || hhm.skills || hhm.certifications) && (
                        <div style={{ marginTop: '2rem' }}>
<<<<<<< HEAD
                            <h3 style={{ 
                                color: '#2c3e50', 
=======
                            <h3 style={{
                                color: '#2c3e50',
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                                marginBottom: '1rem',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                📋 Additional Information
                            </h3>
<<<<<<< HEAD
                            
=======

>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                            {hhm.bio && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Bio:</h4>
                                    <p style={{ color: '#6c757d', lineHeight: 1.6 }}>{hhm.bio}</p>
                                </div>
                            )}

                            {hhm.skills && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Skills:</h4>
                                    <p style={{ color: '#6c757d' }}>{hhm.skills}</p>
                                </div>
                            )}

                            {hhm.certifications && (
                                <div>
                                    <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Certifications:</h4>
                                    <p style={{ color: '#6c757d' }}>{hhm.certifications}</p>
                                </div>
                            )}
                        </div>
                    )}
<<<<<<< HEAD

                    {/* Action Buttons */}
                    <div style={{ 
                        marginTop: '2rem', 
                        paddingTop: '1.5rem', 
                        borderTop: '1px solid #e9ecef',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => handleSendRequest(hhm._id)}
                            style={{
                                flex: '1',
                                minWidth: '200px',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(155, 89, 182, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            👥 Send Request
                        </button>
                    </div>
=======
>>>>>>> f33822103c24c8f86614c293836c5bd8a4d347a3
                </div>
            </div>
        </div>
    );
};

export default HHMProfileViewPage;
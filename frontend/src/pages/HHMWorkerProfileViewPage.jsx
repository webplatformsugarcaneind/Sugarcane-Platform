import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * HHMWorkerProfileViewPage Component
 * 
 * Displays detailed worker profile information for HHM users
 */
const HHMWorkerProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get worker data from navigation state
    const workerData = location.state?.workerData || null;

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handleContact = () => {
        if (workerData?.email) {
            const subject = encodeURIComponent('Work Opportunity from HHM');
            const body = encodeURIComponent(
                `Hello ${workerData.name || 'there'},\n\n` +
                `I am an HHM and would like to discuss potential work opportunities with you. ` +
                `Please let me know your availability.\n\n` +
                `Best regards`
            );
            window.location.href = `mailto:${workerData.email}?subject=${subject}&body=${body}`;
        }
    };

    const handleSendInvitation = () => {
        // Navigate back to labor management page with invite modal
        navigate('/hhm/labor', { 
            state: { 
                openInviteModal: true, 
                selectedWorker: workerData 
            } 
        });
    };

    if (!workerData) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem' }}>
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '12px',
                    margin: '2rem auto',
                    maxWidth: '500px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                    <h3 style={{ color: '#e74c3c', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Worker Profile Not Found</h3>
                    <p style={{ color: '#7f8c8d', margin: '0 0 2rem 0', fontSize: '1.1rem' }}>Unable to load worker profile information.</p>
                    <button 
                        onClick={handleGoBack}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 30px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button 
                        onClick={handleGoBack}
                        style={{
                            background: 'white',
                            color: '#667eea',
                            padding: '10px 20px',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#667eea';
                            e.target.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'white';
                            e.target.style.color = '#667eea';
                        }}
                    >
                        ← Back to Labor Management
                    </button>
                </div>

                {/* Profile Card */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    {/* Profile Header */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '3rem 2rem',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: workerData.profileImage ? `url(${workerData.profileImage})` : 'rgba(255, 255, 255, 0.2)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            margin: '0 auto 1.5rem',
                            border: '4px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem'
                        }}>
                            {!workerData.profileImage && '👷'}
                        </div>
                        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
                            {workerData.name}
                        </h1>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', opacity: 0.95 }}>
                            {workerData.username ? `@${workerData.username}` : 'Agricultural Worker'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <span style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}>
                                {workerData.availability || 'Status Unknown'}
                            </span>
                            {workerData.isVerified && (
                                <span style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                        padding: '2rem',
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <button 
                            onClick={handleSendInvitation}
                            disabled={workerData.availability !== 'Available'}
                            style={{
                                background: workerData.availability === 'Available' 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : '#ccc',
                                color: 'white',
                                padding: '12px 30px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: workerData.availability === 'Available' ? 'pointer' : 'not-allowed',
                                transition: 'transform 0.2s',
                                opacity: workerData.availability === 'Available' ? 1 : 0.6
                            }}
                            onMouseOver={(e) => {
                                if (workerData.availability === 'Available') {
                                    e.target.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            📤 Send Job Invitation
                        </button>
                        <button 
                            onClick={handleContact}
                            style={{
                                background: 'white',
                                color: '#667eea',
                                padding: '12px 30px',
                                border: '2px solid #667eea',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = '#667eea';
                                e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.color = '#667eea';
                            }}
                        >
                            📞 Contact Worker
                        </button>
                    </div>

                    {/* Profile Details */}
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {/* Contact Information */}
                            <div>
                                <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '700' }}>
                                    📞 Contact Information
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {workerData.email && (
                                        <div>
                                            <p style={{ color: '#7f8c8d', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Email</p>
                                            <p style={{ color: '#2c3e50', margin: 0, fontWeight: '600' }}>{workerData.email}</p>
                                        </div>
                                    )}
                                    {workerData.phone && (
                                        <div>
                                            <p style={{ color: '#7f8c8d', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Phone</p>
                                            <p style={{ color: '#2c3e50', margin: 0, fontWeight: '600' }}>{workerData.phone}</p>
                                        </div>
                                    )}
                                    {workerData.location && (
                                        <div>
                                            <p style={{ color: '#7f8c8d', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Location</p>
                                            <p style={{ color: '#2c3e50', margin: 0, fontWeight: '600' }}>{workerData.location}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Work Information */}
                            <div>
                                <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '700' }}>
                                    💼 Work Information
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {workerData.workExperience && (
                                        <div>
                                            <p style={{ color: '#7f8c8d', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Experience</p>
                                            <p style={{ color: '#2c3e50', margin: 0, fontWeight: '600' }}>{workerData.workExperience}</p>
                                        </div>
                                    )}
                                    {workerData.wageRate && (
                                        <div>
                                            <p style={{ color: '#7f8c8d', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Wage Rate</p>
                                            <p style={{ color: '#2c3e50', margin: 0, fontWeight: '600' }}>{workerData.wageRate}</p>
                                        </div>
                                    )}
                                    {workerData.rating !== undefined && (
                                        <div>
                                            <p style={{ color: '#7f8c8d', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Rating</p>
                                            <p style={{ color: '#2c3e50', margin: 0, fontWeight: '600' }}>
                                                {'⭐'.repeat(Math.floor(workerData.rating))} {workerData.rating.toFixed(1)}
                                            </p>
                                        </div>
                                    )}
                                    {workerData.completedJobs !== undefined && (
                                        <div>
                                            <p style={{ color: '#7f8c8d', margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>Completed Jobs</p>
                                            <p style={{ color: '#2c3e50', margin: 0, fontWeight: '600' }}>{workerData.completedJobs}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        {workerData.skills && workerData.skills.length > 0 && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '700' }}>
                                    🛠️ Skills & Expertise
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {workerData.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Bio */}
                        {workerData.bio && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '700' }}>
                                    📝 About
                                </h3>
                                <p style={{ color: '#2c3e50', lineHeight: '1.6', margin: 0 }}>
                                    {workerData.bio}
                                </p>
                            </div>
                        )}

                        {/* Work Preferences */}
                        {workerData.workPreferences && (
                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ color: '#667eea', marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '700' }}>
                                    ⚙️ Work Preferences
                                </h3>
                                <p style={{ color: '#2c3e50', lineHeight: '1.6', margin: 0 }}>
                                    {workerData.workPreferences}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HHMWorkerProfileViewPage;

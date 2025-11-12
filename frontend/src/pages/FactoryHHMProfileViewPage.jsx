import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * FactoryHHMProfileViewPage Component
 * 
 * Displays detailed information about an HHM for factories
 */
const FactoryHHMProfileViewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get HHM data from navigation state or fallback
    const hhmData = location.state?.hhmData || null;

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handleContact = () => {
        if (hhmData?.email) {
            const subject = encodeURIComponent('Partnership Opportunity');
            const body = encodeURIComponent(
                `Hello ${hhmData.name || 'there'},\n\n` +
                `We are a factory interested in establishing a partnership with your operations. ` +
                `We would like to discuss potential collaboration opportunities.\n\n` +
                `Best regards`
            );
            window.location.href = `mailto:${hhmData.email}?subject=${subject}&body=${body}`;
        }
    };

    const handleRequestPartnership = () => {
        // Here you would typically send a partnership request
        alert('Partnership request sent!');
    };

    if (!hhmData) {
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
                    <h3 style={{ color: '#e74c3c', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>HHM Profile Not Found</h3>
                    <p style={{ color: '#7f8c8d', margin: '0 0 2rem 0', fontSize: '1.1rem' }}>Unable to load HHM profile information.</p>
                    <button 
                        onClick={handleGoBack}
                        style={{
                            background: 'linear-gradient(135deg, #3498db, #2980b9)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem 0' }}>
            {/* Header Section */}
            <div style={{
                background: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                marginBottom: '2rem'
            }}>
                <button 
                    onClick={handleGoBack}
                    style={{
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginBottom: '1.5rem'
                    }}
                >
                    ← Back to Directory
                </button>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                        flexShrink: 0
                    }}>
                        👥
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            color: '#2c3e50',
                            margin: '0 0 0.5rem 0',
                            fontWeight: '700'
                        }}>
                            {hhmData.name || 'Unknown HHM'}
                        </h1>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#7f8c8d',
                            margin: '0 0 1rem 0',
                            fontWeight: '500'
                        }}>
                            Hub Head Manager • {hhmData.location || 'Location Unknown'}
                        </p>
                        <p style={{
                            fontSize: '1rem',
                            color: '#5d6d7e',
                            lineHeight: '1.6',
                            margin: '0',
                            maxWidth: '600px'
                        }}>
                            {hhmData.description || 'Experienced Hub Head Manager coordinating agricultural operations and factory partnerships.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem',
                display: 'grid',
                gap: '2rem'
            }}>
                {/* Contact Information */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        color: '#2c3e50',
                        margin: '0 0 1.5rem 0',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📞 Contact Information
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                background: '#e9ecef',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px'
                            }}>📧</div>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#6c757d',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Email</div>
                                <div style={{
                                    fontSize: '1rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>{hhmData.email || 'Not available'}</div>
                            </div>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                background: '#e9ecef',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px'
                            }}>📱</div>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#6c757d',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Phone</div>
                                <div style={{
                                    fontSize: '1rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>{hhmData.phone || 'Not available'}</div>
                            </div>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            <div style={{
                                fontSize: '1.5rem',
                                background: '#e9ecef',
                                padding: '0.5rem',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px'
                            }}>📍</div>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#6c757d',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>Location</div>
                                <div style={{
                                    fontSize: '1rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>{hhmData.location || 'Not specified'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Partnership Information */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        color: '#2c3e50',
                        margin: '0 0 1.5rem 0',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🤝 Partnership Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: '#e8f5e8',
                            borderRadius: '6px'
                        }}>
                            <span style={{ fontSize: '1.25rem', color: '#27ae60' }}>✅</span>
                            <span>Available for factory partnerships</span>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '6px'
                        }}>
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>👥</span>
                            <span>Worker coordination and management services</span>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '6px'
                        }}>
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>🌾</span>
                            <span>Agricultural operations expertise</span>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{
                        fontSize: '1.5rem',
                        color: '#2c3e50',
                        margin: '0 0 1.5rem 0',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ℹ️ Additional Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '6px'
                        }}>
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>👤</span>
                            <span>Username: {hhmData.username || 'Not available'}</span>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            background: '#f8f9fa',
                            borderRadius: '6px'
                        }}>
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>📅</span>
                            <span>Member since: {hhmData.createdAt ? new Date(hhmData.createdAt).toLocaleDateString() : 'Not available'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                maxWidth: '1200px',
                margin: '2rem auto 0',
                padding: '0 2rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                <button 
                    onClick={handleRequestPartnership}
                    style={{
                        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(46, 204, 113, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(46, 204, 113, 0.3)';
                    }}
                >
                    🤝 Request Partnership
                </button>
                
                <button 
                    onClick={handleContact}
                    style={{
                        background: 'linear-gradient(135deg, #3498db, #2980b9)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(52, 152, 219, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
                    }}
                >
                    📧 Contact
                </button>
                
                {hhmData.phone && (
                    <a
                        href={`tel:${hhmData.phone}`}
                        style={{
                            background: 'linear-gradient(135deg, #f39c12, #e67e22)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(243, 156, 18, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.3)';
                        }}
                    >
                        📱 Call
                    </a>
                )}
                
                <button 
                    onClick={handleGoBack}
                    style={{
                        background: 'transparent',
                        color: '#6c757d',
                        border: '2px solid #6c757d',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = '#6c757d';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#6c757d';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    ← Back to Directory
                </button>
            </div>
        </div>
    );
};

export default FactoryHHMProfileViewPage;
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
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '64px', height: '64px' }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: '60px', height: '60px' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', marginRight: '0.5rem' }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        Contact Information
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
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
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
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                    <line x1="12" y1="18" x2="12.01" y2="18" />
                                </svg>
                            </div>
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
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px', marginRight: '0.5rem' }}>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Partnership Information
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
                            <span style={{ fontSize: '1.25rem', color: '#27ae60' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                            </span>
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
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </span>
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
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                    <path d="M12 20v-8m0 0V4m0 8c2 0 3 1 3 3v5m-3-8c-2 0-3 1-3 3v5" />
                                    <path d="M9 3s1 1 1 3-1 3-1 3m6-6s-1 1-1 3 1 3 1 3" />
                                </svg>
                            </span>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        {' '}Additional Information
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
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
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
                            <span style={{ fontSize: '1.25rem', color: '#6c757d' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </span>
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {' '}Request Partnership
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
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {' '}Contact
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                        {' '}Call
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
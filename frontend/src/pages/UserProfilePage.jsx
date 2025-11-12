import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * UserProfilePage Component
 * 
 * Unified profile page that displays user information for any user type
 * Uses the userId from the URL to fetch and display profile data
 */
const UserProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user profile data
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                
                console.log('🔍 Fetching profile for user ID:', userId);
                
                const response = await axios.get(`/api/users/profile/${userId}`);
                
                if (response.data.success) {
                    setUser(response.data.data);
                    console.log('✅ Profile data loaded:', response.data.data);
                } else {
                    throw new Error(response.data.message || 'Failed to load profile');
                }
            } catch (error) {
                console.error('❌ Error fetching user profile:', error);
                setError(error.response?.data?.message || error.message || 'Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId]);

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handleContact = () => {
        if (user?.email) {
            const subject = encodeURIComponent(`Contact from Sugarcane Platform`);
            const body = encodeURIComponent(
                `Hello ${user.name || 'there'},\n\n` +
                `I found your profile on the Sugarcane Platform and would like to get in touch.\n\n` +
                `Best regards`
            );
            window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
        }
    };

    // Role-specific action handlers
    const handleRoleSpecificAction = () => {
        switch (user?.role) {
            case 'Factory':
                // Factory-specific action (e.g., request partnership)
                alert('Partnership request functionality would be implemented here');
                break;
            case 'HHM':
                // HHM-specific action (e.g., request collaboration)
                alert('Collaboration request functionality would be implemented here');
                break;
            case 'Worker':
                // Worker-specific action (e.g., offer job)
                alert('Job offer functionality would be implemented here');
                break;
            case 'Farmer':
                // Farmer-specific action (e.g., request contract)
                alert('Contract request functionality would be implemented here');
                break;
            default:
                handleContact();
        }
    };

    // Get role-specific colors and icons
    const getRoleStyles = (role) => {
        switch (role) {
            case 'Factory':
                return {
                    gradient: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                    color: '#27ae60',
                    icon: '🏭',
                    bgColor: 'rgba(46, 204, 113, 0.1)'
                };
            case 'HHM':
                return {
                    gradient: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
                    color: '#8e44ad',
                    icon: '👥',
                    bgColor: 'rgba(142, 68, 173, 0.1)'
                };
            case 'Worker':
                return {
                    gradient: 'linear-gradient(135deg, #3498db, #2980b9)',
                    color: '#3498db',
                    icon: '👷',
                    bgColor: 'rgba(52, 152, 219, 0.1)'
                };
            case 'Farmer':
                return {
                    gradient: 'linear-gradient(135deg, #f39c12, #e67e22)',
                    color: '#f39c12',
                    icon: '🌾',
                    bgColor: 'rgba(243, 156, 18, 0.1)'
                };
            default:
                return {
                    gradient: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                    color: '#7f8c8d',
                    icon: '👤',
                    bgColor: 'rgba(149, 165, 166, 0.1)'
                };
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '3rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                    <h3 style={{ color: '#2c3e50', margin: '0' }}>Loading Profile...</h3>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !user) {
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
                    <h3 style={{ color: '#e74c3c', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>Profile Not Found</h3>
                    <p style={{ color: '#7f8c8d', margin: '0 0 2rem 0', fontSize: '1.1rem' }}>
                        {error || 'Unable to load user profile information.'}
                    </p>
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

    const roleStyles = getRoleStyles(user.role);

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
                    ← Back
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
                        background: roleStyles.gradient,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        boxShadow: `0 4px 12px ${roleStyles.bgColor}`,
                        flexShrink: 0
                    }}>
                        {roleStyles.icon}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            color: '#2c3e50',
                            margin: '0 0 0.5rem 0',
                            fontWeight: '700'
                        }}>
                            {user.factoryName || user.name}
                        </h1>
                        <p style={{
                            fontSize: '1.1rem',
                            color: '#7f8c8d',
                            margin: '0 0 1rem 0',
                            fontWeight: '500'
                        }}>
                            {user.role} • {user.factoryLocation || user.location || 'Location not specified'}
                        </p>
                        <div style={{
                            display: 'inline-block',
                            background: roleStyles.bgColor,
                            color: roleStyles.color,
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            @{user.username}
                        </div>
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
                            <div style={{ fontSize: '1.5rem' }}>📧</div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '600' }}>Email</div>
                                <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '500' }}>{user.email}</div>
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
                            <div style={{ fontSize: '1.5rem' }}>📱</div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '600' }}>Phone</div>
                                <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '500' }}>{user.phone}</div>
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
                            <div style={{ fontSize: '1.5rem' }}>📅</div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '600' }}>Member Since</div>
                                <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '500' }}>
                                    {new Date(user.joinedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role-specific Information */}
                {user.profileType && (
                    <RoleSpecificInfo user={user} />
                )}
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
                    onClick={handleRoleSpecificAction}
                    style={{
                        background: roleStyles.gradient,
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
                        boxShadow: `0 4px 12px ${roleStyles.bgColor}`,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = `0 6px 20px ${roleStyles.bgColor}`;
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = `0 4px 12px ${roleStyles.bgColor}`;
                    }}
                >
                    {roleStyles.icon} Connect
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
                    📧 Email
                </button>
                
                {user.phone && (
                    <a
                        href={`tel:${user.phone}`}
                        style={{
                            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
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
                            boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(39, 174, 96, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
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
                    ← Go Back
                </button>
            </div>
        </div>
    );
};

// Role-specific information component
const RoleSpecificInfo = ({ user }) => {
    const renderFactoryInfo = () => (
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
                🏭 Factory Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <InfoItem icon="🏢" label="Factory Name" value={user.factoryName} />
                <InfoItem icon="📍" label="Location" value={user.factoryLocation} />
                <InfoItem icon="⚡" label="Capacity" value={user.capacity} />
                <InfoItem icon="🎯" label="Specialization" value={user.specialization} />
                <InfoItem icon="📊" label="Experience" value={user.experience} />
            </div>
            {user.factoryDescription && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <strong>Description:</strong> {user.factoryDescription}
                </div>
            )}
        </div>
    );

    const renderFarmerInfo = () => (
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
                🌾 Farm Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <InfoItem icon="🚜" label="Farm Size" value={user.farmSize} />
                <InfoItem icon="📊" label="Experience" value={user.farmingExperience} />
                <InfoItem icon="🌱" label="Crop Types" value={user.cropTypes} />
                <InfoItem icon="💧" label="Irrigation" value={user.irrigationType} />
                <InfoItem icon="🔧" label="Equipment" value={user.equipment} />
                <InfoItem icon="🏆" label="Certifications" value={user.certifications} />
            </div>
        </div>
    );

    const renderHHMInfo = () => (
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
                👥 Management Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <InfoItem icon="📊" label="Experience" value={user.managementExperience} />
                <InfoItem icon="👥" label="Team Size" value={user.teamSize} />
                <InfoItem icon="⚙️" label="Operations" value={user.managementOperations} />
                <InfoItem icon="🛠️" label="Services" value={user.servicesOffered} />
            </div>
        </div>
    );

    const renderWorkerInfo = () => (
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
                👷 Work Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <InfoItem icon="🔧" label="Skills" value={user.skills} />
                <InfoItem icon="📊" label="Experience" value={user.workExperience} />
                <InfoItem icon="💰" label="Wage Rate" value={user.wageRate} />
                <InfoItem icon="📅" label="Availability" value={user.availability} />
                <InfoItem icon="⭐" label="Preferences" value={user.workPreferences} />
            </div>
        </div>
    );

    switch (user.profileType) {
        case 'factory':
            return renderFactoryInfo();
        case 'farmer':
            return renderFarmerInfo();
        case 'hhm':
            return renderHHMInfo();
        case 'worker':
            return renderWorkerInfo();
        default:
            return null;
    }
};

// Helper component for information items
const InfoItem = ({ icon, label, value }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        background: '#f8f9fa',
        borderRadius: '6px'
    }}>
        <span style={{ fontSize: '1.25rem' }}>{icon}</span>
        <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: '600' }}>{label}</div>
            <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '500' }}>
                {value || 'Not specified'}
            </div>
        </div>
    </div>
);

export default UserProfilePage;
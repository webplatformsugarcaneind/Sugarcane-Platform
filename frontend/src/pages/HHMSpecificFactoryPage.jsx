import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * HHMSpecificFactoryPage Component
 * 
 * Displays detailed information for a specific factory.
 * HHM users can view full factory details, contact information, and partnership opportunities.
 */
const HHMSpecificFactoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchFactoryDetails();
    }
  }, [id]);

  const fetchFactoryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching factory details for ID:', id);
      
      const response = await axios.get(`/api/public/factories/${id}`);
      
      console.log('✅ Factory details response:', response.data);
      
      if (response.data.success) {
        const factoryData = response.data.data?.factory || response.data.factory || null;
        setFactory(factoryData);
        console.log('✅ Factory loaded:', factoryData);
      } else {
        throw new Error('Failed to fetch factory details');
      }
    } catch (err) {
      console.error('❌ Error fetching factory details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load factory details');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/hhm/factories');
  };

  const getCapacityColor = (capacity) => {
    if (!capacity) return '#666';
    const numericCapacity = parseInt(capacity.toString().match(/\d+/)?.[0] || '0');
    if (numericCapacity < 1000) return '#ff9800';
    if (numericCapacity < 5000) return '#2196f3';
    return '#4caf50';
  };

  const getCapacityLabel = (capacity) => {
    if (!capacity) return 'Unknown Scale';
    const numericCapacity = parseInt(capacity.toString().match(/\d+/)?.[0] || '0');
    if (numericCapacity < 1000) return 'Small Scale';
    if (numericCapacity < 5000) return 'Medium Scale';
    return 'Large Scale';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSection}>
          <div style={styles.spinner}></div>
          <p>Loading factory details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorSection}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Error Loading Factory</h3>
          <p style={styles.errorMessage}>{error}</p>
          <div style={styles.errorActions}>
            <button style={styles.retryButton} onClick={fetchFactoryDetails}>
              🔄 Retry
            </button>
            <button style={styles.backButton} onClick={handleBack}>
              ← Back to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!factory) {
    return (
      <div style={styles.container}>
        <div style={styles.errorSection}>
          <div style={styles.errorIcon}>🏭</div>
          <h3 style={styles.errorTitle}>Factory Not Found</h3>
          <p style={styles.errorMessage}>
            The factory you're looking for doesn't exist or has been removed.
          </p>
          <button style={styles.backButton} onClick={handleBack}>
            ← Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Back Button */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={handleBack}>
          ← Back to Directory
        </button>
      </div>

      {/* Factory Header Card */}
      <div style={styles.headerCard}>
        <div style={styles.factoryHeader}>
          <div style={styles.factoryAvatar}>
            <span style={styles.avatarIcon}>🏭</span>
          </div>
          <div style={styles.factoryMainInfo}>
            <h1 style={styles.factoryName}>{factory.name || 'Factory Name'}</h1>
            <p style={styles.factoryLocation}>📍 {factory.location || 'Location not specified'}</p>
            <div style={styles.factoryBadges}>
              <span style={{
                ...styles.badge,
                backgroundColor: getCapacityColor(factory.capacity)
              }}>
                {getCapacityLabel(factory.capacity)}
              </span>
              {factory.specialization && (
                <span style={styles.specializationBadge}>
                  ⚙️ {factory.specialization}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.quickStats}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⚡</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Processing Capacity</div>
              <div style={styles.statValue}>{factory.capacity || 'N/A'}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Experience</div>
              <div style={styles.statValue}>{factory.experience || 'N/A'}</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statContent}>
              <div style={styles.statLabel}>Associated HHMs</div>
              <div style={styles.statValue}>{factory.hhmCount || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'overview' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('overview')}
        >
          📋 Overview
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'contact' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('contact')}
        >
          📞 Contact Information
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'operations' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('operations')}
        >
          ⚙️ Operations
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'partnership' ? styles.activeTab : {})
          }}
          onClick={() => setActiveTab('partnership')}
        >
          🤝 Partnership
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.tabPanel}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>About This Factory</h2>
              <div style={styles.descriptionBox}>
                <p style={styles.description}>
                  {factory.description || 'Modern sugar processing facility committed to quality and efficiency.'}
                </p>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Key Information</h2>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Factory Name:</span>
                  <span style={styles.infoValue}>{factory.name}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Location:</span>
                  <span style={styles.infoValue}>{factory.location}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Capacity:</span>
                  <span style={styles.infoValue}>{factory.capacity}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Specialization:</span>
                  <span style={styles.infoValue}>{factory.specialization || 'N/A'}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Experience:</span>
                  <span style={styles.infoValue}>{factory.experience}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Status:</span>
                  <span style={{
                    ...styles.infoValue,
                    color: factory.isActive ? '#27ae60' : '#e74c3c',
                    fontWeight: 'bold'
                  }}>
                    {factory.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information Tab */}
        {activeTab === 'contact' && (
          <div style={styles.tabPanel}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Contact Details</h2>
              <div style={styles.contactGrid}>
                {factory.contactInfo?.email && (
                  <div style={styles.contactCard}>
                    <div style={styles.contactIcon}>📧</div>
                    <div style={styles.contactContent}>
                      <div style={styles.contactLabel}>Email</div>
                      <a href={`mailto:${factory.contactInfo.email}`} style={styles.contactLink}>
                        {factory.contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {factory.contactInfo?.phone && (
                  <div style={styles.contactCard}>
                    <div style={styles.contactIcon}>📱</div>
                    <div style={styles.contactContent}>
                      <div style={styles.contactLabel}>Phone</div>
                      <a href={`tel:${factory.contactInfo.phone}`} style={styles.contactLink}>
                        {factory.contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {factory.contactInfo?.website && (
                  <div style={styles.contactCard}>
                    <div style={styles.contactIcon}>🌐</div>
                    <div style={styles.contactContent}>
                      <div style={styles.contactLabel}>Website</div>
                      <a 
                        href={factory.contactInfo.website.startsWith('http') 
                          ? factory.contactInfo.website 
                          : `https://${factory.contactInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.contactLink}
                      >
                        Visit Website →
                      </a>
                    </div>
                  </div>
                )}

                {factory.contactInfo?.fax && (
                  <div style={styles.contactCard}>
                    <div style={styles.contactIcon}>📠</div>
                    <div style={styles.contactContent}>
                      <div style={styles.contactLabel}>Fax</div>
                      <span style={styles.contactValue}>{factory.contactInfo.fax}</span>
                    </div>
                  </div>
                )}

                {factory.contactInfo?.tollfree && (
                  <div style={styles.contactCard}>
                    <div style={styles.contactIcon}>☎️</div>
                    <div style={styles.contactContent}>
                      <div style={styles.contactLabel}>Toll Free</div>
                      <a href={`tel:${factory.contactInfo.tollfree}`} style={styles.contactLink}>
                        {factory.contactInfo.tollfree}
                      </a>
                    </div>
                  </div>
                )}

                {factory.contactInfo?.landline && (
                  <div style={styles.contactCard}>
                    <div style={styles.contactIcon}>📞</div>
                    <div style={styles.contactContent}>
                      <div style={styles.contactLabel}>Landline</div>
                      <a href={`tel:${factory.contactInfo.landline}`} style={styles.contactLink}>
                        {factory.contactInfo.landline}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Operations Tab */}
        {activeTab === 'operations' && (
          <div style={styles.tabPanel}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Operating Hours</h2>
              {factory.operatingHours && Object.keys(factory.operatingHours).length > 0 ? (
                <div style={styles.operatingHoursGrid}>
                  {Object.entries(factory.operatingHours).map(([key, value]) => (
                    <div key={key} style={styles.operatingHourCard}>
                      <span style={styles.dayLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span style={styles.timeValue}>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noDataMessage}>
                  Operating hours information not available. Please contact the factory directly.
                </p>
              )}
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Operational Capacity</h2>
              <div style={styles.capacityDetails}>
                <div style={styles.capacityCard}>
                  <div style={styles.capacityIcon}>⚡</div>
                  <div style={styles.capacityInfo}>
                    <div style={styles.capacityLabel}>Processing Capacity</div>
                    <div style={styles.capacityValue}>{factory.capacity || 'Not specified'}</div>
                    <div style={styles.capacityType}>{getCapacityLabel(factory.capacity)}</div>
                  </div>
                </div>
              </div>
            </div>

            {factory.associatedHHMs && factory.associatedHHMs.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Associated HHM Partners ({factory.associatedHHMs.length})</h2>
                <div style={styles.hhmGrid}>
                  {factory.associatedHHMs.map((hhm, index) => (
                    <div key={index} style={styles.hhmCard}>
                      <div style={styles.hhmAvatar}>👤</div>
                      <div style={styles.hhmInfo}>
                        <div style={styles.hhmName}>{hhm.name}</div>
                        <div style={styles.hhmContact}>{hhm.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Partnership Tab */}
        {activeTab === 'partnership' && (
          <div style={styles.tabPanel}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>🤝 Partnership Opportunities</h2>
              <div style={styles.partnershipContent}>
                <p style={styles.partnershipIntro}>
                  Connect with this factory to explore mutually beneficial partnership opportunities
                  in workforce management, operations support, and agricultural development.
                </p>

                <div style={styles.opportunitiesGrid}>
                  <div style={styles.opportunityCard}>
                    <div style={styles.opportunityIcon}>👥</div>
                    <h3 style={styles.opportunityTitle}>Worker Placement</h3>
                    <p style={styles.opportunityDescription}>
                      Provide skilled agricultural workers for harvesting seasons and processing operations.
                    </p>
                  </div>

                  <div style={styles.opportunityCard}>
                    <div style={styles.opportunityIcon}>⚙️</div>
                    <h3 style={styles.opportunityTitle}>Maintenance Support</h3>
                    <p style={styles.opportunityDescription}>
                      Offer technical expertise and workforce for equipment maintenance and facility upkeep.
                    </p>
                  </div>

                  <div style={styles.opportunityCard}>
                    <div style={styles.opportunityIcon}>📊</div>
                    <h3 style={styles.opportunityTitle}>Operations Coordination</h3>
                    <p style={styles.opportunityDescription}>
                      Collaborate on harvest scheduling, logistics coordination, and resource optimization.
                    </p>
                  </div>

                  <div style={styles.opportunityCard}>
                    <div style={styles.opportunityIcon}>🌱</div>
                    <h3 style={styles.opportunityTitle}>Training Programs</h3>
                    <p style={styles.opportunityDescription}>
                      Joint training initiatives to enhance worker skills and operational efficiency.
                    </p>
                  </div>
                </div>

                <div style={styles.ctaSection}>
                  <h3 style={styles.ctaTitle}>Ready to Start a Partnership?</h3>
                  <p style={styles.ctaDescription}>
                    Contact this factory directly using the information in the Contact tab to discuss
                    partnership opportunities and explore collaboration possibilities.
                  </p>
                  <div style={styles.ctaButtons}>
                    <button 
                      style={styles.primaryButton}
                      onClick={() => setActiveTab('contact')}
                    >
                      📞 View Contact Information
                    </button>
                    <button style={styles.secondaryButton}>
                      📧 Send Partnership Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '1.5rem'
  },
  backButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  factoryHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  factoryAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #2c5f2d 0%, #4a7c59 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  avatarIcon: {
    fontSize: '3rem'
  },
  factoryMainInfo: {
    flex: 1
  },
  factoryName: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2d3436',
    margin: '0 0 0.5rem 0'
  },
  factoryLocation: {
    fontSize: '1.1rem',
    color: '#636e72',
    margin: '0 0 1rem 0'
  },
  factoryBadges: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  badge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  specializationBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backgroundColor: '#667eea',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  statIcon: {
    fontSize: '2rem'
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#636e72',
    marginBottom: '0.25rem'
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436'
  },
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e1e5e9',
    backgroundColor: 'white',
    borderRadius: '12px 12px 0 0',
    padding: '1rem 1rem 0 1rem',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '1rem 1.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    color: '#636e72'
  },
  activeTab: {
    borderBottom: '3px solid #2c5f2d',
    color: '#2c5f2d',
    fontWeight: 'bold'
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '0 0 12px 12px',
    padding: '2rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    minHeight: '400px'
  },
  tabPanel: {
    animation: 'fadeIn 0.3s ease'
  },
  section: {
    marginBottom: '2.5rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '1.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e1e5e9'
  },
  descriptionBox: {
    padding: '1.5rem',
    backgroundColor: '#f8f9ff',
    borderLeft: '4px solid #667eea',
    borderRadius: '0 8px 8px 0'
  },
  description: {
    fontSize: '1.05rem',
    lineHeight: '1.7',
    color: '#555',
    margin: 0
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#636e72',
    fontWeight: '600'
  },
  infoValue: {
    fontSize: '1rem',
    color: '#2d3436',
    fontWeight: '500'
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  contactCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px solid #e1e5e9',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  contactIcon: {
    fontSize: '2rem'
  },
  contactContent: {
    flex: 1
  },
  contactLabel: {
    fontSize: '0.85rem',
    color: '#636e72',
    fontWeight: '600',
    marginBottom: '0.5rem'
  },
  contactLink: {
    color: '#2c5f2d',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  contactValue: {
    color: '#2d3436',
    fontSize: '1rem'
  },
  operatingHoursGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem'
  },
  operatingHourCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  dayLabel: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2d3436'
  },
  timeValue: {
    fontSize: '0.95rem',
    color: '#636e72'
  },
  noDataMessage: {
    fontSize: '1rem',
    color: '#636e72',
    fontStyle: 'italic',
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  capacityDetails: {
    display: 'flex',
    justifyContent: 'center'
  },
  capacityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    border: '2px solid #e1e5e9',
    minWidth: '300px'
  },
  capacityIcon: {
    fontSize: '3rem'
  },
  capacityInfo: {
    flex: 1
  },
  capacityLabel: {
    fontSize: '0.85rem',
    color: '#636e72',
    marginBottom: '0.5rem'
  },
  capacityValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.5rem'
  },
  capacityType: {
    fontSize: '0.9rem',
    color: '#2c5f2d',
    fontWeight: '600'
  },
  hhmGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem'
  },
  hhmCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e5e9'
  },
  hhmAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2c5f2d',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem'
  },
  hhmInfo: {
    flex: 1
  },
  hhmName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: '0.25rem'
  },
  hhmContact: {
    fontSize: '0.85rem',
    color: '#636e72'
  },
  partnershipContent: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  partnershipIntro: {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    color: '#555',
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  opportunitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  opportunityCard: {
    padding: '1.5rem',
    backgroundColor: 'white',
    border: '2px solid #e1e5e9',
    borderRadius: '12px',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  opportunityIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  opportunityTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.75rem'
  },
  opportunityDescription: {
    fontSize: '0.95rem',
    color: '#636e72',
    lineHeight: '1.5',
    margin: 0
  },
  ctaSection: {
    padding: '2rem',
    backgroundColor: '#f0f8f0',
    borderRadius: '12px',
    textAlign: 'center'
  },
  ctaTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: '0.75rem'
  },
  ctaDescription: {
    fontSize: '1rem',
    color: '#636e72',
    marginBottom: '1.5rem',
    lineHeight: '1.6'
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  primaryButton: {
    padding: '1rem 2rem',
    backgroundColor: '#2c5f2d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  },
  secondaryButton: {
    padding: '1rem 2rem',
    backgroundColor: 'white',
    color: '#2c5f2d',
    border: '2px solid #2c5f2d',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  loadingSection: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  spinner: {
    width: '50px',
    height: '50px',
    margin: '0 auto 1rem',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2c5f2d',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorSection: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: '#e74c3c',
    margin: '0 0 1rem 0'
  },
  errorMessage: {
    fontSize: '1rem',
    color: '#636e72',
    marginBottom: '1.5rem'
  },
  errorActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  retryButton: {
    padding: '0.875rem 2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'background-color 0.2s'
  }
};

export default HHMSpecificFactoryPage;

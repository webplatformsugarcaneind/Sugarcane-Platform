// Clean version of the original HomePage.jsx with all functionality preserved
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Commented out since API call is not currently used
import GuideBox from '../components/GuideBox';
import Modal from '../components/Modal';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [rolesData, setRolesData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get mock roles data function
  const getMockRolesData = () => {
    // Mock data for development/fallback (preserved for reference)
    return {
      farmer: {
        title: 'Farmer',
        // icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2L12 8M12 8L9 11M12 8L15 11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 8L8 14M16 8L16 14" strokeWidth="2" strokeLinecap="round" /><path d="M12 16L12 22" strokeWidth="2" strokeLinecap="round" /><path d="M6 18C6 16 7 14 8 14M18 18C18 16 17 14 16 14" strokeWidth="2" strokeLinecap="round" /></svg>',
        description: 'Manage your agricultural operations efficiently',
        features: [
          'Crop Management & Planning',
          'Yield Tracking & Analytics',
          'Direct Factory Connections',
          'Fair Pricing Transparency',
          'Harvest Scheduling',
          'Quality Assessment Tools',
          'Payment Tracking',
          'Weather Integration',
          'Market Price Updates',
          'Sustainable Farming Tips'
        ],
        benefits: [
          'Increase crop yields by up to 25%',
          'Get better prices through direct factory connections',
          'Reduce intermediary costs and delays',
          'Access to modern farming techniques',
          'Real-time market information',
          'Secure and timely payments',
          'Community support and knowledge sharing',
          'Government scheme notifications'
        ]
      },
      hhm: {
        title: 'HHM (Hub Head Manager)',
        // icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" strokeWidth="2" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" strokeWidth="2" /><circle cx="17" cy="9" r="3" strokeWidth="2" /><path d="M21 21v-1a3 3 0 0 0-3-3h-1" strokeWidth="2" /></svg>',
        description: 'Coordinate operations between farmers and factories',
        features: [
          'Multi-Farm Coordination',
          'Logistics Management',
          'Quality Control Oversight',
          'Farmer Relations Management',
          'Transportation Scheduling',
          'Inventory Tracking',
          'Performance Analytics',
          'Communication Hub',
          'Compliance Monitoring',
          'Resource Allocation'
        ],
        benefits: [
          'Streamline operations across multiple farms',
          'Improve coordination efficiency by 40%',
          'Better resource utilization',
          'Enhanced communication channels',
          'Real-time operational visibility',
          'Reduced logistics costs',
          'Quality assurance compliance',
          'Performance-based incentives'
        ]
      },
      labour: {
        title: 'Worker',
        // icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="2" /></svg>',
        description: 'Find work opportunities and manage your career',
        features: [
          'Job Opportunity Listings',
          'Skill-Based Matching',
          'Work Schedule Management',
          'Payment Tracking',
          'Performance Records',
          'Training Programs',
          'Safety Guidelines',
          'Career Development',
          'Peer Community',
          'Feedback System'
        ],
        benefits: [
          'Access to verified job opportunities',
          'Fair wage transparency',
          'Skill development programs',
          'Flexible work scheduling',
          'Safe working conditions',
          'Career progression paths',
          'Community support network',
          'Regular income opportunities'
        ]
      },
      factories: {
        title: 'Factories',
        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="11" strokeWidth="2" /><rect x="7" y="3" width="4" height="7" strokeWidth="2" /><rect x="13" y="3" width="4" height="7" strokeWidth="2" /><line x1="9" y1="5" x2="9" y2="6" strokeWidth="2" strokeLinecap="round" /><line x1="15" y1="5" x2="15" y2="6" strokeWidth="2" strokeLinecap="round" /></svg>',
        description: 'Optimize your sugar production operations',
        features: [
          'Supply Chain Management',
          'Production Planning',
          'Quality Control Systems',
          'Farmer Network Management',
          'Inventory Optimization',
          'Equipment Monitoring',
          'Compliance Tracking',
          'Financial Analytics',
          'Worker Management',
          'Environmental Monitoring'
        ],
        benefits: [
          'Optimize production efficiency by 30%',
          'Ensure consistent raw material supply',
          'Reduce operational costs',
          'Maintain quality standards',
          'Streamline supply chain operations',
          'Better farmer relationships',
          'Regulatory compliance automation',
          'Data-driven decision making'
        ]
      }
    };
  };

  // Fetch roles and features data from API
  useEffect(() => {
    const fetchRolesData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // For now, use mock data directly since backend might not be running
        console.log('HomePage: Fetching roles data...');
        console.log('HomePage: Using mock data for development');

        const mockData = getMockRolesData();
        console.log('HomePage: Mock data loaded:', mockData);
        setRolesData(mockData);
        setError(null);

        // Uncomment below to use live API when backend is running
        /*
        const response = await axios.get('/api/public/roles-features');
        setRolesFeatures(response.data);
        
        if (response.data && response.data.length > 0) {
          const processedData = {};
          response.data.forEach(role => {
            const roleKey = role.roleName.toLowerCase();
            processedData[roleKey] = {
              title: role.displayName || role.roleName,
              icon: role.icon || '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1" strokeWidth="2" /><path d="M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" strokeWidth="2" /></svg>',
              description: role.description || `Manage your ${role.roleName.toLowerCase()} operations`,
              features: role.features.map(f => f.title) || [],
              benefits: role.benefits || []
            };
          });
          setRolesData(processedData);
        } else {
          setRolesData(getMockRolesData());
        }
        */

      } catch (err) {
        console.error('Error fetching roles data:', err);
        setError('Failed to load roles data. Using fallback data.');
        setRolesData(getMockRolesData());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRolesData();
  }, []);

  // Handle GuideBox click
  const handleGuideBoxClick = (roleTitle) => {
    console.log('GuideBox clicked:', roleTitle); // Debug log
    console.log('Available roles data type:', typeof rolesData); // Debug log
    console.log('Available roles data keys:', Object.keys(rolesData || {})); // Debug log

    // Check if rolesData is valid
    if (!rolesData || typeof rolesData !== 'object') {
      console.error('rolesData is not a valid object:', rolesData);
      alert(`Role data not loaded properly. Please refresh the page.`);
      return;
    }

    let matchedRole = null;

    // Find the matching role data with more specific matching
    if (roleTitle.toLowerCase() === 'farmer' || roleTitle.toLowerCase().includes('farmer')) {
      matchedRole = rolesData.farmer;
    } else if (roleTitle.toLowerCase() === 'hhm' || roleTitle.toLowerCase().includes('hhm')) {
      matchedRole = rolesData.hhm;
    } else if (roleTitle.toLowerCase() === 'worker' || roleTitle.toLowerCase().includes('worker') || roleTitle.toLowerCase() === 'labour' || roleTitle.toLowerCase().includes('labour')) {
      matchedRole = rolesData.labour;
    } else if (roleTitle.toLowerCase() === 'factories' || roleTitle.toLowerCase().includes('factories')) {
      matchedRole = rolesData.factories;
    }

    console.log('Matched role:', matchedRole); // Debug log

    if (matchedRole && typeof matchedRole === 'object') {
      setSelectedRole(matchedRole);
      setIsModalOpen(true);
      console.log('Modal should open now'); // Debug log
    } else {
      console.error('No matching role found for:', roleTitle);
      console.error('Available roles:', Object.keys(rolesData));
      // Show what we have for debugging
      alert(`Clicked on ${roleTitle}\nAvailable roles: ${Object.keys(rolesData).join(', ')}\nRole data type: ${typeof rolesData}`);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
  };

  // Handle Get Started button click - navigate to signup page
  const handleGetStarted = () => {
    navigate('/signup');
  };

  // Handle Learn More button click - navigate to about us page
  const handleLearnMore = () => {
    navigate('/about');
  };

  // Render modal content
  const renderModalContent = () => {
    if (!selectedRole) return null;

    return (
      <div className="role-modal-content">
        <div className="role-header">
          <span className="role-icon">{selectedRole.icon}</span>
          <div className="role-info">
            <h2>{selectedRole.title}</h2>
            <p className="role-description">{selectedRole.description}</p>
          </div>
        </div>

        <div className="role-details">
          {selectedRole.features && selectedRole.features.length > 0 && (
            <div className="features-section-modal">
              <h3>
                <svg style={{ display: 'inline-block', width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path d="M8 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Key Features
              </h3>
              <ul className="features-list">
                {selectedRole.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedRole.benefits && selectedRole.benefits.length > 0 && (
            <div className="benefits-section-modal">
              <h3>
                <svg style={{ display: 'inline-block', width: '24px', height: '24px', marginRight: '8px', verticalAlign: 'middle' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" strokeWidth="2" />
                  <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
                  <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
                  <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Benefits
              </h3>
              <ul className="benefits-list">
                {selectedRole.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-primary" onClick={handleModalClose}>
            Get Started as {selectedRole.title}
          </button>
          <button className="btn-secondary" onClick={handleModalClose}>
            Learn More
          </button>
        </div>
      </div>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading platform features...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Welcome to Sugarcane Platform</h1>
        <p>
          Your comprehensive solution for sugar industry management, connecting farmers, factories, and workers in one unified platform
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={handleGetStarted}>
            Get Started
          </button>
          <button className="btn-secondary" onClick={handleLearnMore}>
            Learn More
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Roles Section with GuideBoxes */}
      <div className="roles-section">
        <h2>Choose Your Role</h2>
        <p className="roles-subtitle">
          Discover how our platform can help you succeed in your specific role within the sugar industry
        </p>

        <div className="guide-boxes-grid">
          <GuideBox
            title="Farmer"
            description="Manage crops, track yields, and connect with factories"
            onClick={handleGuideBoxClick}
            color="farmer"
          />

          <GuideBox
            title="HHM"
            description="Coordinate operations and manage logistics"
            onClick={handleGuideBoxClick}
            color="hhm"
          />

          <GuideBox
            title="Worker"
            description="Find work opportunities and manage your career"
            onClick={handleGuideBoxClick}
            color="labour"
          />

          <GuideBox
            title="Factories"
            description="Optimize production and manage supply chains"
            onClick={handleGuideBoxClick}
            color="factory"
          />
        </div>
      </div>

      {/* Modal for displaying role details */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedRole ? `${selectedRole.title} - Features & Benefits` : ''}
        size="large"
        showCloseButton={true}
        closeOnBackdropClick={true}
        closeOnEscape={true}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default HomePage;
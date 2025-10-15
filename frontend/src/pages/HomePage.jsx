// Clean version of the original HomePage.jsx with all functionality preserved
import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Commented out since API call is not currently used
import GuideBox from '../components/GuideBox';
import Modal from '../components/Modal';
import './HomePage.css';

const HomePage = () => {
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
        icon: '🌾',
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
        icon: '👥',
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
        title: 'Labour',
        icon: '⚒️',
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
        icon: '🏭',
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
              icon: role.icon || '📋',
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
    } else if (roleTitle.toLowerCase() === 'labour' || roleTitle.toLowerCase().includes('labour')) {
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
              <h3>🚀 Key Features</h3>
              <ul className="features-list">
                {selectedRole.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {selectedRole.benefits && selectedRole.benefits.length > 0 && (
            <div className="benefits-section-modal">
              <h3>💡 Benefits</h3>
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
          <button className="btn-primary">
            Get Started
          </button>
          <button className="btn-secondary">
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
            className="debug-clickable"
          />
          
          <GuideBox
            title="HHM"
            description="Coordinate operations and manage logistics"
            onClick={handleGuideBoxClick}
            color="hhm"
            className="debug-clickable"
          />
          
          <GuideBox
            title="Labour"
            description="Find work opportunities and manage your career"
            onClick={handleGuideBoxClick}
            color="labour"
            className="debug-clickable"
          />
          
          <GuideBox
            title="Factories"
            description="Optimize production and manage supply chains"
            onClick={handleGuideBoxClick}
            color="factory"
            className="debug-clickable"
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
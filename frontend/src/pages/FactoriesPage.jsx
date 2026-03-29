import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FactoryCard from '../components/FactoryCard';
import './FactoriesPage.css';

const FactoriesPage = () => {
  const [factories, setFactories] = useState([]);
  const [filteredFactories, setFilteredFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  // Fetch factories from API
  useEffect(() => {
    const fetchFactories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/public/factories');
        
        // Check if response has the expected structure
        if (response.data && response.data.success && response.data.data && response.data.data.factories) {
          const factoriesData = response.data.data.factories;
          
          setFactories(factoriesData);
          setFilteredFactories(factoriesData);
          
          // Extract unique locations for filter dropdown
          const uniqueLocations = [...new Set(factoriesData.map(factory => factory.location))];
          setLocations(uniqueLocations.sort());
          
          setError(null);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        console.error('Error fetching factories:', err);
        setError('Failed to load factories. Please try again later.');
        
        // Mock data with real Maharashtra sugar factories - using CSS-based factory images
        const mockFactories = [
          {
            id: 1,
            name: 'Bajaj Hindusthan Sugar Ltd',
            location: 'Kolhapur, Maharashtra',
            description: 'One of the largest sugar manufacturers in India with modern crushing facilities and ethanol production.',
            capacity: 4500,
            hhmCount: 25,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 2,
            name: 'Dalmia Bharat Sugar',
            location: 'Sangli, Maharashtra',
            description: 'Leading sugar mill with integrated distillery and power co-generation facilities.',
            capacity: 3800,
            hhmCount: 22,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 3,
            name: 'Shree Renuka Sugars Ltd',
            location: 'Athani, Maharashtra',
            description: 'Prominent sugar producer with focus on sustainable farming and renewable energy.',
            capacity: 5200,
            hhmCount: 28,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 4,
            name: 'Balrampur Chini Mills',
            location: 'Pune, Maharashtra',
            description: 'Multi-location sugar company with advanced technology and farmer welfare programs.',
            capacity: 6500,
            hhmCount: 35,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 5,
            name: 'Simbhaoli Sugars Ltd',
            location: 'Nashik, Maharashtra',
            description: 'Integrated sugar complex with distillery, power plant and modern processing units.',
            capacity: 4200,
            hhmCount: 24,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 6,
            name: 'Dwarikesh Sugar Industries',
            location: 'Ahmednagar, Maharashtra',
            description: 'Progressive sugar mill with emphasis on farmer support and community development.',
            capacity: 3600,
            hhmCount: 20,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 7,
            name: 'Triveni Engineering',
            location: 'Satara, Maharashtra',
            description: 'Diversified sugar company with water and power divisions, focusing on innovation.',
            capacity: 4800,
            hhmCount: 26,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 8,
            name: 'KM Sugar Mills',
            location: 'Osmanabad, Maharashtra',
            description: 'Regional sugar producer with strong farmer relationships and quality processing.',
            capacity: 2800,
            hhmCount: 16,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 9,
            name: 'Godavari Biorefineries',
            location: 'Solapur, Maharashtra',
            description: 'Integrated biorefinery with sugar, chemicals, and renewable energy production.',
            capacity: 3400,
            hhmCount: 19,
            imageUrl: null // Will use CSS factory icon
          },
          {
            id: 10,
            name: 'Maharashtra State Co-op',
            location: 'Latur, Maharashtra',
            description: 'Farmer-owned cooperative focusing on fair pricing and sustainable agriculture practices.',
            capacity: 2200,
            hhmCount: 12,
            imageUrl: null // Will use CSS factory icon
          }
        ];
        
        setFactories(mockFactories);
        setFilteredFactories(mockFactories);
        
        const uniqueLocations = [...new Set(mockFactories.map(factory => factory.location))];
        setLocations(uniqueLocations.sort());
      } finally {
        setLoading(false);
      }
    };

    fetchFactories();
  }, []);

  // Filter factories based on search term and location
  useEffect(() => {
    let filtered = factories;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(factory =>
        factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply location filter
    if (locationFilter) {
      filtered = filtered.filter(factory => factory.location === locationFilter);
    }

    setFilteredFactories(filtered);
  }, [factories, searchTerm, locationFilter]);

  // Handle factory card click - navigate to specific factory page
  const handleFactoryClick = (factoryId) => {
    navigate(`/factory/${factoryId}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
  };

  if (loading) {
    return (
      <div className="factories-page">
        <div className="factories-loading">
          <div className="loading-spinner"></div>
          <p>Loading factories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="factories-page">
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Sugar Factories</h1>
          <p className="page-subtitle">
            Discover and connect with sugar factories across India. Find the perfect partner for your sugarcane business.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="factories-controls">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search factories by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="filter-container">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="location-filter"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {(searchTerm || locationFilter) && (
            <button
              onClick={clearFilters}
              className="clear-filters-btn"
              title="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <p>
            Showing {filteredFactories.length} of {factories.length} factories
            {locationFilter && ` in ${locationFilter}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {/* Factories Grid */}
        {filteredFactories.length > 0 ? (
          <div className="factories-grid">
            {filteredFactories.map(factory => (
              <FactoryCard
                key={factory.id}
                id={factory.id}
                name={factory.name}
                location={factory.location}
                description={factory.description}
                capacity={factory.capacity}
                hhmCount={factory.hhmCount}
                imageUrl={factory.imageUrls && factory.imageUrls.length > 0 ? factory.imageUrls[0] : factory.imageUrl}
                onClick={handleFactoryClick}
              />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-content">
              <span className="no-results-icon">🏭</span>
              <h3>No factories found</h3>
              <p>
                {searchTerm || locationFilter
                  ? 'Try adjusting your search criteria or clearing the filters.'
                  : 'No factories are currently available.'}
              </p>
              {(searchTerm || locationFilter) && (
                <button onClick={clearFilters} className="btn-secondary">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoriesPage;
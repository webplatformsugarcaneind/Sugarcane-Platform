const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const User = require('./models/user.model');

const testWithAuthentication = async () => {
  try {
    // Connect to MongoDB to check users
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    // Find a farmer user
    const farmer = await User.findOne({ role: 'Farmer' });
    
    if (!farmer) {
      console.log('❌ No farmer found. Need to create a farmer user first.');
      return;
    }

    console.log('👨‍🌾 Found farmer:', farmer.username);

    // Test login to get token
    console.log('🔐 Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: farmer.email,
      password: 'password123' // Default password from seeder
    });

    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful, got token');

      // Test create listing with authentication
      console.log('🌾 Testing create listing with authentication...');
      const createResponse = await axios.post('http://localhost:5000/api/listings/create', {
        title: 'Test Listing - Authenticated',
        crop_variety: 'Premium Sugarcane',
        quantity_in_tons: 15,
        expected_price_per_ton: 2000,
        harvest_availability_date: '2025-12-15',
        location: 'Test Farm, Maharashtra',
        description: 'High quality sugarcane for testing purposes'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Listing created successfully:', createResponse.data);
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    process.exit(0);
  }
};

testWithAuthentication();
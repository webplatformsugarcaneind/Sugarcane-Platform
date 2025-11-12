const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function testCompleteFlow() {
  try {
    // Connect to MongoDB first
    await mongoose.connect('mongodb://localhost:27017/sugarcane');
    console.log('✅ Connected to MongoDB');

    // Create a fresh test user with proper password hashing
    const testEmail = 'marketplace_test@example.com';
    
    // Remove existing test user if it exists
    await User.deleteOne({ email: testEmail });
    console.log('🗑️ Cleaned up existing test user');

    // Create new test user with proper password hashing
    const hashedPassword = await bcrypt.hash('test123456', 12);
    
    const testUser = new User({
      username: 'marketplacetest',
      name: 'Marketplace Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'Farmer',
      phone: '9876543211',
      location: 'Test Village',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Created fresh test user:', testUser.name);

    // Close the MongoDB connection
    await mongoose.connection.close();
    
    // Wait a moment for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now test login
    console.log('\n🔐 Testing login...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: testEmail,
      password: 'test123456'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      const token = loginResponse.data.token;
      console.log('📝 Token received (first 50 chars):', token.substring(0, 50) + '...');

      // Test marketplace endpoint
      console.log('\n🏪 Testing marketplace API...');
      
      const marketplaceResponse = await axios.get('http://localhost:5000/api/listings/marketplace', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Marketplace API Success!');
      console.log('📊 Response status:', marketplaceResponse.status);
      console.log('📋 Response data:');
      console.log('  - Success:', marketplaceResponse.data.success);
      console.log('  - Message:', marketplaceResponse.data.message);
      console.log('  - Listings count:', marketplaceResponse.data.data?.length || 0);
      
      if (marketplaceResponse.data.pagination) {
        console.log('  - Pagination:', {
          currentPage: marketplaceResponse.data.pagination.currentPage,
          totalListings: marketplaceResponse.data.pagination.totalListings,
          totalPages: marketplaceResponse.data.pagination.totalPages
        });
      }

      console.log('\n🎉 All tests passed! The marketplace API is working correctly.');
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error occurred:');
    console.error('  Message:', error.message);
    
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('  💡 Make sure the backend server is running on port 5000');
    }
    
    // Close MongoDB connection if open
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testCompleteFlow();
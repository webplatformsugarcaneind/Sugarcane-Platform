const axios = require('axios');

async function testListingsAuth() {
  console.log('🧪 Testing listings routes with authentication...');
  
  try {
    // Test marketplace endpoint without auth
    console.log('Testing marketplace endpoint without auth...');
    const response = await axios.get('http://localhost:5000/api/listings/marketplace');
    console.log('✅ Marketplace:', response.data);
  } catch (error) {
    console.log('❌ Marketplace Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }

  try {
    // Test create endpoint without auth  
    console.log('Testing create endpoint without auth...');
    const response = await axios.post('http://localhost:5000/api/listings/create', {
      title: 'Test Listing',
      crop_variety: 'Sugarcane',
      quantity_in_tons: 10,
      expected_price_per_ton: 1000,
      harvest_availability_date: '2025-12-01',
      location: 'Test Location'
    });
    console.log('✅ Create:', response.data);
  } catch (error) {
    console.log('❌ Create Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

testListingsAuth();
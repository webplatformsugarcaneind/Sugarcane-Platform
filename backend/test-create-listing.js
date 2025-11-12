const axios = require('axios');

async function testCreateListing() {
  console.log('🧪 Testing create listing endpoint...');
  
  try {
    // Test create endpoint without auth  
    console.log('Testing create endpoint without authentication...');
    const response = await axios.post('http://localhost:5000/api/listings/create', {
      title: 'Test Listing',
      crop_variety: 'Sugarcane',
      quantity_in_tons: 10,
      expected_price_per_ton: 1000,
      harvest_availability_date: '2025-12-01',
      location: 'Test Location',
      description: 'Test description'
    });
    console.log('✅ Create Success:', response.data);
  } catch (error) {
    console.log('❌ Create Error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Headers:', error.response?.headers);
  }
}

testCreateListing();
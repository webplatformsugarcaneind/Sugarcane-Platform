const axios = require('axios');

async function testMarketplaceEndpoint() {
  console.log('🧪 Testing Marketplace Endpoint...\n');
  
  try {
    console.log('1️⃣ Testing marketplace endpoint accessibility...');
    const response = await axios.get('http://localhost:5000/api/listings/marketplace');
    
    console.log('✅ Marketplace endpoint is accessible');
    console.log('📋 Status:', response.status);
    console.log('📋 Success:', response.data.success);
    console.log('📋 Total listings:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📋 Sample listing:');
      const sample = response.data.data[0];
      console.log('   - Title:', sample.title);
      console.log('   - Crop:', sample.crop_variety);
      console.log('   - Farmer:', sample.farmer_id?.name || 'N/A');
      console.log('   - Price:', sample.expected_price_per_ton);
      console.log('   - Quantity:', sample.quantity_in_tons);
    } else {
      console.log('⚠️ No listings found in marketplace');
    }
    
    console.log('📋 Pagination info:', response.data.pagination);
    
  } catch (error) {
    console.error('❌ Error accessing marketplace:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Backend server is not running');
    } else if (error.response?.status) {
      console.error('📋 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

testMarketplaceEndpoint();
const axios = require('axios');

async function testMarketplaceWithFarmerNames() {
  console.log('🧪 Testing Marketplace Farmer Names...\n');
  
  try {
    console.log('1️⃣ Fetching marketplace data...');
    const response = await axios.get('http://localhost:5000/api/listings/marketplace');
    
    console.log('✅ Marketplace endpoint accessible');
    console.log('📋 Total listings:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n2️⃣ Checking farmer information in listings...');
      response.data.data.forEach((listing, index) => {
        console.log(`📋 Listing ${index + 1}:`);
        console.log(`   - Title: ${listing.title}`);
        console.log(`   - Crop: ${listing.crop_variety}`);
        console.log(`   - Farmer ID: ${listing.farmer_id}`);
        console.log(`   - Farmer Data: ${JSON.stringify(listing.farmer_id, null, 2)}`);
        console.log(`   - Price: ₹${listing.expected_price_per_ton}/ton`);
        console.log(`   - Quantity: ${listing.quantity_in_tons} tons`);
        console.log('');
      });
    } else {
      console.log('⚠️ No listings found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Backend server is not running');
    }
  }
}

testMarketplaceWithFarmerNames();
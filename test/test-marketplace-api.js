const axios = require('axios');

const testMarketplaceAPI = async () => {
  try {
    console.log('🧪 Testing marketplace API...');
    
    const response = await axios.get('http://localhost:5000/api/listings/marketplace');
    const data = response.data;
    
    console.log('\n📊 API Response Status:', response.status);
    console.log('📊 Success:', data.success);
    console.log('📊 Listings Count:', data.data ? data.data.length : 0);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Listings Details:');
      data.data.forEach((listing, index) => {
        const farmer = listing.farmer_id;
        console.log(`\n${index + 1}. ${listing.title}`);
        console.log(`   👤 Farmer: ${farmer?.name || 'Unknown Farmer'} (@${farmer?.username || 'no-username'})`);
        console.log(`   📧 Email: ${farmer?.email || 'no-email'}`);
        console.log(`   📱 Phone: ${farmer?.phone || 'no-phone'}`);
        console.log(`   📍 Location: ${farmer?.location || 'no-location'}`);
        console.log(`   🌾 Variety: ${listing.crop_variety}`);
        console.log(`   ⚖️ Quantity: ${listing.quantity_in_tons} tons`);
        console.log(`   💰 Price: ₹${listing.expected_price_per_ton}/ton`);
        console.log(`   📅 Status: ${listing.status}`);
      });
    } else {
      console.log('\n❌ No listings found in API response');
    }
    
  } catch (error) {
    console.error('\n❌ Error testing API:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
    }
  }
};

testMarketplaceAPI();
const axios = require('axios');

async function testActualAPI() {
  try {
    console.log('🔍 Testing the actual marketplace API endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/listings/marketplace');
    console.log('✅ API Response Status:', response.status);
    
    const { data, meta } = response.data;
    
    if (meta) {
      console.log('📊 Meta data:');
      console.log('   • Total queried:', meta.total_queried);
      console.log('   • Valid returned:', meta.valid_returned);
      console.log('   • Filtered out:', meta.filtered_out);
    }
    
    console.log(`\n📋 Found ${data?.length || 0} listings:`);
    
    if (data && data.length > 0) {
      data.forEach((listing, index) => {
        console.log(`\n${index + 1}. "${listing.title}"`);
        console.log(`   ID: ${listing._id}`);
        console.log(`   Status: ${listing.status}`);
        console.log(`   Farmer ID: ${listing.farmer_id || 'null'}`);
        
        if (listing.farmer_id && typeof listing.farmer_id === 'object') {
          console.log(`   Farmer Name: ${listing.farmer_id.name || 'missing'}`);
          console.log(`   Farmer Email: ${listing.farmer_id.email || 'missing'}`);
        }
        
        if (listing.quantity_available) {
          console.log(`   Quantity: ${listing.quantity_available.value} ${listing.quantity_available.unit}`);
        } else if (listing.quantity_in_tons) {
          console.log(`   Quantity: ${listing.quantity_in_tons} tons (legacy)`);
        }
      });
    } else {
      console.log('No listings found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testActualAPI();
const axios = require('axios');
const colors = require('colors');

/**
 * Test script to verify the marketplace API is returning listings with valid farmer data
 * Run this after applying the fixes to ensure the "Unknown Farmer" issue is resolved
 */

const BASE_URL = 'http://localhost:5000';

const testMarketplaceAPI = async () => {
  console.log('🧪 Testing Marketplace API...'.blue.bold);
  console.log('=====================================\n');

  try {
    // Test marketplace endpoint
    console.log('📡 Calling marketplace endpoint...'.cyan);
    const response = await axios.get(`${BASE_URL}/api/listings/marketplace`);
    
    if (response.status !== 200) {
      console.log(`❌ API returned status ${response.status}`.red);
      return;
    }

    const { data, meta } = response.data;
    
    console.log(`✅ API Response Status: ${response.status}`.green);
    console.log(`📊 Total listings returned: ${data?.length || 0}`.cyan);
    
    if (meta) {
      console.log(`📈 Metadata:`.yellow);
      console.log(`   • Queried: ${meta.total_queried}`);
      console.log(`   • Valid: ${meta.valid_returned}`);
      console.log(`   • Filtered: ${meta.filtered_out}`);
      
      if (meta.filtered_out > 0) {
        console.log(`⚠️  ${meta.filtered_out} listings were filtered due to missing farmer data`.yellow);
      } else {
        console.log(`✅ No listings filtered - all farmer data is valid!`.green);
      }
    }

    console.log('\n🔍 Analyzing listing data...\n');
    
    if (!data || data.length === 0) {
      console.log('❌ No listings found. Try running seeder-improved.js first'.red);
      return;
    }

    let validFarmerCount = 0;
    let invalidFarmerCount = 0;
    
    data.forEach((listing, index) => {
      console.log(`Listing ${index + 1}: "${listing.title}"`);
      
      if (listing.farmer_id && listing.farmer_id.name) {
        console.log(`  ✅ Farmer: ${listing.farmer_id.name}`.green);
        if (listing.farmer_id.email) {
          console.log(`     Email: ${listing.farmer_id.email}`.gray);
        }
        if (listing.farmer_id.location) {
          console.log(`     Location: ${listing.farmer_id.location}`.gray);
        }
        validFarmerCount++;
      } else {
        console.log(`  ❌ Farmer: MISSING (this would show "Unknown Farmer")`.red);
        console.log(`     farmer_id: ${JSON.stringify(listing.farmer_id)}`.gray);
        invalidFarmerCount++;
      }
      
      // Check listing data quality
      if (listing.quantity_available) {
        console.log(`     Quantity: ${listing.quantity_available.value} ${listing.quantity_available.unit}`.gray);
      } else if (listing.quantity_in_tons) {
        console.log(`     Quantity: ${listing.quantity_in_tons} tons (legacy format)`.gray);
      }
      
      console.log('');
    });

    console.log('📋 SUMMARY:'.blue.bold);
    console.log(`✅ Listings with valid farmer data: ${validFarmerCount}`.green);
    console.log(`❌ Listings with missing farmer data: ${invalidFarmerCount}`.red);
    
    if (invalidFarmerCount === 0) {
      console.log('\n🎉 SUCCESS! All listings have valid farmer data.'.green.bold);
      console.log('The "Unknown Farmer" issue should be resolved! 🎊'.green);
    } else {
      console.log('\n⚠️  ISSUE FOUND!'.yellow.bold);
      console.log(`${invalidFarmerCount} listings still have missing farmer data.`.yellow);
      console.log('\nRecommended actions:'.yellow);
      console.log('1. Run: node diagnose-unknown-farmer.js');
      console.log('2. Run: node fix-orphaned-listings.js');
      console.log('3. Or run: node seeder-improved.js -d && node seeder-improved.js');
    }

  } catch (error) {
    console.error('❌ Test failed:'.red.bold);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Cannot connect to server. Is the backend running?'.yellow);
      console.log('   Try: cd backend && npm start'.gray);
    } else if (error.response) {
      console.log(`   Status: ${error.response.status}`.red);
      console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`.red);
    } else {
      console.log(`   Error: ${error.message}`.red);
    }
  }
};

// Test the basic API endpoint first
const testConnection = async () => {
  try {
    console.log('🔌 Testing server connection...'.cyan);
    const response = await axios.get(`${BASE_URL}/api/listings/test`);
    console.log('✅ Server is running and responding'.green);
    return true;
  } catch (error) {
    console.log('❌ Cannot connect to server'.red);
    console.log('   Make sure backend is running: cd backend && npm start'.yellow);
    return false;
  }
};

// Main execution
(async () => {
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('');
    await testMarketplaceAPI();
  }
  
  console.log('\n🏁 Test complete!\n');
})();

/**
 * Usage:
 * npm install axios colors (if not already installed)
 * node test-marketplace-fix.js
 */
const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
const User = require('./models/user.model');
require('dotenv').config();

/**
 * Diagnostic script to identify orphaned crop listings with invalid farmer_id references
 * This helps identify the cause of "Unknown Farmer" issues
 */

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem')
.then(async () => {
  console.log('🔍 Connected to MongoDB - Starting Diagnostic...\n');
  
  // Get total counts
  const totalUsers = await User.countDocuments();
  const totalListings = await CropListing.countDocuments();
  const activeListings = await CropListing.countDocuments({ status: 'active' });
  const farmers = await User.countDocuments({ role: 'Farmer' });
  
  console.log('📊 DATABASE OVERVIEW:');
  console.log(`  • Total Users: ${totalUsers}`);
  console.log(`  • Total Farmers: ${farmers}`);
  console.log(`  • Total Crop Listings: ${totalListings}`);
  console.log(`  • Active Crop Listings: ${activeListings}\n`);

  // Check for orphaned listings
  console.log('🔍 CHECKING FOR ORPHANED LISTINGS:');
  
  const allListings = await CropListing.find({}).select('_id farmer_id title status createdAt');
  const validFarmerIds = await User.find({ role: 'Farmer' }).distinct('_id');
  
  const orphanedListings = [];
  const validListings = [];
  
  for (const listing of allListings) {
    const farmerIdExists = validFarmerIds.some(id => id.toString() === listing.farmer_id.toString());
    
    if (!farmerIdExists) {
      orphanedListings.push(listing);
    } else {
      validListings.push(listing);
    }
  }
  
  console.log(`  ✅ Valid listings: ${validListings.length}`);
  console.log(`  ❌ Orphaned listings: ${orphanedListings.length}\n`);
  
  if (orphanedListings.length > 0) {
    console.log('🚨 ORPHANED LISTINGS DETAILS:');
    orphanedListings.forEach((listing, index) => {
      console.log(`  ${index + 1}. ID: ${listing._id}`);
      console.log(`     Title: ${listing.title}`);
      console.log(`     Invalid farmer_id: ${listing.farmer_id}`);
      console.log(`     Status: ${listing.status}`);
      console.log(`     Created: ${listing.createdAt}`);
      console.log('');
    });
  }

  // Test marketplace API population
  console.log('🏪 TESTING MARKETPLACE POPULATION:');
  try {
    const marketplaceListings = await CropListing.find({ status: 'active' })
      .populate('farmer_id', 'name email phone location')
      .limit(5);
    
    console.log(`  • Retrieved ${marketplaceListings.length} listings from marketplace query`);
    
    marketplaceListings.forEach((listing, index) => {
      console.log(`  ${index + 1}. "${listing.title}"`);
      console.log(`     Farmer Data: ${listing.farmer_id ? 
        `${listing.farmer_id.name} (${listing.farmer_id.email})` : 
        '❌ NULL - This will show "Unknown Farmer"'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error testing marketplace population:', error.message);
  }

  // Check user data quality
  console.log('👤 CHECKING USER DATA QUALITY:');
  const farmersWithMissingData = await User.find({
    role: 'Farmer',
    $or: [
      { name: { $exists: false } },
      { name: '' },
      { email: { $exists: false } },
      { email: '' }
    ]
  }).select('_id name email username');
  
  if (farmersWithMissingData.length > 0) {
    console.log(`  ⚠️ Found ${farmersWithMissingData.length} farmers with missing essential data:`);
    farmersWithMissingData.forEach((farmer, index) => {
      console.log(`  ${index + 1}. ID: ${farmer._id}`);
      console.log(`     Name: ${farmer.name || '❌ MISSING'}`);
      console.log(`     Email: ${farmer.email || '❌ MISSING'}`);
      console.log(`     Username: ${farmer.username}`);
      console.log('');
    });
  } else {
    console.log('  ✅ All farmers have complete essential data');
  }

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  
  if (orphanedListings.length > 0) {
    console.log('  1. Run the fix-orphaned-listings.js script to clean up orphaned listings');
    console.log('  2. Always run create-sample-listings.js AFTER importing user data');
    console.log('  3. Consider using transactions when destroying/recreating database');
  }
  
  if (farmersWithMissingData.length > 0) {
    console.log('  4. Fix farmers with missing name/email data');
  }
  
  if (orphanedListings.length === 0 && farmersWithMissingData.length === 0) {
    console.log('  ✅ Database looks healthy! The "Unknown Farmer" issue might be temporary.');
    console.log('  ✅ Try refreshing the frontend or check network connectivity.');
  }

  console.log('\n🏁 Diagnostic Complete!');
  process.exit(0);
  
})
.catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});
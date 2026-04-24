const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
const User = require('./models/user.model');
require('dotenv').config();

/**
 * Migration script to fix orphaned crop listings
 * This script will:
 * 1. Identify listings with invalid farmer_id references
 * 2. Either reassign them to existing farmers or delete them
 * 3. Ensure all remaining listings have valid farmer references
 */

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem')
.then(async () => {
  console.log('🔧 Connected to MongoDB - Starting Fix Process...\n');
  
  // Get all farmers
  const farmers = await User.find({ role: 'Farmer' }).select('_id name email');
  
  if (farmers.length === 0) {
    console.log('❌ No farmers found in database. Please create farmer users first.');
    console.log('   Run: node seeder.js');
    process.exit(1);
  }
  
  console.log(`👨‍🌾 Found ${farmers.length} farmers in database`);
  
  // Get all listings
  const allListings = await CropListing.find({}).select('_id farmer_id title status');
  console.log(`📋 Found ${allListings.length} total listings\n`);
  
  // Find orphaned listings
  const validFarmerIds = farmers.map(f => f._id.toString());
  const orphanedListings = [];
  const validListings = [];
  
  for (const listing of allListings) {
    const isValid = validFarmerIds.includes(listing.farmer_id.toString());
    if (!isValid) {
      orphanedListings.push(listing);
    } else {
      validListings.push(listing);
    }
  }
  
  console.log('🔍 ANALYSIS RESULTS:');
  console.log(`  ✅ Valid listings: ${validListings.length}`);
  console.log(`  ❌ Orphaned listings: ${orphanedListings.length}\n`);
  
  if (orphanedListings.length === 0) {
    console.log('🎉 No orphaned listings found! Database is healthy.');
    process.exit(0);
  }
  
  // Ask user for action
  console.log('🛠️ AVAILABLE ACTIONS:');
  console.log('  1. DELETE all orphaned listings (recommended if they\'re old/invalid)');
  console.log('  2. REASSIGN orphaned listings to first available farmer');
  console.log('  3. REASSIGN each orphaned listing to a random farmer');
  console.log('  4. EXIT without making changes\n');
  
  // For automated fix, let's default to option 1 (delete)
  const action = process.argv[2] || '1';
  
  switch(action) {
    case '1':
      // Delete orphaned listings
      console.log('🗑️ DELETING orphaned listings...');
      
      const deleteResult = await CropListing.deleteMany({
        farmer_id: { $nin: farmers.map(f => f._id) }
      });
      
      console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned listings\n`);
      break;
      
    case '2':
      // Reassign to first farmer
      console.log(`🔄 REASSIGNING orphaned listings to: ${farmers[0].name}...`);
      
      const updateResult = await CropListing.updateMany(
        { farmer_id: { $nin: farmers.map(f => f._id) } },
        { farmer_id: farmers[0]._id }
      );
      
      console.log(`✅ Reassigned ${updateResult.modifiedCount} listings\n`);
      break;
      
    case '3':
      // Reassign to random farmers
      console.log('🎲 REASSIGNING orphaned listings to random farmers...');
      
      let reassignedCount = 0;
      for (const listing of orphanedListings) {
        const randomFarmer = farmers[Math.floor(Math.random() * farmers.length)];
        await CropListing.updateOne(
          { _id: listing._id },
          { farmer_id: randomFarmer._id }
        );
        console.log(`  • "${listing.title}" → ${randomFarmer.name}`);
        reassignedCount++;
      }
      
      console.log(`✅ Reassigned ${reassignedCount} listings\n`);
      break;
      
    case '4':
      console.log('👋 Exiting without changes...');
      process.exit(0);
      break;
      
    default:
      console.log('❌ Invalid action. Exiting...');
      process.exit(1);
  }
  
  // Verify the fix
  console.log('🔍 VERIFYING FIX...');
  
  const remainingOrphaned = await CropListing.countDocuments({
    farmer_id: { $nin: farmers.map(f => f._id) }
  });
  
  if (remainingOrphaned === 0) {
    console.log('✅ Fix successful! No orphaned listings remain.');
    
    // Test marketplace query
    console.log('\n🧪 TESTING MARKETPLACE QUERY...');
    const testListings = await CropListing.find({ status: 'active' })
      .populate('farmer_id', 'name email')
      .limit(3);
    
    testListings.forEach((listing, index) => {
      console.log(`  ${index + 1}. "${listing.title}"`);
      console.log(`     Farmer: ${listing.farmer_id?.name || '❌ Still null!'}`);
    });
    
    console.log('\n🎉 Database fixed! The "Unknown Farmer" issue should be resolved.');
    
  } else {
    console.log(`❌ Fix incomplete. ${remainingOrphaned} orphaned listings still remain.`);
  }
  
  process.exit(0);
  
})
.catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});

/**
 * Usage:
 * 
 * Delete orphaned listings (default):
 * node fix-orphaned-listings.js
 * 
 * Reassign to first farmer:
 * node fix-orphaned-listings.js 2
 * 
 * Reassign to random farmers:
 * node fix-orphaned-listings.js 3
 * 
 * Exit without changes:
 * node fix-orphaned-listings.js 4
 */
const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
require('dotenv').config();

/**
 * Script to fix string boolean values in price_details.negotiable fields
 * Converts 'true'/'false' strings to proper boolean values
 */

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem')
.then(async () => {
  console.log('🔧 Connected to MongoDB - Fixing boolean values...\n');
  
  try {
    // Find listings with string boolean values
    const problematicListings = await CropListing.find({
      $or: [
        { 'price_details.price_negotiable': { $in: ['true', 'false', 'True', 'False', '1', '0'] } },
        { 'price_details.negotiable': { $in: ['true', 'false', 'True', 'False', '1', '0'] } },
        { 'price_details.is_negotiable': { $in: ['true', 'false', 'True', 'False', '1', '0'] } }
      ]
    });
    
    console.log(`📋 Found ${problematicListings.length} listings with string boolean values`);
    
    if (problematicListings.length === 0) {
      console.log('✅ No fixes needed!');
      process.exit(0);
    }
    
    let fixedCount = 0;
    
    for (const listing of problematicListings) {
      console.log(`\\n🔄 Fixing: "${listing.title}" (${listing._id})`);
      console.log('   Before:', JSON.stringify(listing.price_details, null, 2));
      
      let updated = false;
      
      // Fix price_negotiable
      if (listing.price_details.price_negotiable !== undefined) {
        const oldValue = listing.price_details.price_negotiable;
        if (typeof oldValue === 'string' || typeof oldValue === 'number') {
          listing.price_details.price_negotiable = oldValue === 'true' || oldValue === true || oldValue === 1 || oldValue === '1';
          console.log(`   • price_negotiable: "${oldValue}" → ${listing.price_details.price_negotiable}`);
          updated = true;
        }
      }
      
      // Fix negotiable
      if (listing.price_details.negotiable !== undefined) {
        const oldValue = listing.price_details.negotiable;
        if (typeof oldValue === 'string' || typeof oldValue === 'number') {
          listing.price_details.negotiable = oldValue === 'true' || oldValue === true || oldValue === 1 || oldValue === '1';
          console.log(`   • negotiable: "${oldValue}" → ${listing.price_details.negotiable}`);
          updated = true;
        }
      }
      
      // Fix is_negotiable
      if (listing.price_details.is_negotiable !== undefined) {
        const oldValue = listing.price_details.is_negotiable;
        if (typeof oldValue === 'string' || typeof oldValue === 'number') {
          listing.price_details.is_negotiable = oldValue === 'true' || oldValue === true || oldValue === 1 || oldValue === '1';
          console.log(`   • is_negotiable: "${oldValue}" → ${listing.price_details.is_negotiable}`);
          updated = true;
        }
      }
      
      if (updated) {
        await listing.save();
        console.log('   ✅ Fixed and saved');
        fixedCount++;
      } else {
        console.log('   ℹ️ No changes needed');
      }
    }
    
    console.log(`\\n🎉 Fixed ${fixedCount} listings!`);
    
    // Verify the fixes
    console.log('\\n🔍 Verifying fixes...');
    const remainingIssues = await CropListing.find({
      $or: [
        { 'price_details.price_negotiable': { $in: ['true', 'false', 'True', 'False', '1', '0'] } },
        { 'price_details.negotiable': { $in: ['true', 'false', 'True', 'False', '1', '0'] } },
        { 'price_details.is_negotiable': { $in: ['true', 'false', 'True', 'False', '1', '0'] } }
      ]
    });
    
    if (remainingIssues.length === 0) {
      console.log('✅ All boolean values fixed successfully!');
    } else {
      console.log(`⚠️ Still ${remainingIssues.length} issues remaining`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
})
.catch(err => {
  console.error('❌ Database connection error:', err);
  process.exit(1);
});
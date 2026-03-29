const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
require('dotenv').config();

async function cleanNullFarmers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem');
    console.log('Connected to MongoDB');
    
    // Find all listings and inspect their farmer_id values
    const allListings = await CropListing.find({}).lean();
    console.log(`\n📋 Found ${allListings.length} total listings:`);
    
    allListings.forEach((listing, index) => {
      console.log(`\n${index + 1}. "${listing.title}"`);
      console.log(`   ID: ${listing._id}`);
      console.log(`   farmer_id type: ${typeof listing.farmer_id}`);
      console.log(`   farmer_id value: ${listing.farmer_id}`);
      console.log(`   farmer_id === null: ${listing.farmer_id === null}`);
      console.log(`   !listing.farmer_id: ${!listing.farmer_id}`);
    });
    
    // Try different ways to find null/invalid farmer_id listings
    const nullListings1 = await CropListing.find({ farmer_id: null });
    const nullListings2 = await CropListing.find({ farmer_id: { $exists: false } });
    const nullListings3 = await CropListing.find({ 
      $or: [
        { farmer_id: null }, 
        { farmer_id: { $exists: false } },
        { farmer_id: "" }
      ] 
    });
    
    console.log(`\n🔍 Search results:`);
    console.log(`   farmer_id: null -> ${nullListings1.length} listings`);
    console.log(`   farmer_id not exists -> ${nullListings2.length} listings`);
    console.log(`   Combined null search -> ${nullListings3.length} listings`);
    
    // Delete listings where farmer_id is problematic
    const deleteResult = await CropListing.deleteMany({
      $or: [
        { farmer_id: null },
        { farmer_id: { $exists: false } },
        { farmer_id: "" }
      ]
    });
    
    console.log(`\n🗑️ Deleted ${deleteResult.deletedCount} listings with invalid farmer_id`);
    
    // Count remaining listings
    const remaining = await CropListing.countDocuments();
    console.log(`📊 Remaining listings: ${remaining}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanNullFarmers();
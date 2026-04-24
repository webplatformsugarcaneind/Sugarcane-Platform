const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
require('dotenv').config();

async function updateListingStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem');
    console.log('Connected to MongoDB');
    
    const listings = await CropListing.find({});
    console.log(`Found ${listings.length} listings`);
    
    listings.forEach((listing, index) => {
      console.log(`${index + 1}. "${listing.title}" - Status: ${listing.status}`);
    });
    
    const result = await CropListing.updateMany({}, { status: 'active' });
    console.log(`✅ Updated ${result.modifiedCount} listings to active status`);
    
    // Verify
    const activeCount = await CropListing.countDocuments({ status: 'active' });
    console.log(`📈 Total active listings now: ${activeCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateListingStatus();
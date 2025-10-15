const mongoose = require('mongoose');
const CropListing = require('./models/cropListing.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixListingTypes() {
  try {
    console.log('🔍 Checking crop listings for missing type field...');
    
    // Find all listings
    const allListings = await CropListing.find({});
    console.log(`📊 Found ${allListings.length} total listings`);
    
    // Find listings without type or with null/undefined type
    const listingsWithoutType = await CropListing.find({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: undefined },
        { type: '' }
      ]
    });
    
    console.log(`🔧 Found ${listingsWithoutType.length} listings with missing type field`);
    
    if (listingsWithoutType.length > 0) {
      console.log('\n📝 Updating listings with missing type field...');
      
      for (const listing of listingsWithoutType) {
        console.log(`🏷️  Updating listing: ${listing.cropName} (ID: ${listing._id})`);
        
        // Set default type to 'sell' for listings without type
        await CropListing.findByIdAndUpdate(listing._id, {
          type: 'sell'
        });
        
        console.log(`✅ Updated listing ${listing._id} - set type to 'sell'`);
      }
      
      console.log(`\n🎉 Successfully updated ${listingsWithoutType.length} listings!`);
    } else {
      console.log('✅ All listings already have valid type field!');
    }
    
    // Show final state
    console.log('\n📋 Final listing types summary:');
    const sellListings = await CropListing.countDocuments({ type: 'sell' });
    const buyListings = await CropListing.countDocuments({ type: 'buy' });
    
    console.log(`📤 Sell listings: ${sellListings}`);
    console.log(`📥 Buy listings: ${buyListings}`);
    console.log(`📦 Total listings: ${sellListings + buyListings}`);
    
    // Show some sample listings
    const sampleListings = await CropListing.find({}).limit(5).populate('farmerId', 'name');
    console.log('\n📝 Sample listings:');
    sampleListings.forEach((listing, index) => {
      console.log(`${index + 1}. ${listing.cropName} - Type: ${listing.type} - Farmer: ${listing.farmerId?.name || 'Unknown'}`);
    });
    
  } catch (error) {
    console.error('💥 Error fixing listing types:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Run the fix
fixListingTypes();
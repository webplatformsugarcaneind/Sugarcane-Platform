const mongoose = require('mongoose');
require('dotenv').config();

const CropListing = require('./models/cropListing.model');

async function debugMarketplaceQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB\n');

    // Simulate the exact query used in the marketplace endpoint
    const filter = { status: 'active' };
    
    console.log('1️⃣ Testing filter query...');
    console.log('📋 Filter:', JSON.stringify(filter));

    // Get count using the same filter
    const totalListings = await CropListing.countDocuments(filter);
    console.log('📋 Count with filter:', totalListings);

    // Get actual listings using the same query logic
    const listings = await CropListing.find(filter)
      .populate('farmer_id', 'name username email phone location contact_details')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log('📋 Found listings:', listings.length);
    
    if (listings.length > 0) {
      console.log('\n2️⃣ Sample listing:');
      const sample = listings[0];
      console.log('   - Title:', sample.title);
      console.log('   - Crop:', sample.crop_variety);
      console.log('   - Status:', sample.status);
      console.log('   - Farmer ID:', sample.farmer_id);
      console.log('   - Full object keys:', Object.keys(sample));
    } else {
      console.log('\n❌ No listings returned despite count > 0');
      
      console.log('\n3️⃣ Let me check what we get without populate...');
      const listingsNoPopulate = await CropListing.find(filter)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      
      console.log('📋 Without populate:', listingsNoPopulate.length);
      if (listingsNoPopulate.length > 0) {
        console.log('📋 Sample:', {
          title: listingsNoPopulate[0].title,
          crop_variety: listingsNoPopulate[0].crop_variety,
          status: listingsNoPopulate[0].status,
          farmer_id: listingsNoPopulate[0].farmer_id
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📱 Disconnected from MongoDB');
  }
}

debugMarketplaceQuery();
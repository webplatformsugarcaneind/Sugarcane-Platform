const mongoose = require('mongoose');
require('dotenv').config();

const CropListing = require('./models/cropListing.model');

async function checkListingsInDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB\n');

    console.log('1️⃣ Checking total listings...');
    const totalCount = await CropListing.countDocuments();
    console.log('📋 Total listings in DB:', totalCount);

    console.log('\n2️⃣ Checking listings by status...');
    const activeCount = await CropListing.countDocuments({ status: 'active' });
    const allStatuses = await CropListing.distinct('status');
    console.log('📋 Active listings:', activeCount);
    console.log('📋 All statuses found:', allStatuses);

    console.log('\n3️⃣ Sample listings...');
    const sampleListings = await CropListing.find()
      .select('title crop_variety status farmer_id expected_price_per_ton quantity_in_tons createdAt')
      .limit(5)
      .lean();

    sampleListings.forEach((listing, index) => {
      console.log(`📋 Listing ${index + 1}:`);
      console.log(`   - Title: ${listing.title || 'N/A'}`);
      console.log(`   - Crop: ${listing.crop_variety || 'N/A'}`);
      console.log(`   - Status: ${listing.status || 'N/A'}`);
      console.log(`   - Farmer ID: ${listing.farmer_id || 'N/A'}`);
      console.log(`   - Price: ${listing.expected_price_per_ton || 'N/A'}`);
      console.log(`   - Quantity: ${listing.quantity_in_tons || 'N/A'}`);
      console.log(`   - Created: ${listing.createdAt || 'N/A'}`);
      console.log('');
    });

    if (totalCount > 0 && activeCount === 0) {
      console.log('⚠️ Found listings but none are active. This might be why marketplace is empty.');
      
      console.log('\n4️⃣ Updating listings to active status...');
      const updateResult = await CropListing.updateMany(
        { status: { $ne: 'active' } },
        { $set: { status: 'active' } }
      );
      console.log('✅ Updated', updateResult.modifiedCount, 'listings to active status');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

checkListingsInDB();
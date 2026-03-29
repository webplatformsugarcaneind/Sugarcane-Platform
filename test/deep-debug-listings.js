const mongoose = require('mongoose');
require('dotenv').config();

const CropListing = require('./models/cropListing.model');

async function deepDebugListings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB\n');

    console.log('1️⃣ Testing all listings...');
    const allListings = await CropListing.find({}).lean();
    console.log('📋 Total documents in collection:', allListings.length);

    if (allListings.length > 0) {
      console.log('\n2️⃣ Status distribution:');
      const statusCounts = {};
      allListings.forEach(listing => {
        const status = listing.status || 'undefined';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });

      console.log('\n3️⃣ First few listings:');
      allListings.slice(0, 3).forEach((listing, index) => {
        console.log(`📋 Listing ${index + 1}:`);
        console.log(`   - _id: ${listing._id}`);
        console.log(`   - title: ${listing.title}`);
        console.log(`   - status: "${listing.status}" (type: ${typeof listing.status})`);
        console.log(`   - crop_variety: ${listing.crop_variety}`);
        console.log(`   - farmer_id: ${listing.farmer_id}`);
        console.log('');
      });

      console.log('\n4️⃣ Testing active filter with exact string...');
      const activeListings = await CropListing.find({ status: 'active' }).lean();
      console.log('📋 Found with status="active":', activeListings.length);

      console.log('\n5️⃣ Testing case insensitive...');
      const activeInsensitive = await CropListing.find({ 
        status: { $regex: /^active$/i }
      }).lean();
      console.log('📋 Found with case insensitive active:', activeInsensitive.length);

      console.log('\n6️⃣ Testing using aggregation...');
      const aggregateCount = await CropListing.aggregate([
        { $match: { status: 'active' } },
        { $count: "activeCount" }
      ]);
      console.log('📋 Aggregate count:', aggregateCount);

    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n📱 Disconnected from MongoDB');
  }
}

deepDebugListings();
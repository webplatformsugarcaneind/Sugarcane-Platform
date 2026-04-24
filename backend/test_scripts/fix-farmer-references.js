const mongoose = require('mongoose');
require('dotenv').config();

const CropListing = require('./models/cropListing.model');
const User = require('./models/user.model');

async function checkFarmerReferences() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB\n');

    console.log('1️⃣ Checking crop listings farmer_id field...');
    const listings = await CropListing.find({ status: 'active' }).lean();
    
    console.log('📋 Total active listings:', listings.length);
    
    listings.forEach((listing, index) => {
      console.log(`📋 Listing ${index + 1}:`);
      console.log(`   - Title: ${listing.title}`);
      console.log(`   - farmer_id: ${listing.farmer_id}`);
      console.log(`   - farmer_id type: ${typeof listing.farmer_id}`);
      console.log('');
    });

    console.log('2️⃣ Checking available farmers...');
    const farmers = await User.find({ role: 'Farmer' });
    console.log('📋 Available farmers:');
    farmers.forEach(farmer => {
      console.log(`   - ${farmer.name} (ID: ${farmer._id})`);
    });

    console.log('\n3️⃣ Fixing farmer_id references...');
    if (farmers.length > 0) {
      // Assign farmers to listings randomly
      const updatePromises = listings.map((listing, index) => {
        const farmer = farmers[index % farmers.length]; // Distribute evenly
        return CropListing.updateOne(
          { _id: listing._id },
          { farmer_id: farmer._id }
        );
      });

      const results = await Promise.all(updatePromises);
      console.log('✅ Updated', results.length, 'listings with farmer references');

      console.log('\n4️⃣ Verifying the fix...');
      const updatedListings = await CropListing.find({ status: 'active' })
        .populate('farmer_id', 'name email')
        .lean();

      console.log('📋 Updated listings:');
      updatedListings.forEach((listing, index) => {
        console.log(`📋 Listing ${index + 1}:`);
        console.log(`   - Title: ${listing.title}`);
        console.log(`   - Farmer: ${listing.farmer_id?.name || 'Still null'}`);
        console.log(`   - farmer_id: ${listing.farmer_id?._id || 'null'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

checkFarmerReferences();
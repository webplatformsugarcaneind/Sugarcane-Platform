const connectDB = require('./config/db');
const User = require('./models/user.model');

async function checkListingsDiscrepancy() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get Ravi's user record
    const ravi = await User.findOne({ username: 'ravifarmer' });
    
    if (!ravi) {
      console.log('❌ Ravi not found');
      return;
    }

    console.log('👤 Ravi found:');
    console.log('   ID:', ravi._id);
    console.log('   Name:', ravi.name);
    console.log('   Listings in User.listings array:', ravi.listings?.length || 0);

    if (ravi.listings && ravi.listings.length > 0) {
      console.log('\n📋 Listings from User.listings array:');
      ravi.listings.forEach((listing, index) => {
        console.log(`   ${index + 1}. ${listing.title} (ID: ${listing._id})`);
        console.log(`       Type: ${listing.listing_type}`);
        console.log(`       Price: ₹${listing.price_per_ton}/ton`);
        console.log(`       farmer_id in listing: ${listing.farmer_id}`);
      });
    }

    // Now check if there are listings in a separate collection
    // (The my-listings endpoint is querying by farmer_id in a listings collection)
    console.log('\n🔍 Checking for separate Listing collection...');
    
    // Check if there's a separate Listing model/collection
    const mongoose = require('mongoose');
    const collections = mongoose.connection.db.listCollections();
    
    console.log('\n📊 Available collections:');
    for await (const collection of collections) {
      console.log(`   - ${collection.name}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

checkListingsDiscrepancy();

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/user.model');

async function checkUserListings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    // Find all users and check their usernames
    const allUsers = await User.find({}, 'name username listings');
    console.log('\n📊 All Users in Database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.username}) - ${user.listings ? user.listings.length : 0} listings`);
    });
    
    // Find ravifarmer user and check their listings
    const user = await User.findOne({ username: 'ravifarmer' });
    
    if (user) {
      console.log('\n👤 User found:', user.name);
      console.log('📦 User listings:', user.listings ? user.listings.length : 0);
      
      if (user.listings && user.listings.length > 0) {
        user.listings.forEach((listing, index) => {
          console.log(`\n📋 Listing ${index + 1}:`);
          console.log(`   - Raw listing object:`, JSON.stringify(listing, null, 2));
          console.log(`   - Variety: ${listing.variety || listing.crop_variety || listing.cropType || 'N/A'}`);
          console.log(`   - Quantity Available: ${listing.quantity_in_tons || listing.quantity_available || listing.quantityAvailable || listing.quantity || 'N/A'} tons`);
          console.log(`   - ID: ${listing._id}`);
        });
      } else {
        console.log('❌ No listings found for user');
      }
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkUserListings();
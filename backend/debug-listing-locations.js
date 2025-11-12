const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const User = require('./models/user.model');
    const CropListing = require('./models/cropListing.model');
    
    const ravi = await User.findOne({ email: 'ravi.patel@example.com' });
    console.log('🔍 Debugging Listing Locations...\n');
    
    console.log('📦 User.listings:');
    ravi.listings.forEach((listing, i) => {
      console.log(`  ${i+1}. ${listing.title} - ${listing.quantity_in_tons} tons`);
      console.log(`     ID: ${listing._id}`);
    });
    
    console.log('\n🌾 CropListing collection:');
    const cropListings = await CropListing.find();
    cropListings.forEach((listing, i) => {
      console.log(`  ${i+1}. ${listing.title || listing.crop_variety} - ${listing.quantity_in_tons} tons`);
      console.log(`     ID: ${listing._id}`);
      console.log(`     Farmer ID: ${listing.farmerId}`);
      console.log(`     Farmer Name: ${listing.farmer_name}\n`);
    });
    
    // Check if the order's listing ID matches any existing listing
    const lastOrder = ravi.receivedOrders[ravi.receivedOrders.length - 1];
    console.log(`🔍 Last Order Details:`);
    console.log(`   Listing ID: ${lastOrder.listingId}`);
    console.log(`   Quantity: ${lastOrder.orderDetails.quantityWanted} tons`);
    console.log(`   Status: ${lastOrder.status}`);
    
    // Try to find this listing in both collections
    const userListing = ravi.listings.find(l => l._id.toString() === lastOrder.listingId.toString());
    const cropListing = await CropListing.findById(lastOrder.listingId);
    
    console.log(`\n📍 Listing Location Check:`);
    console.log(`   Found in User.listings: ${userListing ? 'YES' : 'NO'}`);
    console.log(`   Found in CropListing: ${cropListing ? 'YES' : 'NO'}`);
    
    if (userListing) {
      console.log(`   User listing quantity: ${userListing.quantity_in_tons} tons`);
    }
    if (cropListing) {
      console.log(`   Crop listing quantity: ${cropListing.quantity_in_tons} tons`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(console.error);
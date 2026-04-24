const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const User = require('./models/user.model');
    const CropListing = require('./models/cropListing.model');
    
    const ravi = await User.findOne({ email: 'ravi.patel@example.com' });
    console.log('📦 Ravi User Listings:');
    ravi.listings.forEach((listing, i) => {
      console.log(`  ${i+1}. ${listing.crop} - ${listing.quantity} tons (Price: $${listing.pricePerTon}/ton)`);
    });
    
    const cropListings = await CropListing.find({ farmerId: ravi._id });
    console.log('🌾 CropListing Collection:');
    cropListings.forEach((listing, i) => {
      console.log(`  ${i+1}. ${listing.crop} - ${listing.quantity} tons (Price: $${listing.pricePerTon}/ton)`);
    });
    
    console.log('📋 Recent Orders:');
    console.log('Received Orders:', ravi.receivedOrders.length);
    ravi.receivedOrders.slice(-3).forEach((order, i) => {
      console.log(`  ${i+1}. ${order.crop} - ${order.quantity} tons (${order.status})`);
      if (order.isPartialFulfillment) {
        console.log(`    Original: ${order.originalQuantityRequested} tons, Fulfilled: ${order.quantity} tons`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(console.error);

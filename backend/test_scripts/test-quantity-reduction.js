const mongoose = require('mongoose');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

// Test the quantity reduction functionality
async function testQuantityReduction() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/herahermarizon', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📡 Connected to database');

    // Find a farmer with active listings and orders
    const farmersWithOrders = await User.find({
      userType: 'Farmer',
      'receivedOrders.0': { $exists: true },
      'receivedOrders.status': 'pending'
    }).select('name receivedOrders listings');

    console.log('\n📋 Farmers with pending orders:');
    farmersWithOrders.forEach((farmer, index) => {
      const pendingOrders = farmer.receivedOrders.filter(order => order.status === 'pending');
      console.log(`${index + 1}. ${farmer.name}: ${pendingOrders.length} pending orders`);
      
      pendingOrders.forEach((order, orderIndex) => {
        console.log(`   Order ${orderIndex + 1}: ${order.orderDetails?.quantityWanted || 0} gunthas requested`);
      });
    });

    // Check current marketplace listings with quantities
    console.log('\n📊 Current marketplace quantities:');
    const activeListings = await CropListing.find({}).select('crop_type quantity_available quantity_in_tons farmer_id');
    
    activeListings.forEach((listing, index) => {
      const quantity = listing.quantity_available?.value || listing.quantity_in_tons || 0;
      console.log(`${index + 1}. ${listing.crop_type}: ${quantity} gunthas (ID: ${listing._id})`);
    });

    // Also check embedded listings
    const usersWithListings = await User.find({ 'listings.0': { $exists: true } })
      .select('name listings');
    
    console.log('\n📋 Embedded listings in User documents:');
    usersWithListings.forEach(user => {
      user.listings.forEach((listing, index) => {
        const quantity = listing.quantity_available?.value || listing.quantity_in_tons || 0;
        console.log(`${user.name} - ${listing.crop_type}: ${quantity} gunthas`);
      });
    });

    console.log('\n✅ Quantity reduction system is ready to test!');
    console.log('💡 To test: Use the frontend to accept an order and watch quantities update automatically');

  } catch (error) {
    console.error('❌ Error testing quantity reduction:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testQuantityReduction();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

dotenv.config();

const checkPendingOrderDetails = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 Connected to MongoDB');

    console.log('\n🔍 Detailed Pending Order Analysis:');
    
    // Get Prakash's pending order
    const prakash = await User.findOne({ username: 'prakashfarmer' });
    if (prakash && prakash.receivedOrders) {
      const pendingOrder = prakash.receivedOrders.find(order => order.status === 'pending');
      
      if (pendingOrder) {
        console.log('📋 Pending Order Details:');
        console.log('   Order ID:', pendingOrder.orderId);
        console.log('   Listing ID:', pendingOrder.listingId);
        console.log('   Buyer ID:', pendingOrder.buyerId);
        console.log('   Buyer Name:', pendingOrder.buyerDetails.name);
        console.log('   Quantity Wanted:', pendingOrder.orderDetails.quantityWanted);
        console.log('   Proposed Price:', pendingOrder.orderDetails.proposedPrice);
        console.log('   Status:', pendingOrder.status);

        // Check if the listing exists in User.listings
        console.log('\n📦 Checking Listing Availability:');
        const listingInUserListings = prakash.listings ? 
          prakash.listings.find(l => l._id.toString() === pendingOrder.listingId) : null;
        
        console.log('   In User.listings:', listingInUserListings ? 'FOUND ✅' : 'NOT FOUND ❌');
        
        if (listingInUserListings) {
          console.log('   Available Quantity:', listingInUserListings.quantity_in_tons, 'tons');
          console.log('   Crop Variety:', listingInUserListings.crop_variety);
        }

        // Check if the listing exists in CropListing collection
        const listingInCropListing = await CropListing.findById(pendingOrder.listingId);
        console.log('   In CropListing collection:', listingInCropListing ? 'FOUND ✅' : 'NOT FOUND ❌');
        
        if (listingInCropListing) {
          console.log('   Available Quantity:', listingInCropListing.quantity_in_tons, 'tons');
          console.log('   Crop Variety:', listingInCropListing.crop_variety);
        }

        // Check if buyer exists
        console.log('\n👤 Checking Buyer:');
        const buyer = await User.findById(pendingOrder.buyerId);
        console.log('   Buyer exists:', buyer ? 'YES ✅' : 'NO ❌');
        if (buyer) {
          console.log('   Buyer Name:', buyer.name);
          console.log('   Buyer Username:', buyer.username);
        }

        console.log('\n🔧 DIAGNOSIS:');
        if (!listingInUserListings && !listingInCropListing) {
          console.log('❌ PROBLEM: The listing referenced by this order does not exist!');
          console.log('💡 This will cause a 500 error when trying to accept the order.');
        } else if (!buyer) {
          console.log('❌ PROBLEM: The buyer referenced by this order does not exist!');
        } else {
          console.log('✅ Order references appear to be valid');
        }
      } else {
        console.log('❌ No pending orders found for Prakash');
      }
    } else {
      console.log('❌ Prakash farmer not found or has no orders');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

checkPendingOrderDetails();

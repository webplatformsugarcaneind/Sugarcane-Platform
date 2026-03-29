const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error));

const User = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

async function testQuantityManagement() {
  try {
    console.log('\n🔍 Testing Quantity Management System...\n');

    // Find a farmer with listings
    const farmer = await User.findOne({ 
      userType: 'farmer',
      $or: [
        { 'listings.0': { $exists: true } },
        { _id: { $in: await CropListing.distinct('farmerId') } }
      ]
    });

    if (!farmer) {
      console.log('❌ No farmer with listings found');
      return;
    }

    console.log(`✅ Found farmer: ${farmer.name} (${farmer.email})`);

    // Check farmer's listings
    let listing = null;
    if (farmer.listings && farmer.listings.length > 0) {
      listing = farmer.listings.find(l => l.quantity > 0);
      console.log(`📦 User listing found: ${listing ? listing.crop : 'None with quantity'}`);
    }

    // Also check CropListing collection
    const cropListing = await CropListing.findOne({ 
      farmerId: farmer._id,
      quantity: { $gt: 0 }
    });

    if (cropListing) {
      console.log(`🌾 CropListing found: ${cropListing.crop} - ${cropListing.quantity} tons`);
      listing = cropListing;
    }

    if (!listing) {
      console.log('❌ No listing with available quantity found');
      return;
    }

    // Find a buyer (another farmer)
    const buyer = await User.findOne({ 
      userType: 'farmer',
      _id: { $ne: farmer._id }
    });

    if (!buyer) {
      console.log('❌ No buyer found');
      return;
    }

    console.log(`🛒 Found buyer: ${buyer.name} (${buyer.email})`);

    // Test scenarios
    console.log('\n📊 Testing Different Quantity Scenarios:\n');

    // Scenario 1: Request exactly available quantity
    console.log('1️⃣ Scenario: Request exactly available quantity');
    console.log(`   Available: ${listing.quantity} tons`);
    console.log(`   Requested: ${listing.quantity} tons`);
    console.log(`   Expected: Full fulfillment, listing should be removed`);

    // Scenario 2: Request more than available
    const overRequest = listing.quantity + 5;
    console.log(`\n2️⃣ Scenario: Request more than available`);
    console.log(`   Available: ${listing.quantity} tons`);
    console.log(`   Requested: ${overRequest} tons`);
    console.log(`   Expected: Partial fulfillment with ${listing.quantity} tons`);

    // Scenario 3: Request less than available
    const underRequest = Math.max(1, listing.quantity - 5);
    console.log(`\n3️⃣ Scenario: Request less than available`);
    console.log(`   Available: ${listing.quantity} tons`);
    console.log(`   Requested: ${underRequest} tons`);
    console.log(`   Expected: Full fulfillment, listing quantity reduced to ${listing.quantity - underRequest}`);

    // Create a test order for scenario 2 (partial fulfillment)
    console.log(`\n🧪 Creating test order for partial fulfillment scenario...`);
    
    const testOrder = {
      crop: listing.crop,
      quantity: overRequest,
      pricePerTon: listing.pricePerTon,
      totalPrice: overRequest * listing.pricePerTon,
      location: listing.location || 'Test Location',
      urgency: 'normal',
      message: `Test order - requesting ${overRequest} tons when only ${listing.quantity} available`,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone || 'N/A',
      targetFarmerName: farmer.name,
      targetFarmerEmail: farmer.email,
      status: 'pending'
    };

    // Add to farmer's received orders
    farmer.receivedOrders.push(testOrder);
    
    // Add to buyer's sent orders
    const sentOrder = { ...testOrder };
    sentOrder.targetFarmerName = farmer.name;
    sentOrder.targetFarmerEmail = farmer.email;
    buyer.sentOrders.push(sentOrder);

    // Save both users
    await farmer.save();
    await buyer.save();

    console.log(`✅ Test order created successfully`);
    console.log(`   Order ID: ${farmer.receivedOrders[farmer.receivedOrders.length - 1]._id}`);
    console.log(`   Buyer: ${buyer.name}`);
    console.log(`   Seller: ${farmer.name}`);
    console.log(`   Requested: ${overRequest} tons`);
    console.log(`   Available: ${listing.quantity} tons`);

    console.log(`\n💡 Next Steps:`);
    console.log(`   1. Go to farmer's dashboard (${farmer.email})`);
    console.log(`   2. Navigate to received orders`);
    console.log(`   3. Click Accept on the test order`);
    console.log(`   4. Verify partial fulfillment notification`);
    console.log(`   5. Check that listing quantity is properly updated`);

    console.log(`\n🎯 Expected Result:`);
    console.log(`   - Order accepted with partial fulfillment`);
    console.log(`   - Quantity fulfilled: ${listing.quantity} tons`);
    console.log(`   - Total price adjusted: $${(listing.quantity * listing.pricePerTon).toFixed(2)}`);
    console.log(`   - Listing removed (quantity = 0)`);
    console.log(`   - Both buyer and seller records updated`);

  } catch (error) {
    console.error('❌ Error testing quantity management:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testQuantityManagement();
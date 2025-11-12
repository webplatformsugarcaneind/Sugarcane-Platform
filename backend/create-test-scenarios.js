const mongoose = require('mongoose');
require('dotenv').config();

async function createTestOrderScenarios() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB\n');

    const User = require('./models/user.model');
    
    const ravi = await User.findOne({ email: 'ravi.patel@example.com' });
    const prakash = await User.findOne({ email: 'prakash.joshi@example.com' });
    
    if (!ravi || !prakash) {
      console.log('❌ Users not found');
      return;
    }
    
    console.log('🧪 Creating Test Order Scenarios...\n');
    
    // Scenario 1: Order LESS than available (listing should be updated)
    const listing1 = ravi.listings.find(l => l.quantity_in_tons === 75); // Organic Sugarcane - 75 tons
    if (listing1) {
      const order1 = {
        buyerDetails: {
          name: prakash.name,
          email: prakash.email,
          phone: prakash.phone || '+91 9876543200'
        },
        orderDetails: {
          quantityWanted: 50, // Less than 75 tons available
          proposedPrice: listing1.expected_price_per_ton,
          totalAmount: 50 * listing1.expected_price_per_ton,
          deliveryLocation: 'Pune, Maharashtra',
          message: 'TEST: Order less than available quantity - should UPDATE listing to 25 tons',
          urgency: 'normal'
        },
        isPartialFulfillment: false,
        orderId: new mongoose.Types.ObjectId(),
        listingId: listing1._id,
        farmerId: ravi._id,
        buyerId: prakash._id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      ravi.receivedOrders.push(order1);
      prakash.sentOrders.push({
        ...order1,
        targetFarmerName: ravi.name,
        targetFarmerEmail: ravi.email
      });
      
      console.log('✅ Created Scenario 1: PARTIAL ORDER (UPDATE LISTING)');
      console.log(`   Listing: "${listing1.title}" (${listing1.quantity_in_tons} tons)`);
      console.log(`   Order: ${order1.orderDetails.quantityWanted} tons`);
      console.log(`   Expected: Listing updated to ${listing1.quantity_in_tons - order1.orderDetails.quantityWanted} tons\n`);
    }
    
    // Scenario 2: Order EQUAL to available (listing should be removed)
    const listing2 = ravi.listings.find(l => l.quantity_in_tons === 25); // Fresh Harvest - 25 tons
    if (listing2) {
      const order2 = {
        buyerDetails: {
          name: prakash.name,
          email: prakash.email,
          phone: prakash.phone || '+91 9876543200'
        },
        orderDetails: {
          quantityWanted: 25, // Exact match - 25 tons
          proposedPrice: listing2.expected_price_per_ton,
          totalAmount: 25 * listing2.expected_price_per_ton,
          deliveryLocation: 'Mumbai, Maharashtra',
          message: 'TEST: Order equal to available quantity - should REMOVE listing completely',
          urgency: 'normal'
        },
        isPartialFulfillment: false,
        orderId: new mongoose.Types.ObjectId(),
        listingId: listing2._id,
        farmerId: ravi._id,
        buyerId: prakash._id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      ravi.receivedOrders.push(order2);
      prakash.sentOrders.push({
        ...order2,
        targetFarmerName: ravi.name,
        targetFarmerEmail: ravi.email
      });
      
      console.log('✅ Created Scenario 2: EXACT ORDER (REMOVE LISTING)');
      console.log(`   Listing: "${listing2.title}" (${listing2.quantity_in_tons} tons)`);
      console.log(`   Order: ${order2.orderDetails.quantityWanted} tons`);
      console.log(`   Expected: Listing completely removed\n`);
    }
    
    // Scenario 3: Order MORE than available (partial fulfillment + remove listing)
    const listing3 = ravi.listings.find(l => l.quantity_in_tons === 100); // Large Scale - 100 tons
    if (listing3) {
      const order3 = {
        buyerDetails: {
          name: prakash.name,
          email: prakash.email,
          phone: prakash.phone || '+91 9876543200'
        },
        orderDetails: {
          quantityWanted: 120, // More than 100 tons available
          proposedPrice: listing3.expected_price_per_ton,
          totalAmount: 120 * listing3.expected_price_per_ton,
          deliveryLocation: 'Delhi, India',
          message: 'TEST: Order more than available - should do PARTIAL FULFILLMENT and REMOVE listing',
          urgency: 'high'
        },
        isPartialFulfillment: false,
        orderId: new mongoose.Types.ObjectId(),
        listingId: listing3._id,
        farmerId: ravi._id,
        buyerId: prakash._id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      ravi.receivedOrders.push(order3);
      prakash.sentOrders.push({
        ...order3,
        targetFarmerName: ravi.name,
        targetFarmerEmail: ravi.email
      });
      
      console.log('✅ Created Scenario 3: EXCESSIVE ORDER (PARTIAL + REMOVE)');
      console.log(`   Listing: "${listing3.title}" (${listing3.quantity_in_tons} tons)`);
      console.log(`   Order: ${order3.orderDetails.quantityWanted} tons`);
      console.log(`   Expected: Partial fulfillment of ${listing3.quantity_in_tons} tons, listing removed\n`);
    }
    
    // Save all changes
    await ravi.save();
    await prakash.save();
    
    console.log('🎯 ALL TEST SCENARIOS CREATED!');
    console.log('\n📋 Testing Instructions:');
    console.log('1. Go to: http://localhost:5174/');
    console.log('2. Login: ravifarmer / 123456');
    console.log('3. Click: "My Orders" button');
    console.log('4. Accept each order one by one');
    console.log('5. Check: "My Listing" after each acceptance');
    console.log('\n💡 Expected Results:');
    console.log('📊 Scenario 1 → Listing updated: 75 tons → 25 tons');
    console.log('🗑️ Scenario 2 → Listing removed: 25 tons → DELETED');
    console.log('🔄 Scenario 3 → Partial fulfill: 120 tons → 100 tons + DELETED');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestOrderScenarios();
// Test script to demonstrate quantity update functionality
const axios = require('axios');

async function testQuantityUpdate() {
  try {
    console.log('🧪 Testing Quantity Update Functionality\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Step 1: Login as Ravi (farmer with listings)
    console.log('1️⃣ Login as Ravi...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      identifier: 'ravifarmer',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Check current listings with quantities
    console.log('2️⃣ Getting current marketplace listings...');
    const listingsResponse = await axios.get(`${baseURL}/listings/marketplace`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (listingsResponse.data.success) {
      const listings = listingsResponse.data.data || [];
      const raviListings = listings.filter(l => l.farmer_name === 'Ravi Patel');
      
      console.log(`📋 Found ${raviListings.length} listings for Ravi Patel:`);
      raviListings.forEach((listing, i) => {
        console.log(`  ${i+1}. "${listing.title}"`);
        console.log(`     Quantity: ${listing.quantity_in_tons} tons`);
        console.log(`     Price: ₹${listing.expected_price_per_ton}/ton`);
        console.log(`     Total Value: ₹${(listing.quantity_in_tons * listing.expected_price_per_ton).toLocaleString()}`);
      });
    }
    
    // Step 3: Check for pending orders
    console.log('\n3️⃣ Checking for pending orders...');
    const ordersResponse = await axios.get(`${baseURL}/orders/received`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (ordersResponse.data.success) {
      const orders = ordersResponse.data.data || [];
      const pendingOrders = orders.filter(o => o.status === 'pending');
      
      console.log(`📋 Found ${pendingOrders.length} pending orders:`);
      pendingOrders.forEach((order, i) => {
        console.log(`  ${i+1}. Order ID: ${order.orderId}`);
        console.log(`     Buyer: ${order.buyerDetails?.name}`);
        console.log(`     Quantity: ${order.orderDetails?.quantityWanted} tons`);
        console.log(`     Price: ₹${order.orderDetails?.proposedPrice}/ton`);
        console.log(`     Total: ₹${(order.orderDetails?.quantityWanted * order.orderDetails?.proposedPrice).toLocaleString()}`);
      });
      
      if (pendingOrders.length > 0) {
        console.log('\n🎯 QUANTITY UPDATE TEST INSTRUCTIONS:');
        console.log('1. Go to http://localhost:5174/farmer/marketplace');
        console.log('2. Login as: ravifarmer / 123456');
        console.log('3. Click "My Orders" to see pending orders');
        console.log('4. Accept any pending order');
        console.log('5. Check "My Listings" to verify quantity was updated');
        console.log('\n📊 Expected Results:');
        console.log('• If order quantity < listing quantity → Listing quantity reduced');
        console.log('• If order quantity ≥ listing quantity → Listing completely removed');
        console.log('• Order status changes from "pending" to "accepted"');
      } else {
        console.log('\n📝 TO CREATE TEST ORDERS:');
        console.log('1. Go to http://localhost:5174/farmer/marketplace');
        console.log('2. Login as a different farmer (prakash / 123456)');
        console.log('3. Click on any of Ravi\'s listings');
        console.log('4. Fill out the "Buy Request" form and submit');
        console.log('5. Then login as Ravi and accept the orders');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuantityUpdate();
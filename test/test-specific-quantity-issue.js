const axios = require('axios');

async function testSpecificQuantityIssue() {
  try {
    console.log('🔍 Testing Specific Quantity Update Issue\n');
    
    const baseURL = 'http://localhost:5000/api';
    
    // Login as Prakash (the farmer with the 5-ton listing)
    console.log('1️⃣ Login as Prakash...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      identifier: 'prakashfarmer',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');
    
    // Get marketplace listings to find the specific one
    console.log('2️⃣ Getting marketplace listings...');
    const listingsResponse = await axios.get(`${baseURL}/listings/marketplace`);
    
    if (listingsResponse.data.success) {
      const listings = listingsResponse.data.data || [];
      const prakashListings = listings.filter(l => 
        l.farmer_name === 'Prakash Joshi' && 
        l.quantity_in_tons === 5 &&
        l.crop_variety === '680232'
      );
      
      console.log(`📋 Found ${prakashListings.length} matching listings for Prakash Joshi (5 tons, 680232):`);
      prakashListings.forEach((listing, i) => {
        console.log(`  ${i+1}. "${listing.title}"`);
        console.log(`     ID: ${listing._id}`);
        console.log(`     Quantity: ${listing.quantity_in_tons} tons`);
        console.log(`     Price: ₹${listing.expected_price_per_ton}/ton`);
        console.log(`     Location: ${listing.location}`);
        console.log(`     Status: ${listing.status}`);
      });
      
      if (prakashListings.length > 0) {
        const targetListing = prakashListings[0];
        
        // Check for orders on this specific listing
        console.log('\\n3️⃣ Checking orders for this listing...');
        const ordersResponse = await axios.get(`${baseURL}/orders/received`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (ordersResponse.data.success) {
          const orders = ordersResponse.data.data || [];
          const listingOrders = orders.filter(o => o.listingId === targetListing._id);
          
          console.log(`📋 Found ${listingOrders.length} orders for this specific listing:`);
          listingOrders.forEach((order, i) => {
            console.log(`  ${i+1}. Order ID: ${order.orderId}`);
            console.log(`     Status: ${order.status}`);
            console.log(`     Buyer: ${order.buyerDetails?.name}`);
            console.log(`     Quantity: ${order.orderDetails?.quantityWanted} tons`);
            console.log(`     Price: ₹${order.orderDetails?.proposedPrice}/ton`);
            console.log(`     Total: ₹${order.orderDetails?.totalAmount?.toLocaleString()}`);
            if (order.status === 'accepted') {
              console.log(`     ✅ ACCEPTED on: ${new Date(order.updatedAt).toLocaleDateString()}`);
            }
          });
          
          // Check if there's an accepted order for the full quantity
          const acceptedOrders = listingOrders.filter(o => o.status === 'accepted');
          const totalAcceptedQuantity = acceptedOrders.reduce((sum, order) => 
            sum + (order.orderDetails?.quantityWanted || 0), 0
          );
          
          console.log('\\n🔍 Analysis:');
          console.log(`- Original listing quantity: ${targetListing.quantity_in_tons} tons`);
          console.log(`- Total accepted orders: ${totalAcceptedQuantity} tons`);
          console.log(`- Expected remaining quantity: ${targetListing.quantity_in_tons - totalAcceptedQuantity} tons`);
          
          if (totalAcceptedQuantity >= targetListing.quantity_in_tons) {
            console.log('\\n🚨 ISSUE DETECTED:');
            console.log('- Full quantity has been accepted but listing still exists!');
            console.log('- Listing should have been removed from both User.listings and CropListing collections');
            console.log('\\n🔧 SOLUTION APPLIED:');
            console.log('- Frontend now checks for listing existence after order acceptance');
            console.log('- If listing is removed (404), user is redirected to marketplace');
            console.log('- If listing still exists, quantity is updated in real-time');
          } else if (totalAcceptedQuantity > 0) {
            console.log('\\n✅ PARTIAL FULFILLMENT:');
            console.log('- Listing should show reduced quantity');
            console.log('- Frontend will refresh listing data after acceptance');
          }
        }
      }
    }
    
    console.log('\\n💡 TESTING INSTRUCTIONS:');
    console.log('1. Go to http://localhost:5174/farmer/marketplace');
    console.log('2. Login as prakashfarmer / 123456');
    console.log('3. Look for listings and check current quantities');
    console.log('4. Test order acceptance with the new enhanced frontend logic');
    
    if (prakashListings && prakashListings.length > 0) {
      console.log('5. Go to http://localhost:5174/farmer/listing/' + prakashListings[0]._id);
      console.log('6. Try accepting another order (if any pending)');
      console.log('7. Page should refresh and show updated quantity or redirect if depleted');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSpecificQuantityIssue();
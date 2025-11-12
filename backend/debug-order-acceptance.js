const axios = require('axios');

async function testOrderAcceptance() {
  try {
    console.log('🧪 Testing Order Acceptance and Quantity Updates...\n');

    const baseURL = 'http://localhost:5000/api';

    // Login as Ravi
    console.log('1️⃣ Login as Ravi...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      identifier: 'ravifarmer',
      password: '123456'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Get current listings before order acceptance
    console.log('2️⃣ Getting current listings...');
    const listingsResponse = await axios.get(`${baseURL}/listings/marketplace`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📦 Current Listings:');
    if (listingsResponse.data.success) {
      const allListings = listingsResponse.data.data || [];
      const raviListings = allListings.filter(listing => 
        listing.farmer_name === 'Ravi Patel' || 
        listing.farmerName === 'Ravi Patel' ||
        listing.farmer?.name === 'Ravi Patel'
      );
      
      raviListings.forEach((listing, i) => {
        console.log(`  ${i+1}. ${listing.title || listing.name}`);
        console.log(`     Quantity: ${listing.quantity_in_tons || listing.quantity} tons`);
        console.log(`     Price: ₹${listing.expected_price_per_ton || listing.pricePerTon}/ton\n`);
      });
    }

    // Get orders
    console.log('3️⃣ Getting pending orders...');
    const ordersResponse = await axios.get(`${baseURL}/orders/received`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (ordersResponse.data.success) {
      const orders = ordersResponse.data.data || [];
      const pendingOrders = orders.filter(order => order.status === 'pending');
      
      console.log(`📋 Found ${pendingOrders.length} pending orders`);
      
      if (pendingOrders.length > 0) {
        const orderToAccept = pendingOrders[0]; // Take first pending order
        console.log(`\n4️⃣ Accepting order: ${orderToAccept.orderId}`);
        console.log(`   Buyer: ${orderToAccept.buyerDetails?.name}`);
        console.log(`   Quantity: ${orderToAccept.orderDetails?.quantityWanted} tons`);
        console.log(`   Listing ID: ${orderToAccept.listingId}`);
        
        // Accept the order
        const acceptResponse = await axios.put(
          `${baseURL}/orders/${orderToAccept.orderId}/status`,
          { status: 'accepted' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('\n✅ Order acceptance response:');
        console.log(JSON.stringify(acceptResponse.data, null, 2));
        
        // Get listings again to check if they were updated
        console.log('\n5️⃣ Checking listings after order acceptance...');
        const updatedListingsResponse = await axios.get(`${baseURL}/listings/marketplace`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (updatedListingsResponse.data.success) {
          const allUpdatedListings = updatedListingsResponse.data.data || [];
          const updatedRaviListings = allUpdatedListings.filter(listing => 
            listing.farmer_name === 'Ravi Patel' || 
            listing.farmerName === 'Ravi Patel' ||
            listing.farmer?.name === 'Ravi Patel'
          );
          
          console.log('📦 Updated Listings:');
          updatedRaviListings.forEach((listing, i) => {
            console.log(`  ${i+1}. ${listing.title || listing.name}`);
            console.log(`     Quantity: ${listing.quantity_in_tons || listing.quantity} tons`);
            console.log(`     Price: ₹${listing.expected_price_per_ton || listing.pricePerTon}/ton\n`);
          });
          
          // Compare before and after
          console.log('🔍 Analysis:');
          console.log(`- Listings before: ${raviListings.length}`);
          console.log(`- Listings after: ${updatedRaviListings.length}`);
          
          if (updatedRaviListings.length < raviListings.length) {
            console.log('✅ Listing was removed (quantity = 0)');
          } else {
            // Check for quantity changes
            const beforeListing = raviListings.find(l => l._id === orderToAccept.listingId);
            const afterListing = updatedRaviListings.find(l => l._id === orderToAccept.listingId);
            
            if (beforeListing && afterListing) {
              const beforeQty = beforeListing.quantity_in_tons || beforeListing.quantity;
              const afterQty = afterListing.quantity_in_tons || afterListing.quantity;
              
              if (beforeQty !== afterQty) {
                console.log(`✅ Quantity updated: ${beforeQty} → ${afterQty} tons`);
              } else {
                console.log(`❌ Quantity NOT updated: still ${afterQty} tons`);
              }
            }
          }
        }
      } else {
        console.log('❌ No pending orders found to test with');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOrderAcceptance();
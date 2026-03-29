const axios = require('axios');

axios.get('http://localhost:5000/api/listings/marketplace')
  .then(response => {
    console.log('✅ Marketplace API Response:');
    console.log('Status:', response.data.success);
    console.log('Total listings:', response.data.meta.valid_returned);
    
    response.data.data.forEach((listing, i) => {
      console.log(`${i+1}. ${listing.title} - ${listing.quantity_available.value} ${listing.quantity_available.unit}`);
      console.log(`   Farmer: ${listing.farmer_id.name} (${listing.farmer_id.email})`);
      console.log(`   Price: ₹${listing.price_details.price_per_unit}/${listing.quantity_available.unit}`);
    });
  })
  .catch(error => console.error('API Error:', error.message));
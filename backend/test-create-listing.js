const axios = require('axios');
const FormData = require('form-data');

// Create a test listing via API to simulate frontend form submission
async function testCreateListing() {
  try {
    // First, let's get a valid farmer token by logging in
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'ravifarmer',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token obtained');
    
    // Create FormData like the frontend does
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', 'Test Frontend Sugarcane');
    formData.append('sugarcane_variety', 'Co 86032');
    
    // Add quality & seed information
    formData.append('seed_quality', JSON.stringify({
      disease_free_status: 'Tested Healthy',
      certification_details: 'Test certification'
    }));
    formData.append('crop_age', '10');
    formData.append('germination_percentage', '95');
    formData.append('seed_type', '3-Bud Setts');
    
    // Add quantity & pricing with Gunthas
    formData.append('quantity_available', JSON.stringify({
      value: 25,
      unit: 'gunthas'
    }));
    formData.append('price_details', JSON.stringify({
      price_per_unit: 3000,
      price_negotiable: true,
      minimum_order_quantity: 5
    }));
    
    // Add delivery information
    formData.append('delivery_location', 'Test Location, Maharashtra');
    formData.append('delivery_timeframe', JSON.stringify({
      available_from: '2026-03-05',
      available_until: '2026-12-15',
      preferred_delivery_time: 'Morning'
    }));
    
    // Add description
    formData.append('description', 'Test listing created via API');
    
    // Add legacy fields for backward compatibility
    formData.append('crop_variety', 'Co 86032');
    formData.append('quantity_in_tons', '25');
    formData.append('expected_price_per_ton', '3000');
    formData.append('harvest_availability_date', '2026-03-05');
    formData.append('location', 'Test Location, Maharashtra');

    // Make POST request to create new listing
    const response = await axios.post('http://localhost:5000/api/listings/create', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Listing created successfully!');
    console.log('🆔 Listing ID:', response.data.data._id);
    console.log('📋 Title:', response.data.data.title);
    console.log('📏 Quantity:', response.data.data.quantity_available?.value, response.data.data.quantity_available?.unit);
    console.log('💰 Price:', response.data.data.price_details?.price_per_unit, 'per', response.data.data.quantity_available?.unit);
    
  } catch (error) {
    console.error('❌ Error creating listing:', error.response?.data || error.message);
  }
}

testCreateListing();
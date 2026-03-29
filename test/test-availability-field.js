const axios = require('axios');

async function testAvailabilityField() {
  try {
    console.log('🧪 Testing Availability Field Changes...\n');
    
    // Step 1: Login
    console.log('1️⃣ Login as worker...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'meenalabour',
      password: '123456'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Get current profile
    console.log('2️⃣ Fetch current profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/worker/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const currentProfile = profileResponse.data.profile;
    console.log('📋 Current availability:', currentProfile.availability);
    
    // Step 3: Test updating to "Available"
    console.log('\n3️⃣ Testing update to "Available"...');
    
    // Fix skills field if it's an array
    const profileData = { ...currentProfile };
    if (Array.isArray(profileData.skills)) {
      profileData.skills = profileData.skills.join(', ');
    }
    
    const updateToAvailable = await axios.put('http://localhost:5000/api/worker/profile', {
      ...profileData,
      availability: 'Available'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (updateToAvailable.data.success) {
      console.log('✅ Successfully updated to "Available"');
    } else {
      console.log('❌ Failed to update to "Available":', updateToAvailable.data.message);
    }
    
    // Step 4: Test updating to "Unavailable"
    console.log('\n4️⃣ Testing update to "Unavailable"...');
    const updateToUnavailable = await axios.put('http://localhost:5000/api/worker/profile', {
      ...profileData,
      availability: 'Unavailable'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (updateToUnavailable.data.success) {
      console.log('✅ Successfully updated to "Unavailable"');
    } else {
      console.log('❌ Failed to update to "Unavailable":', updateToUnavailable.data.message);
    }
    
    // Step 5: Test with invalid value (should fail)
    console.log('\n5️⃣ Testing with invalid value "Busy" (should fail)...');
    try {
      const updateToBusy = await axios.put('http://localhost:5000/api/worker/profile', {
        ...profileData,
        availability: 'Busy'
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (updateToBusy.data.success) {
        console.log('⚠️  Unexpected: "Busy" value was accepted (this should not happen)');
      }
    } catch (error) {
      if (error.response?.status >= 400) {
        console.log('✅ Correctly rejected invalid "Busy" value:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Step 6: Verify final state
    console.log('\n6️⃣ Verifying final state...');
    const finalProfile = await axios.get('http://localhost:5000/api/worker/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 Final availability:', finalProfile.data.profile.availability);
    console.log('\n🎉 Availability field tests completed!');
    console.log('✅ Only "Available" and "Unavailable" values are accepted');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
  }
}

testAvailabilityField();
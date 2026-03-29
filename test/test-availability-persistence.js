const axios = require('axios');

async function testAvailabilityPersistence() {
  try {
    console.log('🧪 Testing Availability Field Persistence...\n');
    
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
    console.log('📋 Current profile availability field:', currentProfile.availability);
    console.log('📋 Current profile availabilityStatus field:', currentProfile.availabilityStatus);
    
    // Fix skills if it's an array
    if (Array.isArray(currentProfile.skills)) {
      currentProfile.skills = currentProfile.skills.join(', ');
    }
    
    // Step 3: Update to "Unavailable"
    console.log('\n3️⃣ Updating availability to "Unavailable"...');
    const updateResponse = await axios.put('http://localhost:5000/api/worker/profile', {
      ...currentProfile,
      availability: 'Unavailable'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Update response:', updateResponse.data.message);
    
    // Step 4: Fetch again to verify persistence (simulating page refresh)
    console.log('\n4️⃣ Fetching profile again (simulating page refresh)...');
    const refreshResponse = await axios.get('http://localhost:5000/api/worker/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const refreshedProfile = refreshResponse.data.profile;
    console.log('📋 After refresh - availability field:', refreshedProfile.availability);
    console.log('📋 After refresh - availabilityStatus field:', refreshedProfile.availabilityStatus);
    
    if (refreshedProfile.availability === 'Unavailable') {
      console.log('\n✅ SUCCESS: Availability correctly persisted as "Unavailable"');
    } else {
      console.log('\n❌ FAILED: Availability changed to:', refreshedProfile.availability);
      console.log('Expected: "Unavailable"');
    }
    
    // Step 5: Update to "Available"
    console.log('\n5️⃣ Updating availability to "Available"...');
    if (Array.isArray(refreshedProfile.skills)) {
      refreshedProfile.skills = refreshedProfile.skills.join(', ');
    }
    
    const updateToAvailable = await axios.put('http://localhost:5000/api/worker/profile', {
      ...refreshedProfile,
      availability: 'Available'
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Update response:', updateToAvailable.data.message);
    
    // Step 6: Fetch again to verify
    console.log('\n6️⃣ Fetching profile again...');
    const finalResponse = await axios.get('http://localhost:5000/api/worker/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const finalProfile = finalResponse.data.profile;
    console.log('📋 After second refresh - availability field:', finalProfile.availability);
    
    if (finalProfile.availability === 'Available') {
      console.log('\n✅ SUCCESS: Availability correctly persisted as "Available"');
    } else {
      console.log('\n❌ FAILED: Availability is:', finalProfile.availability);
    }
    
    console.log('\n🎉 Availability persistence test completed!');
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    }
  }
}

testAvailabilityPersistence();
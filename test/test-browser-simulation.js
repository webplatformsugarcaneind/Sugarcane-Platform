const axios = require('axios');

async function testWorkerProfileUpdateBrowserSimulation() {
  try {
    console.log('🧪 Testing Worker Profile Update - Browser Simulation...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in as Meena Kumari (Worker)...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'meenalabour',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Get current profile (like browser does)
    console.log('2️⃣ Fetching current profile...');
    const profileResponse = await axios.get('http://localhost:5000/api/worker/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!profileResponse.data.success) {
      console.log('❌ Profile fetch failed:', profileResponse.data.message);
      return;
    }
    
    const currentProfile = profileResponse.data.profile;
    console.log('✅ Profile fetched successfully');
    console.log('📋 Current profile data:', {
      name: currentProfile.name,
      skills: currentProfile.skills,
      skillsType: typeof currentProfile.skills,
      isArray: Array.isArray(currentProfile.skills)
    });
    console.log('');
    
    // Step 3: Simulate form input and submission (exactly like the frontend)
    console.log('3️⃣ Simulating form submission...');
    
    // This is what the frontend ProfilePage.jsx sends
    const formData = {
      name: currentProfile.name || 'Meena Kumari',
      email: currentProfile.email || 'meena.kumari@example.com', 
      phone: currentProfile.phone || '9876543215',
      skills: 'Manual harvesting, Sugar cane cutting, Field preparation, Equipment operation', // User types this
      workExperience: '5 years in agricultural work',
      wageRate: '₹350 per day',
      availability: 'Available',
      workPreferences: 'Full-time, Day shifts, Seasonal work'
    };
    
    console.log('📤 Sending form data:', {
      skills: formData.skills,
      skillsType: typeof formData.skills,
      isArray: Array.isArray(formData.skills)
    });
    
    // Step 4: Update profile (simulate the PUT request from frontend)
    const updateResponse = await axios.put('http://localhost:5000/api/worker/profile', formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (updateResponse.data.success) {
      console.log('✅ Profile updated successfully!');
      console.log('📄 Response:', {
        success: updateResponse.data.success,
        message: updateResponse.data.message
      });
      console.log('\n🎉 Test PASSED - Worker profile update works correctly!');
    } else {
      console.log('❌ Profile update failed:', updateResponse.data.message);
    }
    
  } catch (error) {
    console.log('\n❌ TEST FAILED - Profile update error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
    console.log('Full error response:', error.response?.data);
    
    if (error.response?.status === 500) {
      console.log('\n🚨 This is the "Error updating worker profile" issue!');
    }
  }
}

testWorkerProfileUpdateBrowserSimulation();
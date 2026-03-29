const axios = require('axios');

async function testWorkerProfileUpdate() {
  try {
    console.log('🧪 Testing Worker Profile Update Flow...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in as Meena Kumari...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'meenalabour',
      password: '123456'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received\n');
    
    // Step 2: Get current profile
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
    console.log('📋 Current skills:', JSON.stringify(currentProfile.skills), '(type:', typeof currentProfile.skills, ')\n');
    
    // Step 3: Update profile (simulate frontend form submission)
    console.log('3️⃣ Updating profile...');
    const updateData = {
      name: currentProfile.name,
      email: currentProfile.email,
      phone: currentProfile.phone,
      skills: 'Harvesting, Sorting, Packaging, Quality inspection', // As string like frontend form
      workExperience: '4 years in farm operations',
      wageRate: '₹300 per day',
      availability: 'Available',
      workPreferences: 'Part-time, Flexible hours, Seasonal work'
    };
    
    console.log('📤 Sending update with skills as:', JSON.stringify(updateData.skills), '(type:', typeof updateData.skills, ')');
    
    const updateResponse = await axios.put('http://localhost:5000/api/worker/profile', updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!updateResponse.data.success) {
      console.log('❌ Update failed:', updateResponse.data.message);
      return;
    }
    
    console.log('✅ Profile updated successfully!');
    console.log('🎉 Test completed successfully!\n');
    
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Error details:', error.response?.data?.error);
  }
}

testWorkerProfileUpdate();
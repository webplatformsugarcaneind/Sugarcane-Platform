const axios = require('axios');

async function testEnhancedFactoryProfile() {
  try {
    console.log('🔐 Testing Enhanced Factory profile access...');
    
    // Login with Priya Singh (factory user with comprehensive data)
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'priyafactory',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, testing enhanced profile...');

    // Get profile with comprehensive factory data
    const profileResponse = await axios.get('http://localhost:5000/api/factory/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Enhanced Factory profile endpoint working!');
    const profile = profileResponse.data.profile;
    
    console.log('📋 Comprehensive Factory Data:');
    console.log('Factory Name:', profile.factoryName);
    console.log('Location:', profile.factoryLocation);
    console.log('Capacity:', profile.capacity);
    console.log('Description:', profile.factoryDescription);
    console.log('Experience:', profile.experience);
    console.log('Specialization:', profile.specialization);
    
    if (profile.contactInfo) {
      console.log('📞 Contact Information:');
      console.log('Website:', profile.contactInfo.website);
      console.log('Fax:', profile.contactInfo.fax);
      console.log('Toll-free:', profile.contactInfo.tollfree);
      console.log('Landline:', profile.contactInfo.landline);
    }
    
    if (profile.operatingHours) {
      console.log('🕒 Operating Hours:');
      console.log('Season:', profile.operatingHours.season);
      console.log('Daily:', profile.operatingHours.daily);
      console.log('Monday:', profile.operatingHours.monday);
      console.log('Tuesday:', profile.operatingHours.tuesday);
      console.log('Shift 1:', profile.operatingHours.shift1);
      console.log('Shift 2:', profile.operatingHours.shift2);
      console.log('Maintenance:', profile.operatingHours.maintenance);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testEnhancedFactoryProfile();
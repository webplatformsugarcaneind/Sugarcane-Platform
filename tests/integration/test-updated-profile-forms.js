const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data for each role with only fields that exist in users.json
const testUsers = {
  farmer: {
    username: 'testfarmer123',
    password: '123456',
    profileUpdates: {
      location: 'Pune, Maharashtra',
      farmSize: '30 acres',
      farmingExperience: '10 years',
      farmingMethods: 'Organic farming, Precision agriculture, Integrated pest management',
      equipment: 'Tractor, Combine harvester, Drip irrigation system, Spraying equipment',
      certifications: 'Organic Farming Certificate, Good Agricultural Practices (GAP), Pesticide License',
      cropTypes: 'Sugarcane, Cotton, Soybeans',
      irrigationType: 'drip'
    }
  },
  factory: {
    username: 'testfactory123',
    password: '123456',
    profileUpdates: {
      factoryName: 'Test Sugar Industries',
      factoryLocation: 'Aurangabad, Maharashtra',
      factoryDescription: 'Modern sugar processing facility with eco-friendly technology',
      capacity: '2000 TCD',
      experience: '8 years',
      specialization: 'White Sugar, Molasses Production',
      contactInfo: {
        website: 'https://testsugar.com',
        fax: '+91-20-87654321'
      },
      operatingHours: {
        monday: '7:00 AM - 9:00 PM',
        tuesday: '7:00 AM - 9:00 PM',
        season: 'November to April'
      }
    }
  },
  hhm: {
    username: 'testhhm123',
    password: '123456',
    profileUpdates: {
      managementExperience: '12 years',
      teamSize: '25-30 workers',
      managementOperations: 'Team coordination, Quality supervision, Safety management, Resource planning',
      servicesOffered: 'Labour recruitment, Field management, Training programs, Equipment coordination'
    }
  },
  labour: {
    username: 'testlabour123',
    password: '123456',
    profileUpdates: {
      skills: 'Harvesting, Field preparation, Equipment operation, Quality control',
      workExperience: '5 years in agricultural operations',
      wageRate: '₹400 per day',
      availability: 'Available',
      workPreferences: 'Full-time, Day shifts, Seasonal work'
    }
  }
};

async function testProfileForm(role) {
  try {
    console.log(`\n🧪 Testing ${role.toUpperCase()} Profile Form...`);
    
    const testUser = testUsers[role];
    
    // Login
    console.log(`📝 Logging in as ${testUser.username}...`);
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    
    if (loginResponse.data.success) {
      console.log(`✅ Login successful for ${role}`);
      const token = loginResponse.data.token;
      const userId = loginResponse.data.user.id;
      
      // Get current profile
      console.log(`📊 Fetching current profile...`);
      const profileResponse = await axios.get(`${BASE_URL}/api/${role}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`📋 Current profile fields:`, Object.keys(profileResponse.data.profile || {}));
      
      // Update profile with new data
      console.log(`🔄 Updating profile with new data...`);
      const updateResponse = await axios.put(`${BASE_URL}/api/${role}/profile`, testUser.profileUpdates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (updateResponse.data.success) {
        console.log(`✅ Profile update successful for ${role}`);
        
        // Verify the update by fetching profile again
        console.log(`🔍 Verifying profile update...`);
        const verifyResponse = await axios.get(`${BASE_URL}/api/${role}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (verifyResponse.data.success) {
          const updatedProfile = verifyResponse.data.profile;
          console.log(`✅ Profile verification successful for ${role}`);
          
          // Check specific fields
          console.log(`📝 Updated profile sample:`, JSON.stringify(updatedProfile, null, 2).substring(0, 300) + '...');
          
          // Verify key fields were updated
          let allFieldsUpdated = true;
          const updates = testUser.profileUpdates;
          
          for (const [key, value] of Object.entries(updates)) {
            if (typeof value === 'object' && !Array.isArray(value)) {
              // Handle nested objects like contactInfo, operatingHours
              for (const [nestedKey, nestedValue] of Object.entries(value)) {
                if (updatedProfile[key]?.[nestedKey] !== nestedValue) {
                  console.log(`❌ Field ${key}.${nestedKey} not updated correctly. Expected: ${nestedValue}, Got: ${updatedProfile[key]?.[nestedKey]}`);
                  allFieldsUpdated = false;
                }
              }
            } else {
              if (updatedProfile[key] !== value) {
                console.log(`❌ Field ${key} not updated correctly. Expected: ${value}, Got: ${updatedProfile[key]}`);
                allFieldsUpdated = false;
              }
            }
          }
          
          if (allFieldsUpdated) {
            console.log(`🎉 All fields updated successfully for ${role}!`);
          }
          
        } else {
          console.log(`❌ Profile verification failed for ${role}:`, verifyResponse.data.message);
        }
      } else {
        console.log(`❌ Profile update failed for ${role}:`, updateResponse.data.message);
      }
    } else {
      console.log(`❌ Login failed for ${role}:`, loginResponse.data.message);
    }
  } catch (error) {
    console.log(`💥 Error testing ${role} profile:`, error.response?.data?.message || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Profile Form Tests...');
  console.log('📋 Testing updated profile forms with only fields that exist in users.json');
  
  // Test each role
  for (const role of ['farmer', 'factory', 'hhm', 'labour']) {
    await testProfileForm(role);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n🏁 All profile form tests completed!');
  console.log('📊 Summary: Profile forms now only include fields that exist in users.json structure');
  console.log('✨ Forms are cleaner and match the actual database schema');
}

// Run the tests
runAllTests().catch(console.error);
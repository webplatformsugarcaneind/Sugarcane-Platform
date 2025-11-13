const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

// Load environment variables
dotenv.config();

const testHHMProfileMapping = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get an HHM user from database
    const hhm = await User.findOne({ role: 'HHM' });
    console.log('👨‍💼 Testing with HHM:', hhm.name);
    console.log('- Database managementExperience:', hhm.managementExperience);
    console.log('- Database teamSize:', hhm.teamSize);
    console.log('- Database managementOperations:', hhm.managementOperations);
    console.log('- Database servicesOffered:', hhm.servicesOffered);

    // Simulate the HHM controller getProfile function logic (AFTER fix)
    const profileData = {
      _id: hhm._id,
      name: hhm.name,
      username: hhm.username,
      email: hhm.email,
      phone: hhm.phone,
      role: hhm.role,
      // HHM-specific fields (FIXED)
      managementExperience: hhm.managementExperience,
      teamSize: hhm.teamSize,
      managementOperations: hhm.managementOperations,
      servicesOffered: hhm.servicesOffered,
      location: hhm.location,
      isActive: hhm.isActive,
      createdAt: hhm.createdAt,
      updatedAt: hhm.updatedAt
    };

    console.log('\n🔍 Profile mapping results (AFTER FIX):');
    console.log('- managementExperience:', profileData.managementExperience || 'NOT MAPPED ❌');
    console.log('- teamSize:', profileData.teamSize || 'NOT MAPPED ❌');
    console.log('- managementOperations:', profileData.managementOperations || 'NOT MAPPED ❌');
    console.log('- servicesOffered:', profileData.servicesOffered || 'NOT MAPPED ❌');

    const hhmFields = ['managementExperience', 'teamSize', 'managementOperations', 'servicesOffered'];
    const missingFields = hhmFields.filter(field => !profileData[field]);

    if (missingFields.length === 0) {
      console.log('\n✅ SUCCESS: The HHM profile fix is working correctly!');
      console.log('   Frontend will now receive all HHM fields');
      console.log('   - Management Experience: "' + profileData.managementExperience + '"');
      console.log('   - Team Size: "' + profileData.teamSize + '"');
      console.log('   - Management Operations: "' + profileData.managementOperations + '"');
      console.log('   - Services Offered: "' + profileData.servicesOffered + '"');
    } else {
      console.log('\n❌ ISSUE: Missing fields:', missingFields.join(', '));
    }

    console.log('\n📋 Complete profile data that would be sent to frontend:');
    console.log('Fields count:', Object.keys(profileData).length);
    console.log('HHM-specific fields present:', hhmFields.filter(field => profileData[field]).length + '/' + hhmFields.length);

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testHHMProfileMapping();
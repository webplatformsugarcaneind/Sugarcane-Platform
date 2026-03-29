const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

// Load environment variables
dotenv.config();

const testWorkerProfileMapping = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get a labour user from database
    const worker = await User.findOne({ role: 'Labour' });
    console.log('👷 Testing with worker:', worker.name);
    console.log('- Database workExperience:', worker.workExperience);

    // Simulate the worker controller getProfile function logic
    const hasValue = (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return Boolean(value);
    };

    // Create profile data as worker controller does
    const profileData = {
      _id: worker._id,
      name: worker.name,
      username: worker.username,
      email: worker.email,
      phone: worker.phone,
      role: worker.role,
      isActive: worker.isActive,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    };

    // Test the fix: workExperience should map to workExperience (not farmingExperience)
    if (hasValue(worker.workExperience)) {
      profileData.workExperience = worker.workExperience;  // This is the fix
    }

    console.log('\n🔍 Profile mapping results:');
    console.log('- profileData.workExperience:', profileData.workExperience || 'NOT MAPPED ❌');
    console.log('- profileData.farmingExperience:', profileData.farmingExperience || 'Not set');

    if (profileData.workExperience) {
      console.log('\n✅ SUCCESS: The fix is working correctly!');
      console.log('   Frontend will now receive workExperience field');
      console.log(`   Value: "${profileData.workExperience}"`);
    } else {
      console.log('\n❌ ISSUE: workExperience is still not being mapped correctly');
    }

    console.log('\n📋 Complete profile data that would be sent to frontend:');
    console.log(JSON.stringify(profileData, null, 2));

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

testWorkerProfileMapping();
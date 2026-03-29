require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/user.model');

const checkWorkers = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('\n🔍 Checking for workers in database...\n');

    // Find all users with role 'Labour'
    const workers = await User.find({ role: 'Labour' })
      .select('_id name username email phone skills workPreferences wageRate availability workExperience location');

    console.log(`✅ Found ${workers.length} workers with role 'Labour'\n`);

    if (workers.length > 0) {
      workers.forEach((worker, index) => {
        console.log(`${index + 1}. ${worker.name} (@${worker.username})`);
        console.log(`   ID: ${worker._id}`);
        console.log(`   Email: ${worker.email}`);
        console.log(`   Phone: ${worker.phone || 'Not set'}`);
        console.log(`   Skills: ${worker.skills || 'Not set'}`);
        console.log(`   Availability: ${worker.availability || 'Not set'}`);
        console.log(`   Location: ${worker.location || 'Not set'}`);
        console.log('');
      });
    } else {
      console.log('❌ No workers found in database!');
      console.log('💡 You may need to create some worker accounts.');
    }

    // Also check total users by role
    console.log('\n📊 User count by role:');
    const roles = ['Farmer', 'Factory', 'HHM', 'Labour'];
    for (const role of roles) {
      const count = await User.countDocuments({ role });
      console.log(`   ${role}: ${count}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkWorkers();

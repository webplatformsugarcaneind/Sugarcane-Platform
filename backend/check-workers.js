require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');

const checkWorkers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Labour users
    const labourUsers = await User.find({ role: 'Labour' }).select('_id name email role');
    console.log('👥 Total Labour users:', labourUsers.length);
    
    if (labourUsers.length > 0) {
      console.log('\n📋 Labour Users:');
      labourUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
      });

      // Check profiles for these users
      const workerIds = labourUsers.map(user => user._id);
      const profiles = await Profile.find({ userId: { $in: workerIds } });
      
      console.log('\n👤 Total Profiles for Labour users:', profiles.length);
      
      if (profiles.length > 0) {
        console.log('\n📋 Worker Profiles:');
        for (const profile of profiles) {
          const user = await User.findById(profile.userId);
          console.log(`\n   Profile for: ${user?.name}`);
          console.log(`   - Profile ID: ${profile._id}`);
          console.log(`   - Availability: ${profile.availabilityStatus || 'NOT SET'}`);
          console.log(`   - Skills: ${profile.skills?.join(', ') || 'None'}`);
          console.log(`   - Location: ${profile.farmLocation || 'Not specified'}`);
          console.log(`   - Experience: ${profile.farmingExperience || 0} years`);
        }

        // Check available workers specifically
        const availableProfiles = await Profile.find({ 
          userId: { $in: workerIds },
          availabilityStatus: 'available'
        });
        console.log(`\n✅ Workers with "available" status: ${availableProfiles.length}`);
      } else {
        console.log('\n⚠️  No profiles found for Labour users!');
        console.log('   Workers need to have profiles created.');
      }
    } else {
      console.log('\n⚠️  No Labour users found in database!');
    }

    // Check all profile availability statuses
    console.log('\n\n📊 Profile Availability Status Breakdown:');
    const allProfiles = await Profile.find({ userId: { $in: labourUsers.map(u => u._id) } });
    const statusCounts = {};
    allProfiles.forEach(profile => {
      const status = profile.availabilityStatus || 'undefined';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    Object.keys(statusCounts).forEach(status => {
      console.log(`   - ${status}: ${statusCounts[status]}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkWorkers();

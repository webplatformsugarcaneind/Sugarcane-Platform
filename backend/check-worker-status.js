require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');

const checkWorkerStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📊 CURRENT WORKER EMPLOYMENT STATUS:\n');
    
    // Get HHM users
    const hhms = await User.find({ role: 'HHM' }).select('name email');
    console.log('👔 HHM Users:');
    hhms.forEach((hhm, i) => {
      console.log(`   ${i + 1}. ${hhm.name} (${hhm.email}) - ID: ${hhm._id}`);
    });
    
    // Get worker profiles with employment info
    console.log('\n👷 Worker Employment Status:');
    const workers = await User.find({ role: 'Labour' }).select('name email');
    
    for (let worker of workers) {
      const profile = await Profile.findOne({ userId: worker._id }).populate('currentEmployer', 'name email');
      console.log(`\n   🔹 ${worker.name} (${worker.email})`);
      console.log(`      - Profile exists: ${profile ? 'YES' : 'NO'}`);
      if (profile) {
        console.log(`      - Availability: ${profile.availabilityStatus}`);
        console.log(`      - Current Employer: ${profile.currentEmployer ? profile.currentEmployer.name : 'None'}`);
        console.log(`      - Employment Start: ${profile.employmentStartDate || 'N/A'}`);
        console.log(`      - Is Employed: ${profile.currentEmployer ? 'YES' : 'NO'}`);
      }
    }

    // Test what Sunita HHM would see
    console.log('\n🔍 TESTING VISIBILITY:');
    const sunil = hhms.find(h => h.name === 'Sunil Kumar');
    const sunita = hhms.find(h => h.name === 'Sunita Sharma');

    if (sunil && sunita) {
      console.log(`\n🧪 What Sunita Sharma (${sunita._id}) can see:`);
      
      // Get worker IDs
      const workerIds = workers.map(w => w._id);
      
      // Query that mimics the backend logic
      const sunitaQuery = {
        userId: { $in: workerIds },
        $or: [
          { currentEmployer: null },
          { currentEmployer: sunita._id }
        ]
      };

      const sunitaVisibleWorkers = await Profile.find(sunitaQuery).populate('userId', 'name');
      console.log(`   - Can see ${sunitaVisibleWorkers.length} workers:`);
      sunitaVisibleWorkers.forEach(p => {
        console.log(`     • ${p.userId.name} (currentEmployer: ${p.currentEmployer || 'None'})`);
      });

      console.log(`\n🧪 What Sunil Kumar (${sunil._id}) can see:`);
      const sunilQuery = {
        userId: { $in: workerIds },
        $or: [
          { currentEmployer: null },
          { currentEmployer: sunil._id }
        ]
      };

      const sunilVisibleWorkers = await Profile.find(sunilQuery).populate('userId', 'name');
      console.log(`   - Can see ${sunilVisibleWorkers.length} workers:`);
      sunilVisibleWorkers.forEach(p => {
        console.log(`     • ${p.userId.name} (currentEmployer: ${p.currentEmployer || 'None'})`);
      });
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
};

checkWorkerStatus();
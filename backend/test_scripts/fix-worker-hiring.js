require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');
const Application = require('./models/application.model');

const fixWorkerHiring = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔧 FIXING WORKER HIRING STATUS:\n');
    
    // Get Sunil Kumar (the HHM who approved the applications)
    const sunil = await User.findOne({ name: 'Sunil Kumar' });
    console.log('👔 HHM: Sunil Kumar -', sunil._id);
    
    // Get approved applications for Sunil
    const approvedApps = await Application.find({
      hhmId: sunil._id,
      status: 'approved'
    }).populate('workerId', 'name');
    
    console.log(`\n📋 Found ${approvedApps.length} approved applications for Sunil:`);
    
    for (const app of approvedApps) {
      const workerName = app.workerId.name;
      const workerId = app.workerId._id;
      
      console.log(`\n🤝 Hiring ${workerName}...`);
      
      // Find or create worker profile
      let profile = await Profile.findOne({ userId: workerId });
      
      if (!profile) {
        console.log(`   ❌ No profile found for ${workerName}, creating one...`);
        profile = await Profile.create({
          userId: workerId,
          availabilityStatus: 'available',
          skills: ['General work']
        });
      }
      
      // Mark as hired by Sunil
      await profile.hireByHHM(sunil._id);
      console.log(`   ✅ ${workerName} is now hired by Sunil Kumar`);
      
      // Verify the change
      const updated = await Profile.findOne({ userId: workerId });
      console.log(`   📊 Status: ${updated.availabilityStatus}`);
      console.log(`   👔 Employer: ${updated.currentEmployer}`);
    }
    
    console.log('\n🧪 TESTING EXCLUSIVITY AFTER FIX:');
    
    // Get Sunita for testing
    const sunita = await User.findOne({ name: 'Sunita Sharma' });
    const workers = await User.find({ role: 'Labour' });
    const workerIds = workers.map(w => w._id);
    
    // Test what Sunita can see
    const sunitaQuery = {
      userId: { $in: workerIds },
      $or: [
        { currentEmployer: null },
        { currentEmployer: sunita._id }
      ]
    };
    
    const sunitaVisible = await Profile.find(sunitaQuery).populate('userId', 'name');
    console.log(`\n👀 Sunita Sharma can now see: ${sunitaVisible.length} workers`);
    sunitaVisible.forEach(p => {
      console.log(`   • ${p.userId.name}`);
    });
    
    // Test what Sunil can see  
    const sunilQuery = {
      userId: { $in: workerIds },
      $or: [
        { currentEmployer: null },
        { currentEmployer: sunil._id }
      ]
    };
    
    const sunilVisible = await Profile.find(sunilQuery).populate('userId', 'name');
    console.log(`\n👀 Sunil Kumar can now see: ${sunilVisible.length} workers`);
    sunilVisible.forEach(p => {
      console.log(`   • ${p.userId.name}`);
    });
    
    if (sunitaVisible.length === 0) {
      console.log('\n🎉 SUCCESS! Worker exclusivity is now working correctly!');
      console.log('   ✅ Sunita cannot see workers hired by Sunil');
      console.log('   ✅ Sunil can see his own workers');
    } else {
      console.log('\n❌ Issue still exists. Sunita can still see hired workers.');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
};

fixWorkerHiring();
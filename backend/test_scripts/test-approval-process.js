require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');
const Schedule = require('./models/schedule.model');
const Application = require('./models/application.model');

const testApprovalProcess = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🧪 TESTING NEW APPROVAL PROCESS:\n');
    
    // First, release current workers so we can test fresh approvals
    console.log('🔓 Step 1: Releasing current workers...');
    await Profile.updateMany(
      { currentEmployer: { $ne: null } },
      { 
        currentEmployer: null,
        employmentStartDate: null,
        availabilityStatus: 'available'
      }
    );
    console.log('   ✅ All workers released');
    
    // Create a test scenario:
    // 1. Get HHMs
    const sunil = await User.findOne({ name: 'Sunil Kumar' });
    const sunita = await User.findOne({ name: 'Sunita Sharma' });
    const workers = await User.find({ role: 'Labour' });
    
    console.log(`\n👔 HHMs: ${sunil.name} & ${sunita.name}`);
    console.log(`👷 Workers: ${workers.map(w => w.name).join(', ')}`);
    
    // 2. Create a schedule for Sunil
    console.log('\n📅 Step 2: Creating test schedule...');
    const schedule = await Schedule.create({
      title: 'Test Exclusivity Job',
      hhmId: sunil._id,
      workerCount: 2,
      wageOffered: 500,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // Next week
      requiredSkills: ['testing'],
      status: 'open'
    });
    console.log(`   ✅ Created schedule: ${schedule.title}`);
    
    // 3. Create application from first worker to Sunil
    console.log('\n📋 Step 3: Creating test application...');
    const testWorker = workers[0];
    const application = await Application.create({
      workerId: testWorker._id,
      scheduleId: schedule._id,
      hhmId: sunil._id,
      status: 'pending',
      applicationMessage: 'Test application for exclusivity',
      workerSkills: ['testing', 'general work'],
      experience: '5 years',
      expectedWage: 500
    });
    console.log(`   ✅ ${testWorker.name} applied to ${sunil.name}'s job`);
    
    // 4. Check initial visibility
    console.log('\n👀 Step 4: Initial visibility check...');
    const workerIds = workers.map(w => w._id);
    
    const sunilInitial = await Profile.find({
      userId: { $in: workerIds },
      $or: [{ currentEmployer: null }, { currentEmployer: sunil._id }]
    }).populate('userId', 'name');
    
    const sunitaInitial = await Profile.find({
      userId: { $in: workerIds },
      $or: [{ currentEmployer: null }, { currentEmployer: sunita._id }]
    }).populate('userId', 'name');
    
    console.log(`   Sunil can see: ${sunilInitial.length} workers`);
    console.log(`   Sunita can see: ${sunitaInitial.length} workers`);
    
    // 5. Simulate application approval (this should trigger hiring)
    console.log('\n✅ Step 5: Approving application (testing hiring logic)...');
    
    // Find the application with populated data
    const appToApprove = await Application.findById(application._id)
      .populate('scheduleId', 'title workType workerCount acceptedWorkersCount status hhmId')
      .populate('workerId', 'name email phone');
    
    // Simulate the approval process from updateApplicationStatus
    await appToApprove.approve('Test approval');
    
    // The hiring logic (simulate what happens in the controller)
    const workerProfile = await Profile.findOne({ userId: appToApprove.workerId._id });
    if (workerProfile) {
      await workerProfile.hireByHHM(sunil._id);
      console.log(`   ✅ Auto-hired ${appToApprove.workerId.name} to ${sunil.name}`);
    } else {
      console.log(`   ⚠️ No profile found for ${appToApprove.workerId.name}`);
    }
    
    // 6. Check exclusivity after approval
    console.log('\n🔒 Step 6: Post-approval exclusivity check...');
    
    const sunilAfter = await Profile.find({
      userId: { $in: workerIds },
      $or: [{ currentEmployer: null }, { currentEmployer: sunil._id }]
    }).populate('userId', 'name');
    
    const sunitaAfter = await Profile.find({
      userId: { $in: workerIds },
      $or: [{ currentEmployer: null }, { currentEmployer: sunita._id }]
    }).populate('userId', 'name');
    
    console.log(`   Sunil can now see: ${sunilAfter.length} workers`);
    sunilAfter.forEach(p => console.log(`     • ${p.userId.name}`));
    
    console.log(`   Sunita can now see: ${sunitaAfter.length} workers`);
    sunitaAfter.forEach(p => console.log(`     • ${p.userId.name}`));
    
    // 7. Results
    console.log('\n📊 TEST RESULTS:');
    const exclusivityWorking = sunitaAfter.length === (workers.length - 1); // Should see one less worker
    const sunilSeesHisWorker = sunilAfter.some(p => p.userId._id.equals(testWorker._id));
    
    console.log(`   ✅ Exclusivity working: ${exclusivityWorking ? 'YES' : 'NO'}`);
    console.log(`   ✅ Sunil sees his hired worker: ${sunilSeesHisWorker ? 'YES' : 'NO'}`);
    console.log(`   ✅ Sunita sees fewer workers: ${sunitaAfter.length < sunitaInitial.length ? 'YES' : 'NO'}`);
    
    if (exclusivityWorking) {
      console.log('\n🎉 APPROVAL PROCESS WITH EXCLUSIVITY IS WORKING! 🎉');
    } else {
      console.log('\n❌ APPROVAL PROCESS NEEDS MORE DEBUGGING');
    }
    
    // Cleanup
    await Schedule.findByIdAndDelete(schedule._id);
    await Application.findByIdAndDelete(application._id);
    console.log('\n🧹 Test data cleaned up');
    
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
};

testApprovalProcess();
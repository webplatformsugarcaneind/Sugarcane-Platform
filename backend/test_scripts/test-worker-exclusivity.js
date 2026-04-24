require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');
const Application = require('./models/application.model');
const Schedule = require('./models/schedule.model');

const testWorkerExclusivity = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get HHM users
    const hhms = await User.find({ role: 'HHM' }).limit(2);
    console.log(`👔 Found ${hhms.length} HHM users:`);
    hhms.forEach((hhm, i) => {
      console.log(`   ${i + 1}. ${hhm.name} (${hhm.email})`);
    });

    if (hhms.length < 2) {
      console.log('❌ Need at least 2 HHM users to test exclusivity');
      process.exit(1);
    }

    const hhm1 = hhms[0];
    const hhm2 = hhms[1];

    // Get workers
    const workers = await User.find({ role: 'Labour' });
    console.log(`\n👷 Found ${workers.length} Labour users:`);
    workers.forEach((worker, i) => {
      console.log(`   ${i + 1}. ${worker.name} (${worker.email})`);
    });

    if (workers.length === 0) {
      console.log('❌ No workers found');
      process.exit(1);
    }

    const worker = workers[0];
    console.log(`\n🎯 Testing exclusivity with worker: ${worker.name}`);

    // Check worker's current profile
    let workerProfile = await Profile.findOne({ userId: worker._id });
    if (!workerProfile) {
      console.log('   📝 No profile found, creating one...');
      workerProfile = await Profile.create({
        userId: worker._id,
        availabilityStatus: 'available',
        skills: ['Testing', 'General work']
      });
    }

    console.log(`\n🔍 Initial worker status:`);
    console.log(`   - Available: ${workerProfile.availabilityStatus}`);
    console.log(`   - Current Employer: ${workerProfile.currentEmployer || 'None'}`);
    console.log(`   - Is Employed: ${workerProfile.isEmployed}`);

    // Step 1: Check that both HHMs can see the worker initially
    console.log(`\n📋 Step 1: Checking initial visibility...`);
    
    const initialQuery1 = {
      userId: { $in: [worker._id] },
      $or: [
        { currentEmployer: null },
        { currentEmployer: hhm1._id }
      ]
    };
    
    const initialQuery2 = {
      userId: { $in: [worker._id] },
      $or: [
        { currentEmployer: null },
        { currentEmployer: hhm2._id }
      ]
    };

    const visibleToHHM1_initial = await Profile.find(initialQuery1);
    const visibleToHHM2_initial = await Profile.find(initialQuery2);

    console.log(`   - Visible to ${hhm1.name}: ${visibleToHHM1_initial.length > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Visible to ${hhm2.name}: ${visibleToHHM2_initial.length > 0 ? '✅ YES' : '❌ NO'}`);

    // Step 2: HHM1 hires the worker
    console.log(`\n🤝 Step 2: ${hhm1.name} hiring ${worker.name}...`);
    await workerProfile.hireByHHM(hhm1._id);
    
    // Reload the profile
    workerProfile = await Profile.findOne({ userId: worker._id });
    console.log(`   - Worker status: ${workerProfile.availabilityStatus}`);
    console.log(`   - Current Employer: ${workerProfile.currentEmployer}`);
    console.log(`   - Employment Start: ${workerProfile.employmentStartDate}`);

    // Step 3: Check exclusivity - worker should only be visible to HHM1
    console.log(`\n🔒 Step 3: Checking exclusivity after hiring...`);
    
    const afterHireQuery1 = {
      userId: { $in: [worker._id] },
      $or: [
        { currentEmployer: null },
        { currentEmployer: hhm1._id }
      ]
    };
    
    const afterHireQuery2 = {
      userId: { $in: [worker._id] },
      $or: [
        { currentEmployer: null },
        { currentEmployer: hhm2._id }
      ]
    };

    const visibleToHHM1_afterHire = await Profile.find(afterHireQuery1);
    const visibleToHHM2_afterHire = await Profile.find(afterHireQuery2);

    console.log(`   - Visible to ${hhm1.name}: ${visibleToHHM1_afterHire.length > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Visible to ${hhm2.name}: ${visibleToHHM2_afterHire.length > 0 ? '✅ YES (PROBLEM!)' : '❌ NO (CORRECT!)'}`);

    // Step 4: HHM1 releases the worker
    console.log(`\n🔓 Step 4: ${hhm1.name} releasing ${worker.name}...`);
    await workerProfile.releaseFromEmployment();
    
    // Reload the profile
    workerProfile = await Profile.findOne({ userId: worker._id });
    console.log(`   - Worker status: ${workerProfile.availabilityStatus}`);
    console.log(`   - Current Employer: ${workerProfile.currentEmployer || 'None'}`);

    // Step 5: Check that both HHMs can see the worker again
    console.log(`\n🆓 Step 5: Checking visibility after release...`);
    
    const afterReleaseQuery1 = {
      userId: { $in: [worker._id] },
      $or: [
        { currentEmployer: null },
        { currentEmployer: hhm1._id }
      ]
    };
    
    const afterReleaseQuery2 = {
      userId: { $in: [worker._id] },
      $or: [
        { currentEmployer: null },
        { currentEmployer: hhm2._id }
      ]
    };

    const visibleToHHM1_afterRelease = await Profile.find(afterReleaseQuery1);
    const visibleToHHM2_afterRelease = await Profile.find(afterReleaseQuery2);

    console.log(`   - Visible to ${hhm1.name}: ${visibleToHHM1_afterRelease.length > 0 ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Visible to ${hhm2.name}: ${visibleToHHM2_afterRelease.length > 0 ? '✅ YES' : '❌ NO'}`);

    // Summary
    console.log(`\n📊 TEST SUMMARY:`);
    const initiallyVisible = visibleToHHM1_initial.length > 0 && visibleToHHM2_initial.length > 0;
    const exclusiveAfterHire = visibleToHHM1_afterHire.length > 0 && visibleToHHM2_afterHire.length === 0;
    const visibleAfterRelease = visibleToHHM1_afterRelease.length > 0 && visibleToHHM2_afterRelease.length > 0;

    console.log(`   ✅ Initially visible to both HHMs: ${initiallyVisible ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Exclusive to hiring HHM only: ${exclusiveAfterHire ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Available to all after release: ${visibleAfterRelease ? 'PASS' : 'FAIL'}`);

    if (initiallyVisible && exclusiveAfterHire && visibleAfterRelease) {
      console.log(`\n🎉 WORKER EXCLUSIVITY FEATURE IS WORKING CORRECTLY! 🎉`);
    } else {
      console.log(`\n❌ WORKER EXCLUSIVITY FEATURE NEEDS DEBUGGING`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

testWorkerExclusivity();
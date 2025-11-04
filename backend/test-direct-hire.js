const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');
const Schedule = require('./models/schedule.model');
const Invitation = require('./models/invitation.model');

async function testDirectHireFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // 1. Find an HHM user
    const hhm = await User.findOne({ role: 'HHM' });
    if (!hhm) {
      console.log('❌ No HHM user found. Please create one first.');
      process.exit(1);
    }
    console.log('👤 HHM User:', hhm.name, `(${hhm.email})`);

    // 2. Find available workers with profiles
    const workers = await User.find({ role: 'Worker' }).limit(5);
    console.log(`\n👥 Found ${workers.length} Worker users:`);
    
    const workersWithProfiles = [];
    for (const worker of workers) {
      const profile = await Profile.findOne({ userId: worker._id });
      if (profile) {
        console.log(`  ✅ ${worker.name} (${worker.email})`);
        console.log(`     - Skills: ${profile.skills?.join(', ') || 'None'}`);
        console.log(`     - Status: ${profile.availabilityStatus}`);
        workersWithProfiles.push({ worker, profile });
      } else {
        console.log(`  ⚠️  ${worker.name} (${worker.email}) - NO PROFILE`);
      }
    }

    if (workersWithProfiles.length === 0) {
      console.log('\n❌ No workers with profiles found. Run create-worker-profiles.js first.');
      process.exit(1);
    }

    // 3. Find an open schedule for this HHM
    let schedule = await Schedule.findOne({ hhmId: hhm._id, status: 'open' });
    
    if (!schedule) {
      console.log('\n📅 No open schedule found. Creating a test schedule...');
      schedule = await Schedule.create({
        hhmId: hhm._id,
        title: 'Test Direct Hire Schedule',
        description: 'Testing direct hire invitation flow',
        location: 'Test Location',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        wageOffered: 500,
        workerCount: 5,
        requiredSkills: ['Harvesting', 'Planting', 'General Labor'],
        workType: 'harvesting',
        workingHours: '8:00 AM - 5:00 PM',
        status: 'open'
      });
      console.log('   ✅ Created schedule:', schedule.title);
    } else {
      console.log('\n📅 Found open schedule:', schedule.title);
    }

    console.log(`   - Location: ${schedule.location}`);
    console.log(`   - Wage: ₹${schedule.wageOffered}/day`);
    console.log(`   - Required Workers: ${schedule.workerCount}`);
    console.log(`   - Skills: ${schedule.requiredSkills.join(', ')}`);

    // 4. Test creating invitations
    console.log('\n📨 Testing Invitation Creation...\n');

    const testWorker = workersWithProfiles[0];
    
    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      workerId: testWorker.worker._id,
      scheduleId: schedule._id
    });

    if (existingInvitation) {
      console.log('⚠️  Invitation already exists for this worker and schedule');
      console.log(`   Status: ${existingInvitation.status}`);
      console.log(`   Created: ${existingInvitation.createdAt}`);
      console.log(`   Expires: ${existingInvitation.expiresAt}`);
    } else {
      // Create new invitation
      const invitation = await Invitation.create({
        workerId: testWorker.worker._id,
        hhmId: hhm._id,
        scheduleId: schedule._id,
        personalMessage: 'We would love to have you join our team for this harvest! Your skills match perfectly.',
        offeredWage: 550, // Slightly higher than schedule wage
        priority: 'high'
      });

      const populated = await Invitation.findById(invitation._id)
        .populate('workerId', 'name email phone')
        .populate('scheduleId', 'title wageOffered')
        .populate('hhmId', 'name email companyName');

      console.log('✅ Invitation Created Successfully!');
      console.log(`   Invitation ID: ${populated._id}`);
      console.log(`   To: ${populated.workerId.name} (${populated.workerId.email})`);
      console.log(`   For: ${populated.scheduleId.title}`);
      console.log(`   From: ${populated.hhmId.name}`);
      console.log(`   Offered Wage: ₹${populated.offeredWage}/day`);
      console.log(`   Priority: ${populated.priority}`);
      console.log(`   Status: ${populated.status}`);
      console.log(`   Expires: ${populated.expiresAt.toLocaleDateString()}`);
      console.log(`   Message: "${populated.personalMessage}"`);
    }

    // 5. Show all invitations for this HHM
    console.log('\n📋 All Invitations for this HHM:\n');
    const allInvitations = await Invitation.find({ hhmId: hhm._id })
      .populate('workerId', 'name email')
      .populate('scheduleId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    if (allInvitations.length === 0) {
      console.log('   No invitations found.');
    } else {
      allInvitations.forEach((inv, idx) => {
        console.log(`   ${idx + 1}. ${inv.workerId.name} → ${inv.scheduleId.title}`);
        console.log(`      Status: ${inv.status} | Created: ${inv.createdAt.toLocaleDateString()}`);
      });
    }

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DIRECT HIRE FLOW TEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   - HHM: ${hhm.name}`);
    console.log(`   - Workers with Profiles: ${workersWithProfiles.length}`);
    console.log(`   - Open Schedules: 1`);
    console.log(`   - Total Invitations: ${allInvitations.length}`);
    console.log(`\n🔗 API Endpoints Ready:`);
    console.log(`   GET  /api/hhm/workers - Browse available workers`);
    console.log(`   POST /api/hhm/invitations - Send direct hire invitation`);
    console.log(`\n📝 Example POST body for invitation:`);
    console.log(JSON.stringify({
      scheduleId: schedule._id.toString(),
      workerId: testWorker.worker._id.toString(),
      personalMessage: "We would love to have you on our team!",
      offeredWage: 550,
      priority: "high"
    }, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testDirectHireFlow();

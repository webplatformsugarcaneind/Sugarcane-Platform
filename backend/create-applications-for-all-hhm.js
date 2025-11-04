const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const Schedule = require('./models/schedule.model');
const Application = require('./models/application.model');

dotenv.config();

const createApplicationsForAllHHM = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');

    // Get ALL HHM users
    const hhmUsers = await User.find({ role: 'HHM' });
    console.log(`Found ${hhmUsers.length} HHM users:\n`);
    hhmUsers.forEach((hhm, i) => {
      console.log(`${i + 1}. ${hhm.name} (${hhm.email})`);
    });
    console.log('\n');

    // Get ALL Worker users
    let workerUsers = await User.find({ role: 'Worker' });
    console.log(`Found ${workerUsers.length} Worker users\n`);

    // If not enough workers, create more
    if (workerUsers.length < 6) {
      console.log('Creating additional workers...\n');
      
      const additionalWorkers = [
        {
          name: 'Rajesh Verma',
          username: 'rajesh_verma',
          email: 'rajesh.verma@example.com',
          password: '123456',
          phone: '+91-9876543220',
          role: 'Worker',
          skills: 'Equipment operation, Irrigation, Maintenance',
          workPreferences: 'Full-time, Flexible hours',
          wageRate: '₹400 per day',
          availability: 'Available',
          workExperience: '8 years'
        },
        {
          name: 'Sunita Devi',
          username: 'sunita_worker',
          email: 'sunita.devi@example.com',
          password: '123456',
          phone: '+91-9876543221',
          role: 'Worker',
          skills: 'Planting, Weeding, Fertilizer application',
          workPreferences: 'Part-time, Morning shifts',
          wageRate: '₹280 per day',
          availability: 'Available',
          workExperience: '5 years'
        },
        {
          name: 'Prakash Yadav',
          username: 'prakash_yadav',
          email: 'prakash.yadav@example.com',
          password: '123456',
          phone: '+91-9876543222',
          role: 'Worker',
          skills: 'Irrigation, Pesticide application, Field preparation',
          workPreferences: 'Full-time, Flexible',
          wageRate: '₹380 per day',
          availability: 'Available',
          workExperience: '10 years'
        },
        {
          name: 'Kavita Singh',
          username: 'kavita_worker',
          email: 'kavita.singh@example.com',
          password: '123456',
          phone: '+91-9876543223',
          role: 'Worker',
          skills: 'Sorting, Packaging, Quality control',
          workPreferences: 'Part-time, Flexible',
          wageRate: '₹320 per day',
          availability: 'Available',
          workExperience: '6 years'
        }
      ];

      for (const workerData of additionalWorkers) {
        const existingWorker = await User.findOne({ email: workerData.email });
        if (!existingWorker) {
          const newWorker = await User.create(workerData);
          workerUsers.push(newWorker);
          console.log(`✅ Created worker: ${newWorker.name}`);
        }
      }
      console.log('\n');
    }

    // Clear existing schedules and applications
    await Schedule.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️  Cleared existing schedules and applications\n');

    let totalApplicationsCreated = 0;

    // Create schedules and applications for EACH HHM user
    for (let i = 0; i < hhmUsers.length; i++) {
      const hhm = hhmUsers[i];
      console.log(`\n📋 Creating data for HHM: ${hhm.name}`);
      console.log('─'.repeat(50));

      // Create 2-3 schedules per HHM
      const scheduleCount = 2 + (i % 2); // 2 or 3 schedules
      
      for (let j = 0; j < scheduleCount; j++) {
        const schedule = await Schedule.create({
          hhmId: hhm._id,
          title: [
            'Sugarcane Harvesting - November 2025',
            'Field Preparation Project',
            'Irrigation System Installation',
            'Planting Season Work',
            'Maintenance & Weeding'
          ][j],
          description: 'Experienced workers needed for agricultural operations. Good wages and working conditions.',
          location: [
            'Field A-1, Punjab',
            'Field B-2, Haryana', 
            'Farm C-3, Maharashtra',
            'Estate D-4, Uttar Pradesh',
            'Plot E-5, Karnataka'
          ][j],
          workType: ['harvesting', 'preparation', 'irrigation', 'planting', 'maintenance'][j],
          startDate: new Date(Date.now() + (j + 1) * 7 * 24 * 60 * 60 * 1000), // 1, 2, 3 weeks from now
          endDate: new Date(Date.now() + (j + 4) * 7 * 24 * 60 * 60 * 1000), // 3 weeks duration
          wageOffered: 500 + (j * 50),
          workerCount: 8 + (j * 2),
          requiredSkills: [
            ['harvesting', 'equipment operation'],
            ['field preparation', 'planting'],
            ['irrigation', 'maintenance'],
            ['planting', 'weeding'],
            ['maintenance', 'quality control']
          ][j],
          workingHours: '6 AM - 2 PM',
          status: 'open'
        });

        console.log(`  ✅ Schedule: ${schedule.title}`);

        // Create 3-4 applications per schedule from different workers
        const applicationsPerSchedule = 3 + (j % 2);
        const workerStartIndex = (i * scheduleCount + j) % workerUsers.length;
        
        for (let k = 0; k < applicationsPerSchedule; k++) {
          const workerIndex = (workerStartIndex + k) % workerUsers.length;
          const worker = workerUsers[workerIndex];

          // Vary the status: pending, approved, rejected
          const statuses = ['pending', 'approved', 'rejected', 'pending'];
          const status = statuses[k % statuses.length];

          try {
            const application = await Application.create({
              workerId: worker._id,
              scheduleId: schedule._id,
              hhmId: hhm._id,
              status: status,
              applicationMessage: [
                'I have extensive experience in this field and own necessary tools. Available for the full duration.',
                'Experienced worker with good track record. Can start immediately.',
                'Looking for stable work opportunity. Flexible with timings and dedicated to quality work.',
                'Hardworking and reliable. Have worked on similar projects before.'
              ][k],
              workerSkills: worker.skills ? worker.skills.split(',').map(s => s.trim()) : ['general'],
              experience: worker.workExperience || '5 years',
              expectedWage: 500 + (k * 30),
              availability: ['full-time', 'part-time', 'flexible'][k % 3]
            });

            totalApplicationsCreated++;
            console.log(`    • ${worker.name} → ${status}`);
          } catch (err) {
            // Skip if duplicate (worker already applied to this schedule)
            if (err.code !== 11000) {
              console.log(`    ⚠️  Could not create application for ${worker.name}: ${err.message}`);
            }
          }
        }
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 DATA CREATION COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   HHM Users: ${hhmUsers.length}`);
    console.log(`   Worker Users: ${workerUsers.length}`);
    console.log(`   Schedules Created: ${await Schedule.countDocuments()}`);
    console.log(`   Applications Created: ${totalApplicationsCreated}`);

    // Show stats per HHM
    console.log('\n📈 Applications per HHM:');
    for (const hhm of hhmUsers) {
      const appCount = await Application.countDocuments({ hhmId: hhm._id });
      const pending = await Application.countDocuments({ hhmId: hhm._id, status: 'pending' });
      const approved = await Application.countDocuments({ hhmId: hhm._id, status: 'approved' });
      const rejected = await Application.countDocuments({ hhmId: hhm._id, status: 'rejected' });
      
      console.log(`\n   ${hhm.name} (${hhm.email}):`);
      console.log(`      Total: ${appCount} | Pending: ${pending} | Approved: ${approved} | Rejected: ${rejected}`);
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Restart your backend server (Ctrl+C and npm start)');
    console.log('   2. Login with ANY of these HHM users:');
    hhmUsers.forEach(hhm => {
      console.log(`      • Email: ${hhm.email} | Password: 123456`);
    });
    console.log('   3. Navigate to Labor Management → Applications Received');
    console.log('   4. You should now see applications! 🎉\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

createApplicationsForAllHHM();

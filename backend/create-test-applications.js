const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const Schedule = require('./models/schedule.model');
const Application = require('./models/application.model');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test applications
const createTestApplications = async () => {
  try {
    console.log('🔄 Starting to create test applications...\n');

    // Step 1: Find HHM user
    const hhmUser = await User.findOne({ role: 'HHM' });
    if (!hhmUser) {
      console.log('❌ No HHM user found. Please create an HHM user first.');
      console.log('💡 You can run: node backend/seeder.js');
      process.exit(1);
    }
    console.log(`✅ Found HHM user: ${hhmUser.name} (${hhmUser.email})`);

    // Step 2: Find or create Worker users
    let workerUsers = await User.find({ role: 'Worker' }).limit(3);
    
    if (workerUsers.length === 0) {
      console.log('⚠️  No Worker users found. Creating test workers...');
      
      const testWorkers = [
        {
          name: 'Rajesh Kumar',
          username: 'rajesh_worker',
          email: 'rajesh.worker@example.com',
          password: 'worker123',
          phone: '+91-9876543210',
          role: 'Worker',
          skills: ['harvesting', 'equipment operation', 'irrigation'],
          experience: 5,
          availabilityStatus: 'available'
        },
        {
          name: 'Priya Sharma',
          username: 'priya_worker',
          email: 'priya.worker@example.com',
          password: 'worker123',
          phone: '+91-9876543211',
          role: 'Worker',
          skills: ['planting', 'soil preparation', 'weeding'],
          experience: 3,
          availabilityStatus: 'available'
        },
        {
          name: 'Amit Singh',
          username: 'amit_worker',
          email: 'amit.worker@example.com',
          password: 'worker123',
          phone: '+91-9876543212',
          role: 'Worker',
          skills: ['harvesting', 'transportation', 'loading'],
          experience: 4,
          availabilityStatus: 'available'
        }
      ];

      workerUsers = await User.create(testWorkers);
      console.log(`✅ Created ${workerUsers.length} test workers\n`);
    } else {
      console.log(`✅ Found ${workerUsers.length} existing Worker users\n`);
    }

    // Step 3: Find or create Schedule
    let schedule = await Schedule.findOne({ hhmId: hhmUser._id, status: 'open' });
    
    if (!schedule) {
      console.log('⚠️  No open schedule found. Creating test schedule...');
      
      schedule = await Schedule.create({
        hhmId: hhmUser._id,
        title: 'Sugarcane Harvesting - November 2025',
        description: 'Need experienced workers for sugarcane harvesting season. Must have own tools.',
        location: 'Field A-1, Punjab',
        workType: 'harvesting',
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-12-15'),
        wageOffered: 600,
        workerCount: 10,
        requiredSkills: ['harvesting', 'equipment operation'],
        workingHours: '6 AM - 2 PM',
        status: 'open'
      });
      
      console.log(`✅ Created test schedule: ${schedule.title}\n`);
    } else {
      console.log(`✅ Using existing schedule: ${schedule.title}\n`);
    }

    // Step 4: Delete existing applications to avoid duplicates
    await Application.deleteMany({ scheduleId: schedule._id });
    console.log('🗑️  Cleared existing applications for this schedule\n');

    // Step 5: Create test applications
    const testApplications = workerUsers.map((worker, index) => ({
      workerId: worker._id,
      scheduleId: schedule._id,
      hhmId: hhmUser._id,
      status: index === 0 ? 'approved' : index === 1 ? 'rejected' : 'pending',
      applicationMessage: [
        'I have 5 years of experience in sugarcane harvesting and own basic harvesting tools. Available for the full duration.',
        'Experienced in soil preparation and planting. Can work flexible hours and have reliable transportation.',
        'Skilled harvester with experience in team coordination. Looking for long-term work opportunities.'
      ][index],
      workerSkills: worker.skills || ['harvesting'],
      experience: `${worker.experience || 3} years`,
      expectedWage: 550 + (index * 50),
      availability: ['full-time', 'part-time', 'flexible'][index]
    }));

    const createdApplications = await Application.create(testApplications);
    
    console.log('✅ Created test applications:\n');
    createdApplications.forEach((app, index) => {
      console.log(`   ${index + 1}. ${workerUsers[index].name} - Status: ${app.status}`);
    });

    console.log('\n🎉 Test applications created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   HHM User: ${hhmUser.name} (${hhmUser.email})`);
    console.log(`   Job Schedule: ${schedule.title}`);
    console.log(`   Applications Created: ${createdApplications.length}`);
    console.log(`   - Pending: ${createdApplications.filter(a => a.status === 'pending').length}`);
    console.log(`   - Approved: ${createdApplications.filter(a => a.status === 'approved').length}`);
    console.log(`   - Rejected: ${createdApplications.filter(a => a.status === 'rejected').length}`);
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Login as HHM user with credentials:');
    console.log(`      Email: ${hhmUser.email}`);
    console.log(`      Password: (check your users.json file)`);
    console.log('   2. Navigate to Labor Management page');
    console.log('   3. Click on "Applications Received" tab');
    console.log('   4. You should now see the test applications!');

  } catch (error) {
    console.error('❌ Error creating test applications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  await createTestApplications();
};

run();

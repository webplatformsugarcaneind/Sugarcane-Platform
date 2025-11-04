const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load Mongoose models
const User = require('./models/user.model');
const Application = require('./models/application.model');
const Schedule = require('./models/schedule.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testApproveApplications = async () => {
  try {
    console.log('🔍 Checking for applications...'.blue);
    
    // Find HHM user
    const hhmUser = await User.findOne({ role: 'HHM' });
    if (!hhmUser) {
      console.log('⚠️  No HHM user found. Please run the seeder first.'.yellow);
      process.exit();
    }
    console.log(`✅ Found HHM user: ${hhmUser.name} (${hhmUser.username})`.green);

    // Find Labour users
    const labourUsers = await User.find({ role: 'Labour' });
    if (labourUsers.length === 0) {
      console.log('⚠️  No Labour users found. Please run the seeder first.'.yellow);
      process.exit();
    }
    console.log(`✅ Found ${labourUsers.length} Labour users`.green);

    // Check for existing schedules
    let schedule = await Schedule.findOne({ hhmId: hhmUser._id });
    
    // If no schedule exists, create one
    if (!schedule) {
      console.log('📋 No existing schedule found. Creating a test schedule...'.yellow);
      schedule = await Schedule.create({
        hhmId: hhmUser._id,
        title: 'Sugarcane Harvesting - Test Job',
        description: 'Test job for harvesting sugarcane in the main field',
        location: 'Main Field, Farm Area A',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        workerCount: 5,
        requiredSkills: ['Harvesting', 'Field preparation', 'Equipment operation'],
        wageOffered: 350,
        workHours: '8:00 AM - 5:00 PM',
        status: 'open'
      });
      console.log(`✅ Created test schedule: ${schedule.title}`.green);
    } else {
      console.log(`✅ Found existing schedule: ${schedule.title}`.green);
    }

    // Check for existing applications
    const existingApps = await Application.find({ 
      hhmId: hhmUser._id,
      scheduleId: schedule._id 
    });

    if (existingApps.length > 0) {
      console.log(`\n📝 Found ${existingApps.length} existing applications`.cyan);
      
      // Approve all pending applications
      let approvedCount = 0;
      for (const app of existingApps) {
        if (app.status === 'pending') {
          app.status = 'approved';
          app.reviewedAt = new Date();
          app.reviewNotes = 'Approved for testing purposes';
          await app.save();
          approvedCount++;
          
          const worker = await User.findById(app.workerId);
          console.log(`✅ Approved application from ${worker.name}`.green);
        } else {
          const worker = await User.findById(app.workerId);
          console.log(`⏭️  Application from ${worker.name} already ${app.status}`.yellow);
        }
      }
      
      if (approvedCount > 0) {
        console.log(`\n✅ Approved ${approvedCount} applications!`.green.inverse);
      }
    } else {
      console.log('\n📝 No existing applications found. Creating test applications...'.yellow);
      
      // Create applications for each labour user
      for (const labour of labourUsers) {
        const application = await Application.create({
          workerId: labour._id,
          scheduleId: schedule._id,
          hhmId: hhmUser._id,
          applicationMessage: `I am interested in working on this job. I have experience in sugarcane farming.`,
          workerSkills: ['Harvesting', 'Field preparation'],
          experience: '5+ years in agricultural work',
          expectedWage: 350,
          availability: 'full-time',
          status: 'approved',
          reviewedAt: new Date(),
          reviewNotes: 'Approved - good experience and skills match'
        });
        
        console.log(`✅ Created and approved application for ${labour.name}`.green);
      }
      
      console.log(`\n✅ Created and approved ${labourUsers.length} applications!`.green.inverse);
    }

    // Show summary
    const totalApproved = await Application.countDocuments({ 
      hhmId: hhmUser._id, 
      status: 'approved' 
    });
    console.log(`\n📊 Summary:`.yellow);
    console.log(`   HHM: ${hhmUser.name}`.cyan);
    console.log(`   Total approved applications: ${totalApproved}`.cyan);
    console.log(`   Schedule: ${schedule.title}`.cyan);
    
    process.exit();
  } catch (err) {
    console.error(`❌ Error: ${err.message}`.red.inverse);
    console.error(err);
    process.exit(1);
  }
};

testApproveApplications();

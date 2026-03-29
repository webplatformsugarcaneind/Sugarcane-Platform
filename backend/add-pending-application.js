const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');
const Schedule = require('./models/schedule.model');
const Application = require('./models/application.model');

dotenv.config();

const addPendingApplication = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');

    // Find HHM and get their open schedule
    const hhm = await User.findOne({ role: 'HHM' });
    const schedule = await Schedule.findOne({ hhmId: hhm._id, status: 'open' });
    
    if (!schedule) {
      console.log('❌ No open schedule found');
      process.exit(1);
    }

    // Create a new worker
    const newWorker = await User.create({
      name: 'Rajesh Verma',
      username: 'rajesh_verma',
      email: 'rajesh.verma@example.com',
      password: '123456',
      phone: '+91-9876543220',
      role: 'Labour',
      skills: 'Equipment operation, Irrigation, Maintenance',
      workPreferences: 'Full-time, Flexible hours',
      wageRate: '₹400 per day',
      availability: 'Available',
      workExperience: '8 years in agricultural machinery'
    });

    console.log(`✅ Created worker: ${newWorker.name}`);

    // Create pending application
    const application = await Application.create({
      workerId: newWorker._id,
      scheduleId: schedule._id,
      hhmId: hhm._id,
      status: 'pending',
      applicationMessage: 'Experienced equipment operator with 8 years of experience. Specializing in irrigation systems and machinery maintenance. Available for immediate start.',
      workerSkills: ['equipment operation', 'irrigation', 'maintenance'],
      experience: '8 years',
      expectedWage: 620,
      availability: 'full-time'
    });

    console.log(`✅ Created PENDING application for ${newWorker.name}`);
    console.log(`\n🎉 Success! You now have a new pending application to test.`);
    console.log(`\nRefresh your browser and check the "Applications Received" tab!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

addPendingApplication();

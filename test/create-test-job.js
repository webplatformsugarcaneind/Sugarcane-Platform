const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./models/user.model');
const Schedule = require('./models/schedule.model');

async function createTestJob() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📱 Connected to MongoDB');

    // Find an HHM user to create the job
    const hhmUser = await User.findOne({ role: 'HHM' });
    if (!hhmUser) {
      console.log('❌ No HHM user found to create job');
      return;
    }

    console.log('✅ Found HHM:', hhmUser.name);

    // Create a simple test job
    const testJob = await Schedule.create({
      hhmId: hhmUser._id,
      title: 'Test Farm Work - Harvesting',
      description: 'Help with harvesting crops on a local farm',
      location: 'Test Farm, Local Area',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      startTime: '08:00',
      endTime: '17:00',
      requiredSkills: ['Harvesting', 'General Farm Work'],
      wageOffered: 600,
      workerCount: 5, // Fixed: changed from numberOfWorkersNeeded
      applicationDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      status: 'open',
      isActive: true,
      requirements: 'Physical fitness required. Experience preferred.'
    });

    console.log('✅ Created test job:', testJob.title);
    console.log('📋 Job ID:', testJob._id);
    console.log('📋 HHM:', hhmUser.name);
    console.log('📋 Wage Offered:', testJob.wageOffered);
    console.log('📋 Workers Needed:', testJob.workerCount);

  } catch (error) {
    console.error('❌ Error creating test job:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

createTestJob();
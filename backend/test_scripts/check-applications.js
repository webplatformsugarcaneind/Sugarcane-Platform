require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Schedule = require('./models/schedule.model');
const Application = require('./models/application.model');

const checkApplications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📋 CHECKING APPLICATIONS STATUS:\n');
    
    const applications = await Application.find({})
      .populate('workerId', 'name email')
      .populate('hhmId', 'name email')
      .populate('scheduleId', 'title');
      
    console.log('Total applications:', applications.length);
    
    if (applications.length > 0) {
      console.log('\n📄 Application Details:');
      applications.forEach((app, i) => {
        console.log(`${i + 1}. ${app.workerId?.name || 'Unknown'} → ${app.hhmId?.name || 'Unknown'}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Job: ${app.scheduleId?.title || 'Unknown'}`);
        console.log(`   Reviewed: ${app.reviewedAt || 'Never'}`);
        console.log('');
      });
      
      const approvedApps = applications.filter(a => a.status === 'approved');
      console.log(`\n✅ Approved applications: ${approvedApps.length}`);
      if (approvedApps.length > 0) {
        console.log('❌ Approved workers should be hired, but profiles show they are not...');
        console.log('🔧 This indicates the hiring process is not working correctly.');
      }
    } else {
      console.log('❌ No applications found in database!');
      console.log('💡 Need to create some test applications first.');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
  }
};

checkApplications();
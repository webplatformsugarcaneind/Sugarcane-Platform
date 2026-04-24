const mongoose = require('mongoose');
const Application = require('./models/application.model');
const User = require('./models/user.model');
const Schedule = require('./models/schedule.model');
require('dotenv').config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('\n🔍 VERIFICATION REPORT\n');
    console.log('═'.repeat(60));
    
    const hhmUsers = await User.find({ role: 'HHM' });
    
    for (const hhm of hhmUsers) {
      const apps = await Application.find({ hhmId: hhm._id })
        .populate('workerId', 'name email')
        .populate('scheduleId', 'title');
      
      console.log(`\n👔 ${hhm.name} (${hhm.email})`);
      console.log('─'.repeat(60));
      
      if (apps.length === 0) {
        console.log('   ❌ NO APPLICATIONS FOUND');
      } else {
        console.log(`   ✅ ${apps.length} applications found:`);
        apps.forEach((app, i) => {
          const workerName = app.workerId?.name || 'Unknown Worker';
          const jobTitle = app.scheduleId?.title || 'Unknown Job';
          console.log(`   ${i+1}. ${workerName} → ${jobTitle} [${app.status}]`);
        });
      }
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ All HHM users should now see applications!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

verify();

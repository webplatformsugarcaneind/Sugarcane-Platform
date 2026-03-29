const axios = require('axios');

async function manualTest() {
  console.log('🔧 Manual Availability Test\n');
  console.log('Please follow these steps in the browser:\n');
  console.log('1. Login as worker: meenalabour / 123456');
  console.log('2. Go to Profile page');
  console.log('3. Check the Availability dropdown - what value is shown?');
  console.log('4. Change it to "Unavailable" and Save');
  console.log('5. Wait 3 seconds...\n');
  
  // Wait 3 seconds for you to do the update
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('6. Now I will check the database directly...\n');
  
  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://localhost:27017/sugarcane-platform');
  
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const user = await User.findOne({ username: 'meenalabour' });
  
  console.log('📊 Database check:');
  console.log('  - Username:', user.username);
  console.log('  - Name:', user.name);
  console.log('  - Availability field:', user.availability);
  console.log('  - Type:', typeof user.availability);
  
  if (user.availability === 'Unavailable') {
    console.log('\n✅ SUCCESS: Availability is saved as "Unavailable" in database!');
  } else if (user.availability === 'Available') {
    console.log('\n⚠️  ISSUE: Still showing "Available" - update did not save');
  } else {
    console.log('\n❌ ERROR: Unexpected value:', user.availability);
  }
  
  mongoose.connection.close();
}

manualTest().catch(console.error);
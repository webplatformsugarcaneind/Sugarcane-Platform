const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sugarcane-platform');

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function checkAvailabilityInDB() {
  try {
    console.log('🔍 Checking availability field in database...\n');
    
    const meena = await User.findOne({ username: 'meenalabour' });
    
    if (meena) {
      console.log('📋 User found:', meena.name);
      console.log('📊 Availability field:');
      console.log('  - Value:', meena.availability);
      console.log('  - Type:', typeof meena.availability);
      console.log('  - Is undefined:', meena.availability === undefined);
      console.log('  - Is null:', meena.availability === null);
      
      console.log('\n📋 All fields in user object:');
      console.log(Object.keys(meena.toObject()).filter(key => key !== 'password').join(', '));
      
      console.log('\n📋 Full user data (without password):');
      const userData = meena.toObject();
      delete userData.password;
      console.log(JSON.stringify(userData, null, 2));
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkAvailabilityInDB();
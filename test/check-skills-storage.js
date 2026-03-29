const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane-platform');

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function checkSkillsStorage() {
  try {
    console.log('🔍 Checking how skills are stored in database...\n');
    
    const meena = await User.findOne({ username: 'meenalabour' });
    
    if (meena) {
      console.log('🗄️ Raw database data for Meena:');
      console.log('- skills value:', JSON.stringify(meena.skills));
      console.log('- skills type:', typeof meena.skills);
      console.log('- skills constructor:', meena.skills?.constructor?.name);
      console.log('- is Array:', Array.isArray(meena.skills));
      
      // Check the raw document
      const rawDoc = await mongoose.connection.db.collection('users').findOne({ username: 'meenalabour' });
      console.log('\n📄 Raw MongoDB document skills field:');
      console.log('- value:', JSON.stringify(rawDoc.skills));
      console.log('- type:', typeof rawDoc.skills);
      console.log('- is Array:', Array.isArray(rawDoc.skills));
      
    } else {
      console.log('❌ Meena not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkSkillsStorage();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  name: { type: String, required: true },
  // other fields...
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    console.log('🔍 Checking for users that might need to accept orders...');
    
    const users = await User.find({
      $or: [
        { username: { $regex: /prakash/i } },
        { name: { $regex: /prakash/i } },
        { role: 'farmer' }
      ]
    }).select('username name role receivedOrders');

    console.log('\n📋 Found users:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.name}) [${user.role}] - ${user.receivedOrders ? user.receivedOrders.length : 0} received orders`);
    });

    // Check for the specific failing order
    console.log('\n🎯 Looking for users with the failing order...');
    const orderOwners = await User.find({
      'receivedOrders.orderId': '69119c9b2e08c15fdb661c3b'
    }).select('username name role');

    console.log('📦 Order owners:');
    orderOwners.forEach(user => {
      console.log(`- ${user.username} (${user.name}) [${user.role}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
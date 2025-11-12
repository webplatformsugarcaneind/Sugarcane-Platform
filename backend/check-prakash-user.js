const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
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
    console.log('🔍 Checking all users...');
    
    // Get all users first
    const allUsers = await User.find({}).select('username name role');
    console.log(`\n📋 Total users found: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.name}) [${user.role}]`);
    });

    // Check for the specific failing order
    console.log('\n🎯 Looking for users with the failing order...');
    const orderOwners = await User.find({
      'receivedOrders.orderId': '69119c9b2e08c15fdb661c3b'
    }).select('username name role receivedOrders');

    console.log('� Order owners:');
    if (orderOwners.length === 0) {
      console.log('No users found with this order');
    } else {
      orderOwners.forEach(user => {
        console.log(`- ${user.username} (${user.name}) [${user.role}]`);
        // Show the specific order details
        const order = user.receivedOrders.find(o => o.orderId.toString() === '69119c9b2e08c15fdb661c3b');
        console.log(`  Order details:`, order);
      });
    }

    // Also check for any users with received orders
    console.log('\n📋 Users with received orders:');
    const usersWithOrders = await User.find({
      'receivedOrders.0': { $exists: true }
    }).select('username name role receivedOrders');

    usersWithOrders.forEach(user => {
      console.log(`- ${user.username} (${user.name}) [${user.role}] - ${user.receivedOrders.length} orders`);
      user.receivedOrders.forEach(order => {
        console.log(`  * Order ${order.orderId} - Status: ${order.status} - From: ${order.buyerDetails?.name}`);
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
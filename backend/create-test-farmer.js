const mongoose = require('mongoose');
const User = require('./models/user.model');

async function createTestFarmer() {
  try {
    await mongoose.connect('mongodb://localhost:27017/sugarcane');
    console.log('Connected to MongoDB');

    // Check if test farmer already exists
    let testFarmer = await User.findOne({ email: 'testfarmer@example.com' });
    
    if (!testFarmer) {
      // Create test farmer
      testFarmer = new User({
        username: 'testfarmer',
        name: 'Test Farmer',
        email: 'testfarmer@example.com',
        password: 'password123',
        role: 'Farmer',
        phone: '9876543210',
        location: 'Test Village, Test District'
      });
      
      await testFarmer.save();
      console.log('✅ Test farmer created:', testFarmer.name);
    } else {
      console.log('✅ Test farmer already exists:', testFarmer.name);
    }
    
    console.log('Farmer details:', {
      id: testFarmer._id,
      username: testFarmer.username,
      email: testFarmer.email,
      role: testFarmer.role
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

createTestFarmer();

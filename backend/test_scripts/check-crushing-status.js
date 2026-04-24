const User = require('./models/user.model.js');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem')
.then(async () => {
  console.log('Connected to MongoDB');
  
  const totalUsers = await User.countDocuments();
  console.log(`Total users in database: ${totalUsers}`);
  
  const factories = await User.find({role: 'Factory'}).select('name factoryName crushingStatus');
  console.log(`Found ${factories.length} factory users:`);
  
  factories.forEach((factory, index) => {
    console.log(`${index + 1}. ${factory.name || factory.factoryName}: crushingStatus = ${factory.crushingStatus || 'undefined/null'}`);
  });
  
  // Let's also check the raw data
  if (factories.length > 0) {
    console.log('\nRaw factory data (first factory):');
    console.log(JSON.stringify(factories[0], null, 2));
  }
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
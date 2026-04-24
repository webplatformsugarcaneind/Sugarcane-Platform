const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load Mongoose models
const User = require('./models/user.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-ecosystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read the JSON data files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);

// Function to import data into the database
const importData = async () => {
  try {
    console.log('  Cleaning up existing data...'.yellow);
    
    // Clear existing data to prevent duplicates
    await User.deleteMany();

    console.log(' Importing users data...'.blue);
    
    // Insert users (including Factory role users with profile data)
    const createdUsers = await User.create(users);
    console.log(' Users imported successfully'.green);
    
    // Count Factory role users
    const factoryUsersCount = createdUsers.filter(user => user.role === 'Factory').length;
    console.log(` Factory users created: ${factoryUsersCount}`.cyan);

    console.log(' Data Successfully Imported! (Users only)'.green.inverse);
    console.log(' Note: Factory data now comes from Factory role users'.yellow);
    process.exit();
  } catch (err) {
    console.error(` Import Error: ${err}`.red.inverse);
    process.exit(1);
  }
};

// Function to destroy all data in the collections
const destroyData = async () => {
  try {
    console.log('  Destroying all data...'.red);
    
    await User.deleteMany();

    console.log(' Data Successfully Destroyed!'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(` Destroy Error: ${err}`.red.inverse);
    process.exit(1);
  }
};

// Logic to run the correct function based on command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

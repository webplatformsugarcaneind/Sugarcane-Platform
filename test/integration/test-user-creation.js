const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

async function testUserCreation() {
  try {
    // Create a factory user with all the fields
    const factoryUser = {
      name: "Priya Singh",
      username: "priyafactory",
      phone: "9876543213",
      email: "priya.singh@example.com",
      role: "Factory",
      password: "123456",
      factoryName: "Maharashtra Sugar Mills",
      factoryLocation: "Pune, Maharashtra",
      factoryDescription: "Leading sugar processing facility with state-of-the-art technology and sustainable practices.",
      capacity: "2500 TCD (Tonnes Crushed per Day)",
      experience: "15 years",
      specialization: "Sugar Processing, Ethanol Production",
      contactInfo: {
        website: "https://maharashtrasugar.com",
        fax: "+91-20-12345678"
      },
      operatingHours: {
        monday: "6:00 AM - 10:00 PM",
        tuesday: "6:00 AM - 10:00 PM",
        season: "October to March"
      }
    };

    // First delete existing user
    await User.deleteOne({ username: "priyafactory" });
    
    // Create new user
    const user = await User.create(factoryUser);
    console.log('✅ User created successfully:', user.username);
    
    // Fetch the user back
    const fetchedUser = await User.findOne({ username: "priyafactory" });
    console.log('📋 Factory Name:', fetchedUser.factoryName);
    console.log('📍 Location:', fetchedUser.factoryLocation);
    console.log('🏭 Capacity:', fetchedUser.capacity);
    console.log('📞 Contact Info:', fetchedUser.contactInfo);
    console.log('🕒 Operating Hours:', fetchedUser.operatingHours);
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testUserCreation();
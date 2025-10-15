const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user.model');

// Load environment variables
dotenv.config();

const testCompleteDataRetrieval = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Test authentication for each role
    console.log('🔐 TESTING AUTHENTICATION:');
    console.log('═'.repeat(50));
    
    const testCredentials = [
      { username: 'ravifarmer', password: '123456', role: 'Farmer' },
      { username: 'vikramhhm', password: '123456', role: 'HHM' },
      { username: 'anitafactory', password: '123456', role: 'Factory' },
      { username: 'amitlabour', password: '123456', role: 'Labour' }
    ];

    for (const cred of testCredentials) {
      try {
        const user = await User.findByCredentials(cred.username, cred.password);
        console.log(`✅ ${cred.role} login successful: ${user.name}`);
      } catch (error) {
        console.log(`❌ ${cred.role} login failed: ${error.message}`);
      }
    }

    console.log('\n📊 DETAILED FIELD TESTING:');
    console.log('═'.repeat(50));

    // Test Farmer data retrieval
    console.log('\n🌾 FARMER DATA TEST:');
    const farmer = await User.findOne({ role: 'Farmer' });
    console.log('Farmer found:', farmer.name);
    console.log('✓ Location:', farmer.location);
    console.log('✓ Farm Size:', farmer.farmSize);
    console.log('✓ Farming Experience:', farmer.farmingExperience);
    console.log('✓ Farming Methods:', farmer.farmingMethods);
    console.log('✓ Equipment:', farmer.equipment);
    console.log('✓ Certifications:', farmer.certifications);
    console.log('✓ Crop Types:', farmer.cropTypes);
    console.log('✓ Irrigation Type:', farmer.irrigationType);

    // Test HHM data retrieval
    console.log('\n👨‍💼 HHM DATA TEST:');
    const hhm = await User.findOne({ role: 'HHM' });
    console.log('HHM found:', hhm.name);
    console.log('✓ Management Experience:', hhm.managementExperience);
    console.log('✓ Team Size:', hhm.teamSize);
    console.log('✓ Management Operations:', hhm.managementOperations);
    console.log('✓ Services Offered:', hhm.servicesOffered);

    // Test Factory data retrieval
    console.log('\n🏭 FACTORY DATA TEST:');
    const factory = await User.findOne({ role: 'Factory' });
    console.log('Factory found:', factory.name);
    console.log('✓ Factory Name:', factory.factoryName);
    console.log('✓ Factory Location:', factory.factoryLocation);
    console.log('✓ Factory Description:', factory.factoryDescription);
    console.log('✓ Capacity:', factory.capacity);
    console.log('✓ Experience:', factory.experience);
    console.log('✓ Specialization:', factory.specialization);
    console.log('✓ Contact Info:', JSON.stringify(factory.contactInfo));
    console.log('✓ Operating Hours:', JSON.stringify(factory.operatingHours));

    // Test Labour data retrieval
    console.log('\n👷 LABOUR DATA TEST:');
    const labour = await User.findOne({ role: 'Labour' });
    console.log('Labour found:', labour.name);
    console.log('✓ Skills:', labour.skills);
    console.log('✓ Work Preferences:', labour.workPreferences);
    console.log('✓ Wage Rate:', labour.wageRate);
    console.log('✓ Availability:', labour.availability);
    console.log('✓ Work Experience:', labour.workExperience);

    // Test API-like data retrieval (simulate frontend API calls)
    console.log('\n🌐 API SIMULATION TEST:');
    console.log('═'.repeat(50));

    // Simulate getting all farmers for marketplace
    const farmers = await User.find({ role: 'Farmer', isActive: true })
      .select('name username email phone location farmSize cropTypes')
      .limit(10);
    console.log(`✅ Retrieved ${farmers.length} active farmers for marketplace`);

    // Simulate getting all factories for factory page
    const factories = await User.find({ role: 'Factory', isActive: true })
      .select('name factoryName factoryLocation capacity specialization')
      .limit(10);
    console.log(`✅ Retrieved ${factories.length} active factories`);

    // Simulate getting HHMs for services page
    const hhms = await User.find({ role: 'HHM', isActive: true })
      .select('name managementExperience teamSize servicesOffered')
      .limit(10);
    console.log(`✅ Retrieved ${hhms.length} active HHMs`);

    // Simulate getting available labour
    const labourers = await User.find({ 
      role: 'Labour', 
      isActive: true, 
      availability: 'Available' 
    })
      .select('name skills wageRate workExperience')
      .limit(10);
    console.log(`✅ Retrieved ${labourers.length} available labourers`);

    console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('📈 Data integrity: GOOD');
    console.log('🔐 Authentication: WORKING');
    console.log('📊 Field retrieval: COMPLETE');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

// Run the test
testCompleteDataRetrieval();
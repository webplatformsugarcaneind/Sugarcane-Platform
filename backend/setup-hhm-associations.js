require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Import models
const User = require('./models/user.model');

const setupHHMAssociations = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    const factoryId = '695563d36ca6b32dcf2b8d7a';
    console.log(`\n🏭 Setting up HHM associations for Factory: ${factoryId}`);

    // Find some HHMs in the database
    const hhms = await User.find({ role: 'HHM' }).limit(3);
    console.log(`\n👥 Found ${hhms.length} HHMs in database:`);
    
    hhms.forEach((hhm, index) => {
      console.log(`${index + 1}. ${hhm.name} (@${hhm.username}) - ${hhm.location}`);
    });

    if (hhms.length === 0) {
      console.log('\n❌ No HHMs found in database. Cannot setup associations.');
      process.exit(1);
    }

    // Update the factory to associate with these HHMs
    const hhmIds = hhms.map(hhm => hhm._id);
    
    const updatedFactory = await User.findByIdAndUpdate(
      factoryId,
      { $set: { associatedHHMs: hhmIds } },
      { new: true }
    );

    if (updatedFactory) {
      console.log(`\n✅ Successfully associated ${hhmIds.length} HHMs with factory ${updatedFactory.name}`);
      console.log(`Updated associatedHHMs: ${JSON.stringify(updatedFactory.associatedHHMs)}`);
    } else {
      console.log('❌ Failed to update factory');
    }

    // Verify the update by testing the API call
    console.log('\n🔗 Testing updated factory with populated HHMs...');
    const populatedFactory = await User.findById(factoryId)
      .populate('associatedHHMs', 'name username email phone location experience profilePicture')
      .lean();

    if (populatedFactory.associatedHHMs && populatedFactory.associatedHHMs.length > 0) {
      console.log('\n✅ Successfully populated HHMs:');
      populatedFactory.associatedHHMs.forEach((hhm, index) => {
        console.log(`${index + 1}. ${hhm.name} (@${hhm.username})`);
        console.log(`   📧 Email: ${hhm.email}`);
        console.log(`   📞 Phone: ${hhm.phone}`);
        console.log(`   📍 Location: ${hhm.location}`);
        console.log(`   📅 Experience: ${hhm.experience} years`);
      });
    }

    console.log('\n✨ Setup completed successfully!');
    console.log('\n🌐 You can now test the factory directory at:');
    console.log(`http://localhost:5173/farmer/factory-directory/${factoryId}`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
};

setupHHMAssociations();
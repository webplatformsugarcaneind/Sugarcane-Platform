const mongoose = require('mongoose');
const User = require('./models/user.model');
const Invitation = require('./models/invitation.model');

async function createTestInvitations() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find deepak factory and HHMs
    const factory = await User.findOne({ username: 'deepakfactory' });
    const hhm1 = await User.findOne({ username: 'sunitahhm' });
    const hhm2 = await User.findOne({ username: 'vikramhhm' });

    if (!factory) {
      throw new Error('Factory user not found');
    }

    console.log(`📍 Factory: ${factory.name} (${factory.username})`);

    // Create test invitations from HHMs to factory
    const testInvitations = [];

    if (hhm1) {
      testInvitations.push({
        hhmId: hhm1._id,
        factoryId: factory._id,
        invitationType: 'hhm-to-factory',
        status: 'pending',
        personalMessage: 'I would like to establish a partnership with your factory for mutual benefit.',
        invitationReason: 'Seeking collaboration opportunities',
        sentAt: new Date(),
        createdAt: new Date()
      });
    }

    if (hhm2) {
      testInvitations.push({
        hhmId: hhm2._id,
        factoryId: factory._id,
        invitationType: 'hhm-to-factory',
        status: 'pending',
        personalMessage: 'Looking forward to working together for better agricultural outcomes.',
        invitationReason: 'Expanding network for better service',
        sentAt: new Date(),
        createdAt: new Date()
      });
    }

    // Delete existing invitations first
    await Invitation.deleteMany({
      factoryId: factory._id,
      invitationType: 'hhm-to-factory'
    });

    console.log('🗑️ Cleared existing invitations');

    // Create new invitations
    for (const invitationData of testInvitations) {
      const invitation = new Invitation(invitationData);
      await invitation.save();
      
      const hhm = await User.findById(invitationData.hhmId);
      console.log(`✅ Created invitation: ${hhm.name} -> ${factory.name}`);
    }

    console.log(`\n🎉 Created ${testInvitations.length} test invitations for factory notifications!`);
    console.log('📨 These will appear as notifications in the factory dashboard.');

  } catch (error) {
    console.error('❌ Error creating test invitations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createTestInvitations();
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/user.model');
const Invitation = require('./models/invitation.model');

const checkInvitations = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        // Check all invitations
        const allInvitations = await Invitation.find({}).populate('factoryId hhmId', 'name role');
        console.log(`\n📋 Total invitations: ${allInvitations.length}`);

        for (const inv of allInvitations) {
            console.log(`\n Invitation ${inv._id}:`);
            console.log(`   Type: ${inv.invitationType}`);
            console.log(`   Status: ${inv.status}`);
            console.log(`   Factory: ${inv.factoryId?.name} (${inv.factoryId?.role})`);
            console.log(`   HHM: ${inv.hhmId?.name} (${inv.hhmId?.role})`);
            console.log(`   Created: ${inv.createdAt}`);
        }

        // Check factories
        const factories = await User.find({ role: 'Factory' });
        console.log(`\n🏭 Total Factories: ${factories.length}`);
        for (const factory of factories) {
            console.log(`   ${factory.name}: associatedHHMs = ${factory.associatedHHMs || '[]'}`);
        }

        // Check HHMs
        const hhms = await User.find({ role: 'HHM' });
        console.log(`\n👨‍💼 Total HHMs: ${hhms.length}`);
        for (const hhm of hhms) {
            console.log(`   ${hhm.name}: associatedFactories = ${hhm.associatedFactories || '[]'}`);
        }

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

checkInvitations();

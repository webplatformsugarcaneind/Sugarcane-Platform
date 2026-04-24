const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Invitation = require('./models/invitation.model');

const checkFactoryInvitations = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('invitations');

        // Check ALL invitations (including those without invitationType)
        const allInvitations = await collection.find({}).toArray();
        console.log(`\n📋 Total ALL invitations: ${allInvitations.length}`);        // Check factory-to-hhm invitations
        const factoryInvitations = await collection.find({
            invitationType: 'factory-to-hhm'
        }).toArray();

        console.log(`\n📋 Total factory-to-hhm invitations: ${factoryInvitations.length}`);

        for (const inv of allInvitations) {
            console.log(`\n Invitation ${inv._id}:`);
            console.log(`   Type: ${inv.invitationType}`);
            console.log(`   Factory: ${inv.factoryId}`);
            console.log(`   HHM: ${inv.hhmId}`);
            console.log(`   Status: ${inv.status}`);
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

checkFactoryInvitations();

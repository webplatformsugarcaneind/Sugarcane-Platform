const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/user.model');
const Invitation = require('./models/invitation.model');

const fixAssociations = async () => {
    try {
        console.log('🔧 Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
        console.log('✅ Connected to MongoDB');

        // Find all accepted factory-to-hhm invitations
        const acceptedInvitations = await Invitation.find({
            invitationType: 'factory-to-hhm',
            status: 'accepted'
        });

        console.log(`\n📋 Found ${acceptedInvitations.length} accepted factory-to-hhm invitations`);

        for (const invitation of acceptedInvitations) {
            console.log(`\n🔄 Processing invitation ${invitation._id}...`);

            // Get factory and HHM
            const factory = await User.findById(invitation.factoryId);
            const hhm = await User.findById(invitation.hhmId);

            if (!factory) {
                console.log(`❌ Factory not found: ${invitation.factoryId}`);
                continue;
            }

            if (!hhm) {
                console.log(`❌ HHM not found: ${invitation.hhmId}`);
                continue;
            }

            // Initialize arrays if undefined
            if (!factory.associatedHHMs) {
                factory.associatedHHMs = [];
            }
            if (!hhm.associatedFactories) {
                hhm.associatedFactories = [];
            }

            // Add HHM to factory's associatedHHMs if not already there
            if (!factory.associatedHHMs.some(id => id.equals(hhm._id))) {
                factory.associatedHHMs.push(hhm._id);
                await factory.save();
                console.log(`✅ Added HHM ${hhm.name} to Factory ${factory.name}'s associated HHMs`);
            } else {
                console.log(`ℹ️  HHM ${hhm.name} already in Factory ${factory.name}'s associated HHMs`);
            }

            // Add factory to HHM's associatedFactories if not already there
            if (!hhm.associatedFactories.some(id => id.equals(factory._id))) {
                hhm.associatedFactories.push(factory._id);
                await hhm.save();
                console.log(`✅ Added Factory ${factory.name} to HHM ${hhm.name}'s associated Factories`);
            } else {
                console.log(`ℹ️  Factory ${factory.name} already in HHM ${hhm.name}'s associated Factories`);
            }
        }

        console.log('\n✅ All associations fixed!');
        console.log('\n📊 Summary:');

        // Count associations
        const factoriesWithHHMs = await User.countDocuments({
            role: 'Factory',
            associatedHHMs: { $exists: true, $ne: [] }
        });

        const hhmsWithFactories = await User.countDocuments({
            role: 'HHM',
            associatedFactories: { $exists: true, $ne: [] }
        });

        console.log(`   Factories with associated HHMs: ${factoriesWithHHMs}`);
        console.log(`   HHMs with associated Factories: ${hhmsWithFactories}`);

        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing associations:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

fixAssociations();

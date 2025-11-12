const mongoose = require('mongoose');
const User = require('./models/user.model');
const Invitation = require('./models/invitation.model');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane_platform';

async function testFactoryInvitations() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Find a factory user
        const factory = await User.findOne({ role: 'Factory' });
        if (!factory) {
            console.log('❌ No factory user found');
            process.exit(1);
        }

        console.log('📋 Testing invitations for factory:', factory.name);
        console.log('   Factory ID:', factory._id);

        // Find all invitations sent by this factory
        const invitations = await Invitation.find({
            factoryId: factory._id,
            invitationType: 'factory-to-hhm'
        }).populate('hhmId', 'name email phone');

        console.log(`\n✅ Found ${invitations.length} factory-to-hhm invitations:\n`);

        invitations.forEach((inv, index) => {
            console.log(`${index + 1}. To: ${inv.hhmId?.name || 'Unknown HHM'}`);
            console.log(`   Status: ${inv.status}`);
            console.log(`   Message: ${inv.message || 'No message'}`);
            console.log(`   Created: ${inv.createdAt}`);
            console.log(`   Invitation ID: ${inv._id}`);
            console.log('');
        });

        // Check status counts
        const statusCounts = await Invitation.aggregate([
            {
                $match: {
                    factoryId: factory._id,
                    invitationType: 'factory-to-hhm'
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('📊 Status breakdown:');
        statusCounts.forEach(sc => {
            console.log(`   ${sc._id}: ${sc.count}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testFactoryInvitations();

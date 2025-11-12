const mongoose = require('mongoose');
const Invitation = require('./models/invitation.model');
const User = require('./models/user.model');

// Load environment variables
require('dotenv').config();

async function checkPendingInvitations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sugarcane-platform');
    console.log('✅ Connected to MongoDB\n');

    // Check all pending factory-to-hhm invitations
    const pendingInvitations = await Invitation.find({
      invitationType: 'factory-to-hhm',
      status: 'pending'
    }).populate('factoryId', 'factoryName name').populate('hhmId', 'name');

    console.log(`📋 Found ${pendingInvitations.length} pending factory-to-hhm invitations:\n`);

    if (pendingInvitations.length === 0) {
      console.log('✅ No pending invitations found. This is good - no conflicts should occur.\n');
    } else {
      pendingInvitations.forEach((invitation, index) => {
        console.log(`${index + 1}. Factory: ${invitation.factoryId?.factoryName || invitation.factoryId?.name || 'Unknown'}`);
        console.log(`   HHM: ${invitation.hhmId?.name || 'Unknown'}`);
        console.log(`   Created: ${invitation.createdAt}`);
        console.log(`   Expires: ${invitation.expiresAt}`);
        console.log(`   Message: ${invitation.personalMessage || 'No message'}\n`);
      });
    }

    // Check for any duplicate combinations that might cause conflicts
    console.log('🔍 Checking for potential duplicate combinations...\n');
    
    const duplicateCheck = await Invitation.aggregate([
      {
        $match: {
          invitationType: 'factory-to-hhm',
          status: 'pending'
        }
      },
      {
        $group: {
          _id: {
            factoryId: '$factoryId',
            hhmId: '$hhmId'
          },
          count: { $sum: 1 },
          invitations: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicateCheck.length > 0) {
      console.log('⚠️ Found duplicate pending invitations:');
      duplicateCheck.forEach(dup => {
        console.log(`  - Factory ${dup._id.factoryId} → HHM ${dup._id.hhmId}: ${dup.count} pending invitations`);
        console.log(`    Invitation IDs: ${dup.invitations.join(', ')}`);
      });
      
      console.log('\n🔧 You may need to clean up these duplicates to resolve conflicts.');
    } else {
      console.log('✅ No duplicate pending invitations found.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📝 MongoDB connection closed');
    }
  }
}

checkPendingInvitations();
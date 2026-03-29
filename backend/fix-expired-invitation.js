require('dotenv').config();
const mongoose = require('mongoose');
const Invitation = require('./models/invitation.model');

const fixExpiredInvitation = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the specific expired invitation
    const invitationId = '696336a0d26a69f6d6553d53';
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      console.log('❌ Invitation not found');
      process.exit(1);
    }

    console.log('📋 Found invitation:');
    console.log('   - Status:', invitation.status);
    console.log('   - Current expiresAt:', invitation.expiresAt);
    console.log('   - Invitation Type:', invitation.invitationType);

    // Set expiration to 30 days from now
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);

    // Update the invitation without triggering validation on expiresAt for old value
    await Invitation.updateOne(
      { _id: invitationId },
      { 
        $set: { expiresAt: newExpiresAt }
      }
    );

    console.log('✅ Updated invitation expiration to:', newExpiresAt);
    console.log('✅ Invitation can now be accepted!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixExpiredInvitation();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function debugPasswordIssue() {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://127.0.0.1:27017/agri", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('📡 Connected to database');

        // First, let's find the user
        const user = await User.findOne({ username: 'ravi_farmer' });
        console.log('📋 User found:', {
            id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            passwordExists: !!user.password,
            passwordType: typeof user.password,
            passwordValue: user.password ? 'HIDDEN' : 'NONE'
        });

        // Create a fresh password hash
        const plainPassword = 'ravi123';
        const saltRounds = 10;
        const newHash = await bcrypt.hash(plainPassword, saltRounds);
        console.log('🔐 Created new hash:', newHash.substring(0, 20) + '...');

        // Try direct MongoDB update using native driver
        const result = await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password: newHash } }
        );
        console.log('✅ Direct update result:', result);

        // Verify the update
        const updatedUser = await User.findById(user._id);
        console.log('🔍 After update verification:', {
            passwordExists: !!updatedUser.password,
            passwordType: typeof updatedUser.password,
            passwordLength: updatedUser.password ? updatedUser.password.length : 0
        });

        // Test bcrypt comparison
        if (updatedUser.password) {
            const isMatch = await bcrypt.compare(plainPassword, updatedUser.password);
            console.log('🔑 Password comparison result:', isMatch);

            if (isMatch) {
                console.log('🎉 SUCCESS: Password is working correctly!');
            } else {
                console.log('❌ FAILED: Password comparison failed');
            }
        } else {
            console.log('❌ ERROR: Password field is still missing');
        }

        await mongoose.connection.close();
        console.log('📡 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
    }
}

debugPasswordIssue();
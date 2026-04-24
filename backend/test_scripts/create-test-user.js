const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://127.0.0.1:27017/agri");
        console.log('📡 Connected to database');

        // Check if user already exists
        const existingUser = await User.findOne({ username: 'ravi_farmer' });
        if (existingUser) {
            console.log('🗑️ Removing existing user...');
            await User.deleteOne({ username: 'ravi_farmer' });
        }

        // Create password hash
        const plainPassword = 'ravi123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        console.log('🔐 Password hash created');

        // Create new user
        const newUser = new User({
            name: 'Ravi Patel',
            username: 'ravi_farmer',
            email: 'ravi@example.com',
            phone: '+1234567890',
            role: 'Farmer',
            password: hashedPassword,
            isActive: true
        });

        // Save user
        const savedUser = await newUser.save();
        console.log('✅ User created successfully:', {
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            phone: savedUser.phone,
            role: savedUser.role,
            isActive: savedUser.isActive,
            passwordExists: !!savedUser.password
        });

        // Test password immediately
        const userWithPassword = await User.findById(savedUser._id).select('+password');
        const isPasswordCorrect = await bcrypt.compare(plainPassword, userWithPassword.password);
        console.log('🔑 Password test result:', isPasswordCorrect);

        // Test login credentials (simulate the auth route logic)
        const testIdentifier = 'ravi_farmer';
        const testPassword = 'ravi123';

        const user = await User.findOne({
            $and: [
                { isActive: true },
                {
                    $or: [
                        { username: testIdentifier },
                        { email: testIdentifier },
                        { phone: testIdentifier }
                    ]
                }
            ]
        }).select('+password');

        if (user) {
            console.log('🔍 User found for login test');
            const isMatch = await bcrypt.compare(testPassword, user.password);
            console.log('🎯 Login test result:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
        } else {
            console.log('❌ User not found for login test');
        }

        await mongoose.connection.close();
        console.log('📡 Database connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
    }
}

createTestUser();
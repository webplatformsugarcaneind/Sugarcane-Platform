const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load Mongoose models
const User = require('./models/user.model');
const Profile = require('./models/profile.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createLabourProfiles = async () => {
  try {
    console.log('👥 Finding Labour users...'.blue);
    
    // Find all users with Labour role
    const labourUsers = await User.find({ role: 'Labour' });
    console.log(`✅ Found ${labourUsers.length} Labour users`.green);

    if (labourUsers.length === 0) {
      console.log('⚠️  No Labour users found. Please run the seeder first: node seeder.js'.yellow);
      process.exit();
    }

    // Create profiles for each Labour user
    for (const user of labourUsers) {
      // Check if profile already exists
      const existingProfile = await Profile.findOne({ userId: user._id });
      
      if (existingProfile) {
        console.log(`⏭️  Profile already exists for ${user.name} (${user.username})`.yellow);
        continue;
      }

      // Parse skills from user data (if stored as comma-separated string)
      let skills = [];
      if (user.skills) {
        if (typeof user.skills === 'string') {
          skills = user.skills.split(',').map(s => s.trim());
        } else if (Array.isArray(user.skills)) {
          skills = user.skills;
        }
      }

      // Parse experience from workExperience field
      let experience = 0;
      if (user.workExperience) {
        const match = user.workExperience.match(/(\d+)/);
        if (match) {
          experience = parseInt(match[1]);
        }
      }

      // Create profile
      const profile = await Profile.create({
        userId: user._id,
        farmLocation: user.location || 'Maharashtra',
        bio: user.workPreferences || 'Available for agricultural work',
        farmingExperience: experience,
        skills: skills,
        availabilityStatus: user.availability === 'Available' ? 'available' : 'unavailable',
        contactDetails: {
          phone: user.phone,
          email: user.email
        },
        isVerified: true,
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          privacy: {
            showPhone: true,
            showEmail: true,
            showLocation: true
          },
          language: 'english'
        }
      });

      console.log(`✅ Created profile for ${user.name} (${user.username})`.green);
      console.log(`   - Skills: ${skills.join(', ')}`.cyan);
      console.log(`   - Experience: ${experience} years`.cyan);
      console.log(`   - Status: ${profile.availabilityStatus}`.cyan);
    }

    console.log('\n✅ All Labour profiles created successfully!'.green.inverse);
    console.log('\n📊 Summary:'.yellow);
    const totalProfiles = await Profile.countDocuments();
    console.log(`   Total profiles in database: ${totalProfiles}`.cyan);
    
    const labourProfiles = await Profile.find({ userId: { $in: labourUsers.map(u => u._id) } });
    console.log(`   Labour profiles: ${labourProfiles.length}`.cyan);
    
    process.exit();
  } catch (err) {
    console.error(`❌ Error: ${err.message}`.red.inverse);
    console.error(err);
    process.exit(1);
  }
};

createLabourProfiles();

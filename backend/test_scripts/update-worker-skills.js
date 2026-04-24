const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');

async function updateWorkerProfilesWithSkills() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find all Worker users
    const workers = await User.find({ role: 'Labour' });
    console.log(`\nFound ${workers.length} Worker users`);

    // Update each worker's profile with skills
    for (const worker of workers) {
      const profile = await Profile.findOne({ userId: worker._id });
      
      if (profile) {
        // Get skills from user or use default
        const skills = worker.skills 
          ? worker.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : ['General Labor', 'Farm Work', 'Crop Harvesting', 'Manual Labor'];
        
        profile.skills = skills;
        await profile.save();
        
        console.log(`  ✓ Updated ${worker.name} (${worker.email})`);
        console.log(`    - skills: ${skills.join(', ')}`);
      } else {
        console.log(`  ✗ No profile found for ${worker.name} (${worker.email})`);
      }
    }

    console.log('\n✓ Worker profile skills updated!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

updateWorkerProfilesWithSkills();

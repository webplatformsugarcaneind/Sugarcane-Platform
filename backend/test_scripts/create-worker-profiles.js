const mongoose = require('mongoose');
const User = require('./models/user.model');
const Profile = require('./models/profile.model');

async function createWorkerProfiles() {
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

    if (workers.length === 0) {
      console.log('No Worker users found. Exiting...');
      process.exit(0);
    }

    // Check which workers already have profiles
    const existingProfiles = await Profile.find({
      userId: { $in: workers.map(w => w._id) }
    });

    console.log(`\nExisting profiles: ${existingProfiles.length}`);
    existingProfiles.forEach(p => {
      const worker = workers.find(w => w._id.equals(p.userId));
      console.log(`  - ${worker?.name} (${worker?.email}): availabilityStatus = ${p.availabilityStatus}`);
    });

    // Create profiles for workers who don't have one
    const workersWithoutProfile = workers.filter(worker => 
      !existingProfiles.some(profile => profile.userId.equals(worker._id))
    );

    console.log(`\n${workersWithoutProfile.length} workers need profiles`);

    if (workersWithoutProfile.length > 0) {
      for (const worker of workersWithoutProfile) {
        const profile = new Profile({
          userId: worker._id,
          role: 'Labour',
          availabilityStatus: 'available',
          skills: worker.skills ? worker.skills.split(',').map(s => s.trim()) : ['General Labor', 'Farm Work'],
          workerProfile: {
            experience: 2,
            preferredLocations: ['Local area'],
            availability: {
              monday: { available: true, startTime: '08:00', endTime: '17:00' },
              tuesday: { available: true, startTime: '08:00', endTime: '17:00' },
              wednesday: { available: true, startTime: '08:00', endTime: '17:00' },
              thursday: { available: true, startTime: '08:00', endTime: '17:00' },
              friday: { available: true, startTime: '08:00', endTime: '17:00' },
              saturday: { available: true, startTime: '08:00', endTime: '17:00' },
              sunday: { available: false }
            },
            expectedWageRange: {
              min: 300,
              max: 500
            },
            certifications: [],
            languages: ['English', 'Hindi'],
            totalApplications: 0,
            acceptedJobs: 0,
            rejectedApplications: 0,
            averageRating: 0
          }
        });

        await profile.save();
        console.log(`  ✓ Created profile for ${worker.name} (${worker.email})`);
      }
    }

    // Update existing profiles to ensure availabilityStatus is 'available'
    const profilesToUpdate = existingProfiles.filter(p => p.availabilityStatus !== 'available');
    
    if (profilesToUpdate.length > 0) {
      console.log(`\n${profilesToUpdate.length} profiles need availabilityStatus update`);
      for (const profile of profilesToUpdate) {
        profile.availabilityStatus = 'available';
        await profile.save();
        const worker = workers.find(w => w._id.equals(profile.userId));
        console.log(`  ✓ Updated ${worker?.name} (${worker?.email}) to 'available'`);
      }
    }

    // Verify final state
    console.log('\n=== FINAL STATE ===');
    const allProfiles = await Profile.find({
      userId: { $in: workers.map(w => w._id) }
    });

    console.log(`\nTotal Worker Profiles: ${allProfiles.length}/${workers.length}`);
    for (const worker of workers) {
      const profile = allProfiles.find(p => p.userId.equals(worker._id));
      if (profile) {
        console.log(`  ✓ ${worker.name} (${worker.email})`);
        console.log(`    - availabilityStatus: ${profile.availabilityStatus}`);
        console.log(`    - skills: ${profile.skills?.join(', ') || 'None'}`);
      } else {
        console.log(`  ✗ ${worker.name} (${worker.email}) - NO PROFILE`);
      }
    }

    console.log('\n✓ Worker profiles setup complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createWorkerProfiles();

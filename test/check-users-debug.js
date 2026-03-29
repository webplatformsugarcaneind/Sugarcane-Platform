const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sugarcane-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  name: String,
  phone: String,
  skills: String,
  workExperience: String,
  wageRate: String,
  availability: String,
  workPreferences: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...\n');
    
    const users = await User.find({}).select('-password');
    console.log('👥 Total users found:', users.length);
    
    // Check for worker/labour users
    const workers = users.filter(u => ['Worker', 'Labour'].includes(u.role));
    console.log('👷 Worker/Labour users:', workers.length);
    
    workers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.name || 'No name'} (${user.username}) - ${user.email} - Role: ${user.role}`);
    });
    
    // Look specifically for Meena
    console.log('\n🔍 Looking for Meena Kumari...');
    const meena = await User.findOne({
      $or: [
        { username: 'meenalabour' },
        { email: 'meena.kumari@example.com' },
        { name: /meena/i }
      ]
    }).select('-password');
    
    if (meena) {
      console.log('✅ Found Meena:', {
        name: meena.name,
        username: meena.username,
        email: meena.email,
        role: meena.role,
        skills: meena.skills,
        isActive: meena.isActive
      });
    } else {
      console.log('❌ Meena not found in database');
      
      // Create Meena for testing
      console.log('🔧 Creating Meena Kumari user...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const newMeena = new User({
        username: 'meenalabour',
        email: 'meena.kumari@example.com',
        password: hashedPassword,
        role: 'Labour',
        name: 'Meena Kumari',
        phone: '9876543215',
        skills: 'Harvesting, Sorting, Packaging, Quality inspection',
        workExperience: '4 years in farm operations',
        wageRate: '₹300 per day',
        availability: 'Available',
        workPreferences: 'Part-time, Flexible hours, Seasonal work'
      });
      
      await newMeena.save();
      console.log('✅ Created Meena Kumari user successfully');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n🔚 Database connection closed');
  }
}

checkUsers();
/**
 * seed-atlas.js  –  Master seeder for MongoDB Atlas
 *
 * Run:   node seed-atlas.js
 * Wipe:  node seed-atlas.js --destroy
 *
 * Seeds:
 *   • Users  (Farmers, Factories, HHMs, Labour)
 *   • Crop Listings  (linked to seeded Farmers)
 *   • HHM profile patches  (location / teamSize / managementExperience)
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ── Models ──────────────────────────────────────────────────────────────────
const User        = require('./models/user.model');
const CropListing = require('./models/cropListing.model');

// ── Helpers ──────────────────────────────────────────────────────────────────
const log = {
  info:    (m) => console.log(`\x1b[34m${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m${m}\x1b[0m`),
  warn:    (m) => console.log(`\x1b[33m${m}\x1b[0m`),
  error:   (m) => console.error(`\x1b[31m${m}\x1b[0m`),
  cyan:    (m) => console.log(`\x1b[36m${m}\x1b[0m`),
};

// ── Seed Data ─────────────────────────────────────────────────────────────────
const USERS = [
  // ── Farmers ──
  {
    name: 'Ravi Patel', username: 'ravifarmer', phone: '9876543210',
    email: 'ravi.patel@example.com', role: 'Farmer', password: '123456',
    location: 'Nashik, Maharashtra', farmSize: '25 acres',
    farmingExperience: '12 years',
    farmingMethods: 'Organic farming, Drip irrigation, Crop rotation',
    equipment: 'Tractor, Harvester, Irrigation pumps, Spraying equipment',
    certifications: 'Organic Farming Certificate, Good Agricultural Practices (GAP)',
    cropTypes: 'Sugarcane, Rice, Wheat', irrigationType: 'drip',
  },
  {
    name: 'Prakash Joshi', username: 'prakashfarmer', phone: '9876543200',
    email: 'prakash.joshi@example.com', role: 'Farmer', password: '123456',
    location: 'Pune, Maharashtra', farmSize: '40 acres',
    farmingExperience: '18 years',
    farmingMethods: 'Traditional farming, Integrated pest management',
    equipment: 'Tractor, Ploughs, Seed drill, Threshing machine',
    certifications: 'Agricultural Diploma, Pesticide License',
  },
  {
    name: 'Kavita Desai', username: 'kavitafarmer', phone: '9876541111',
    email: 'kavita.desai@example.com', role: 'Farmer', password: '123456',
    location: 'Kolhapur, Maharashtra', farmSize: '30 acres',
    farmingExperience: '10 years',
    farmingMethods: 'Mixed farming, Rain-fed agriculture',
    equipment: 'Tractor, Hand tools, Sprayer',
    certifications: 'GAP Certificate',
  },
  {
    name: 'Suresh Patil', username: 'sureshfarmer', phone: '9876542222',
    email: 'suresh.patil@example.com', role: 'Farmer', password: '123456',
    location: 'Sangli, Maharashtra', farmSize: '50 acres',
    farmingExperience: '20 years',
    farmingMethods: 'Intensive farming, Drip irrigation',
    equipment: 'Tractor, Harvester, Irrigation system',
    certifications: 'Organic Certificate, APEDA Registration',
  },

  // ── HHMs ──
  {
    name: 'Sunita Sharma', username: 'sunitahhm', phone: '9876543211',
    email: 'sunita.sharma@example.com', role: 'HHM', password: '123456',
    location: 'Suryapet, Telangana', managementExperience: '8',
    teamSize: '15', managementOperations: 'Worker coordination, Task scheduling, Quality control, Safety supervision',
    servicesOffered: 'Labour contracting, Equipment rental, Field supervision, Training services',
  },
  {
    name: 'Vikram Singh', username: 'vikramhhm', phone: '9876543214',
    email: 'vikram.singh@example.com', role: 'HHM', password: '123456',
    location: 'Nalgonda, Telangana', managementExperience: '12',
    teamSize: '28', managementOperations: 'Large scale operations, Multi-field coordination, Machinery management, Budget planning',
    servicesOffered: 'Complete farm management, Mechanized harvesting, Worker training, Technical consultation',
  },
  {
    name: 'Sunil Kumar', username: 'sunilhhm', phone: '9876543219',
    email: 'sunil.kumar@example.com', role: 'HHM', password: '123456',
    location: 'Karimnagar, Telangana', managementExperience: '15',
    teamSize: '32', managementOperations: 'Strategic planning, Multi-farm coordination, Technology integration, Performance monitoring',
    servicesOffered: 'Enterprise farm management, Advanced mechanization, Leadership training, Business consultation',
  },

  // ── Labour ──
  {
    name: 'Amit Kumar', username: 'amitlabour', phone: '9876543212',
    email: 'amit.kumar@example.com', role: 'Labour', password: '123456',
    skills: 'Sugarcane cutting, Field preparation, Irrigation, Equipment operation',
    workPreferences: 'Full-time, Day shifts, Outdoor work',
    wageRate: '₹350 per day', availability: 'Available',
    workExperience: '6 years in agricultural work',
  },
  {
    name: 'Meena Kumari', username: 'meenalabour', phone: '9876543215',
    email: 'meena.kumari@example.com', role: 'Labour', password: '123456',
    skills: 'Harvesting, Sorting, Packaging, Quality inspection',
    workPreferences: 'Part-time, Flexible hours, Seasonal work',
    wageRate: '₹300 per day', availability: 'Available',
    workExperience: '4 years in farm operations',
  },

  // ── Factories ──
  {
    name: 'Priya Singh', username: 'priyafactory', phone: '9876543213',
    email: 'priya.singh@example.com', role: 'Factory', password: '123456',
    factoryName: 'Maharashtra Sugar Mills',
    factoryLocation: 'Pune, Maharashtra',
    factoryDescription: 'Leading sugar processing facility with state-of-the-art technology and sustainable practices.',
    capacity: '2500 TCD', experience: '15 years',
    specialization: 'Sugar Processing, Ethanol Production',
    contactInfo: { website: 'https://maharashtrasugar.com', fax: '+91-20-12345678' },
    operatingSeason: 'October to March', crushingStatus: 'ON',
  },
  {
    name: 'Rajesh Patel', username: 'rajeshfactory', phone: '9876543216',
    email: 'rajesh.patel@example.com', role: 'Factory', password: '123456',
    factoryName: 'Golden Sugarcane Industries',
    factoryLocation: 'Mumbai, Maharashtra',
    factoryDescription: 'Modern sugar mill focused on high-quality production and farmer partnerships.',
    capacity: '1800 TCD', experience: '12 years',
    specialization: 'White Sugar, Bagasse Power Generation',
    contactInfo: { website: 'https://goldensugarcane.com', fax: '+91-22-98765432' },
    operatingSeason: 'October to March', crushingStatus: 'OFF',
  },
  {
    name: 'Deepak Sharma', username: 'deepakfactory', phone: '9876543217',
    email: 'deepak.sharma@example.com', role: 'Factory', password: '123456',
    factoryName: 'Sunrise Sugar Corporation',
    factoryLocation: 'Nashik, Maharashtra',
    factoryDescription: 'Innovative sugar factory specializing in organic sugar production and renewable energy solutions.',
    capacity: '3200 TCD', experience: '20 years',
    specialization: 'Organic Sugar, Bio-fertilizer Production',
    contactInfo: { website: 'https://sunrisesugar.co.in', landline: '+91-253-2345678' },
    operatingSeason: 'October to March', crushingStatus: 'ON',
  },
  {
    name: 'Anita Joshi', username: 'anitafactory', phone: '9876543218',
    email: 'anita.joshi@example.com', role: 'Factory', password: '123456',
    factoryName: 'Green Valley Sugar Mills',
    factoryLocation: 'Kolhapur, Maharashtra',
    factoryDescription: 'Eco-friendly sugar processing plant committed to sustainable practices and community development.',
    capacity: '2800 TCD', experience: '18 years',
    specialization: 'Raw Sugar, Molasses Processing, Green Energy',
    contactInfo: { website: 'https://greenvalleysugar.com', tollfree: '1800-123-4567' },
    operatingSeason: 'October to March', crushingStatus: 'ON',
  },
];

// ── Crop Listings factory fn (needs real farmer IDs) ──────────────────────────
const buildListings = (farmers) => [
  {
    farmer_id: farmers[0]._id, status: 'active',
    title: 'Premium Co 86032 Sugarcane - Certified Quality',
    sugarcane_variety: 'Co 86032',
    seed_quality: { disease_free_status: 'Certified Disease-Free', certification_details: 'Maharashtra Agricultural Development Trust certified' },
    crop_age: 10, germination_percentage: 95, seed_type: '3-Bud Setts',
    quantity_available: { value: 50, unit: 'gunthas' },
    price_details: { price_per_unit: 2800, price_negotiable: true, minimum_order_quantity: 5 },
    delivery_location: 'Nashik, Maharashtra',
    delivery_timeframe: { available_from: new Date('2026-03-10'), available_until: new Date('2026-12-30'), preferred_delivery_time: 'Morning (6AM-12PM)' },
  },
  {
    farmer_id: farmers[1]?._id ?? farmers[0]._id, status: 'active',
    title: 'Organic Co 0238 Sugarcane - Premium Grade',
    sugarcane_variety: 'Co 0238',
    seed_quality: { disease_free_status: 'Tested Healthy', certification_details: 'Organic India certified, pesticide-free' },
    crop_age: 8, germination_percentage: 92, seed_type: '2-Bud Setts',
    quantity_available: { value: 75, unit: 'gunthas' },
    price_details: { price_per_unit: 3200, price_negotiable: true, minimum_order_quantity: 10 },
    delivery_location: 'Pune, Maharashtra',
    delivery_timeframe: { available_from: new Date('2026-03-15'), available_until: new Date('2026-12-15'), preferred_delivery_time: 'Flexible' },
  },
  {
    farmer_id: farmers[2]?._id ?? farmers[0]._id, status: 'active',
    title: 'High-Yield Co 62175 Variety - Bulk Available',
    sugarcane_variety: 'Co 62175',
    seed_quality: { disease_free_status: 'Standard Quality', certification_details: '' },
    crop_age: 12, germination_percentage: 88, seed_type: 'Mixed Setts',
    quantity_available: { value: 120, unit: 'gunthas' },
    price_details: { price_per_unit: 2600, price_negotiable: false, minimum_order_quantity: 20 },
    delivery_location: 'Kolhapur, Maharashtra',
    delivery_timeframe: { available_from: new Date('2026-03-20'), available_until: new Date('2026-12-25'), preferred_delivery_time: 'Afternoon (12PM-6PM)' },
  },
  {
    farmer_id: farmers[3]?._id ?? farmers[0]._id, status: 'active',
    title: 'Fresh Co 06022 - Direct from Farm',
    sugarcane_variety: 'Co 06022',
    seed_quality: { disease_free_status: 'Certified Disease-Free', certification_details: 'Government agricultural officer verified' },
    crop_age: 9, germination_percentage: 93, seed_type: '3-Bud Setts',
    quantity_available: { value: 35, unit: 'gunthas' },
    price_details: { price_per_unit: 2900, price_negotiable: true, minimum_order_quantity: 5 },
    delivery_location: 'Sangli, Maharashtra',
    delivery_timeframe: { available_from: new Date('2026-03-25'), available_until: new Date('2026-12-20'), preferred_delivery_time: 'Morning (6AM-12PM)' },
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) { log.error('❌ MONGO_URI not found in .env'); process.exit(1); }

  log.info(`\n🔌 Connecting to MongoDB Atlas…`);
  await mongoose.connect(MONGO_URI);
  log.success('✅ Connected!\n');

  // ── DESTROY mode ──────────────────────────────────────────────────────────
  if (process.argv.includes('--destroy')) {
    log.warn('🗑  Destroying all data…');
    await User.deleteMany({});
    await CropListing.deleteMany({});
    log.success('✅ All data wiped.');
    await mongoose.disconnect();
    return;
  }

  // ── SEED mode ─────────────────────────────────────────────────────────────
  log.warn('🗑  Clearing existing Users & Crop Listings…');
  await User.deleteMany({});
  await CropListing.deleteMany({});

  // 1. Insert Users
  log.info('👥 Inserting users…');
  const created = await User.create(USERS);

  const farmers  = created.filter(u => u.role === 'Farmer');
  const hhms     = created.filter(u => u.role === 'HHM');
  const labour   = created.filter(u => u.role === 'Labour');
  const factories= created.filter(u => u.role === 'Factory');

  log.cyan(`   👨‍🌾 Farmers   : ${farmers.length}`);
  log.cyan(`   🏭 Factories : ${factories.length}`);
  log.cyan(`   👥 HHMs      : ${hhms.length}`);
  log.cyan(`   👷 Labour    : ${labour.length}`);
  log.success(`✅ ${created.length} users inserted.\n`);

  // 2. Insert Crop Listings
  log.info('📋 Creating crop listings…');
  const listings = buildListings(farmers);
  const createdListings = await CropListing.create(listings);
  createdListings.forEach((l, i) => {
    const f = farmers.find(x => x._id.toString() === l.farmer_id.toString());
    log.cyan(`   ${i+1}. "${l.title}"`);
    log.cyan(`      Farmer: ${f?.name}  |  Qty: ${l.quantity_available.value} ${l.quantity_available.unit}  |  ₹${l.price_details.price_per_unit}/unit`);
  });
  log.success(`✅ ${createdListings.length} crop listings inserted.\n`);

  // 3. Summary
  console.log('─────────────────────────────────────────────────');
  log.success('🎉 Database seeded successfully!');
  console.log('─────────────────────────────────────────────────');
  console.log('\n📝 Login credentials (all passwords: 123456)');
  console.log('┌─────────────────────────────┬────────────────────────────────────┐');
  console.log('│ Role     │ Email                              │');
  console.log('├─────────────────────────────┼────────────────────────────────────┤');
  created.forEach(u => {
    const role = u.role.padEnd(9);
    const email = u.email.padEnd(34);
    console.log(`│ ${role} │ ${email} │`);
  });
  console.log('└─────────────────────────────┴────────────────────────────────────┘');

  await mongoose.disconnect();
  log.info('\n🔌 Disconnected from MongoDB Atlas.');
}

seed().catch(err => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});

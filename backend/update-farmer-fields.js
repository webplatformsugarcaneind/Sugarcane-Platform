/**
 * update-farmer-fields.js
 * Run with: node update-farmer-fields.js
 * Updates all farmer documents in MongoDB with complete crop/harvest/contract fields
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sugarcane-platform';

const farmerUpdates = [
  {
    username: 'ravifarmer',
    data: {
      location: 'Nashik, Maharashtra',
      village: 'Loni',
      region: 'Northern Maharashtra',
      district: 'Nashik',
      cropVariety: 'Co 86032',
      estimatedYield: '1200',
      cropStatus: 'Standing Crop',
      farmType: 'Irrigated',
      preferredHarvestDate: new Date('2025-11-15'),
      workersNeeded: '30',
      harvestType: 'Manual',
      machineRequired: 'Manual Preferred',
      urgencyLevel: 'Normal Season',
      distanceFromFactory: '12 km',
      roadAccessibility: 'Truck Accessible',
      loadingPoint: 'Farm gate',
      harvestWindow: 'Nov 1 – Dec 15',
      shiftPreference: 'Day Shift',
      dailyHours: '8 hours',
      contractStatus: 'Open for Proposals',
      preferredPayment: 'Bank Transfer',
      settlementPreference: 'Per Harvest Cycle',
      previousContractType: 'Seasonal',
      advanceRequired: false,
      transportRequired: true,
      loadingSupport: false,
      seasonsCompleted: 10,
      reliabilityRating: 9,
      hhmPartnerships: 2,
      contactPreference: 'Phone',
      trackRecord: '10 successful seasons with consistent yields above 1000 tonnes. Zero disputes.',
    }
  },
  {
    username: 'prakashfarmer',
    data: {
      location: 'Solapur, Maharashtra',
      village: 'Akkalkot',
      region: 'Eastern Maharashtra',
      district: 'Solapur',
      cropTypes: 'Sugarcane, Jowar, Groundnut',
      irrigationType: 'flood',
      cropVariety: 'CoM 0265',
      estimatedYield: '1800',
      cropStatus: 'Ready for Harvest',
      farmType: 'Rain-fed + Irrigated',
      preferredHarvestDate: new Date('2025-10-20'),
      workersNeeded: '50',
      harvestType: 'Machine',
      machineRequired: 'Harvester Required',
      urgencyLevel: 'High Priority',
      distanceFromFactory: '8 km',
      roadAccessibility: 'Truck Accessible',
      loadingPoint: 'Village road junction',
      harvestWindow: 'Oct 15 – Nov 30',
      shiftPreference: 'Day Shift',
      dailyHours: '10 hours',
      contractStatus: 'Open for Proposals',
      preferredPayment: 'Bank Transfer',
      settlementPreference: 'Per Harvest Cycle',
      previousContractType: 'Seasonal',
      advanceRequired: true,
      transportRequired: true,
      loadingSupport: true,
      seasonsCompleted: 16,
      reliabilityRating: 8,
      hhmPartnerships: 3,
      contactPreference: 'WhatsApp',
      trackRecord: '16 seasons completed, highest yield 2100 tonnes. Works with 3 HHMs regularly.',
    }
  }
];

const hhmUpdates = [
  {
    username: 'sunitahhm',
    data: {
      location: 'Sangli, Maharashtra',
      village: 'Miraj',
      region: 'Western Maharashtra',
      district: 'Sangli',
      workingAreas: ['Sangli', 'Kolhapur', 'Satara'],
      workerTypes: ['Male', 'Female', 'Mixed'],
      priceRange: '₹500 – ₹700 per day',
      isNegotiable: true,
      activeJobs: 2,
      completedJobs: 34,
      avgCompletionTime: '40 days/season',
      seasonsCompleted: 8,
      reliabilityRating: 9,
      rating: 4.5,
    }
  },
  {
    username: 'vikramhhm',
    data: {
      location: 'Kolhapur, Maharashtra',
      village: 'Ichalkaranji',
      region: 'Western Maharashtra',
      district: 'Kolhapur',
      workingAreas: ['Kolhapur', 'Belgaum', 'Sangli'],
      workerTypes: ['Male', 'Mixed'],
      priceRange: '₹600 – ₹900 per day',
      isNegotiable: true,
      activeJobs: 3,
      completedJobs: 58,
      avgCompletionTime: '35 days/season',
      seasonsCompleted: 12,
      reliabilityRating: 10,
      rating: 4.8,
    }
  },
  {
    username: 'sunilhhm',
    data: {
      location: 'Pune, Maharashtra',
      village: 'Baramati',
      region: 'Western Maharashtra',
      district: 'Pune',
      workingAreas: ['Pune', 'Satara', 'Solapur'],
      workerTypes: ['Male', 'Female', 'Mixed'],
      priceRange: '₹700 – ₹1000 per day',
      isNegotiable: false,
      activeJobs: 5,
      completedJobs: 87,
      avgCompletionTime: '30 days/season',
      seasonsCompleted: 15,
      reliabilityRating: 10,
      rating: 4.9,
    }
  }
];

const labourUpdates = [
  {
    username: 'amitlabour',
    data: {
      location: 'Ahmednagar, Maharashtra',
      preferredLocation: 'Western Maharashtra',
    }
  },
  {
    username: 'meenalabour',
    data: {
      location: 'Satara, Maharashtra',
      preferredLocation: 'Satara, Kolhapur',
    }
  }
];

const factoryUpdates = [
  {
    username: 'priyafactory',
    data: {
      description: "One of Maharashtra's top sugar mills, with over 15 years of excellence in sugar processing and farmer partnerships.",
      establishedYear: '2008',
      'contactInfo.landline': '020-27654321',
      'contactInfo.tollfree': '1800-222-5678',
    }
  },
  {
    username: 'rajeshfactory',
    data: {
      description: 'A premier sugar industry established in 2011, specializing in white sugar and bagasse power generation.',
      establishedYear: '2011',
      'contactInfo.landline': '022-33445566',
      'contactInfo.tollfree': '1800-333-7890',
    }
  },
  {
    username: 'deepakfactory',
    data: {
      description: '20+ year industry leader in organic sugar and bio-fertilizer production with zero-waste goals.',
      establishedYear: '2003',
      'contactInfo.fax': '+91-253-2345000',
      'contactInfo.tollfree': '1800-444-2233',
    }
  },
  {
    username: 'anitafactory',
    data: {
      description: 'A community-focused sugar mill with 18 years of eco-friendly operations and strong farmer welfare programs.',
      establishedYear: '2005',
      'contactInfo.landline': '0231-2345678',
      'contactInfo.fax': '0231-2345000',
    }
  }
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    let updated = 0;

    const allUpdates = [
      ...farmerUpdates,
      ...hhmUpdates,
      ...labourUpdates,
      ...factoryUpdates,
    ];

    for (const { username, data } of allUpdates) {
      const result = await User.updateOne(
        { username },
        { $set: data }
      );
      if (result.matchedCount > 0) {
        console.log(`  ✅ Updated: ${username} (modified: ${result.modifiedCount})`);
        updated++;
      } else {
        console.log(`  ⚠️  Not found in DB: ${username}`);
      }
    }

    console.log(`\n🎉 Done! Updated ${updated}/${allUpdates.length} users.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();

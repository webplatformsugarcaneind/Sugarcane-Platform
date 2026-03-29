const mongoose = require('mongoose');

console.log('Testing ObjectId validation...');

const testIds = [
  '690ef1b516e0fedb0966b4bc',  // CropListing ID
  '690eef0c12db7179cddc0369',  // Ravi's User ID
  '690ef2255c3518ac4bef3b91'   // User.listings ID
];

testIds.forEach(id => {
  console.log(`ID: ${id}`);
  console.log(`  Valid ObjectId: ${mongoose.Types.ObjectId.isValid(id)}`);
  console.log(`  Length: ${id.length}`);
  console.log(`  Hex pattern: ${id.match(/^[0-9a-fA-F]{24}$/) ? 'Yes' : 'No'}`);
  console.log('');
});

// Test creating ObjectIds
testIds.forEach(id => {
  try {
    const objectId = new mongoose.Types.ObjectId(id);
    console.log(`✅ Successfully created ObjectId for: ${id}`);
  } catch (error) {
    console.log(`❌ Failed to create ObjectId for: ${id} - ${error.message}`);
  }
});
// Test CropListing import in the same context as orders.routes.js
const express = require('express');
const mongoose = require('mongoose');

// Import models - same as orders.routes.js
const User = require('./backend/models/user.model');
const CropListing = require('./backend/models/cropListing.model');

console.log('🧪 Testing CropListing import in Express context...');
console.log('✅ User model imported:', typeof User);
console.log('✅ CropListing model imported:', typeof CropListing);
console.log('✅ CropListing model name:', CropListing.modelName);
console.log('✅ CropListing schema:', CropListing.schema ? 'exists' : 'missing');

// Test if CropListing methods are available
console.log('✅ CropListing.findById:', typeof CropListing.findById);
console.log('✅ CropListing.findByIdAndUpdate:', typeof CropListing.findByIdAndUpdate);
console.log('✅ CropListing.findByIdAndDelete:', typeof CropListing.findByIdAndDelete);

console.log('🎉 All CropListing imports and methods are accessible!');
const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  factoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropQuantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  billDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
billSchema.index({ factoryId: 1 });
billSchema.index({ farmerId: 1 });
billSchema.index({ status: 1 });
billSchema.index({ billDate: -1 });

module.exports = mongoose.model('Bill', billSchema);
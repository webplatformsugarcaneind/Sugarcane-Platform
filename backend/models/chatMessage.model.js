const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  userRole: {
    type: String,
    enum: ['Farmer', 'HHM', 'Worker', 'Factory', 'Public'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  metadata: {
    tokens: Number,
    model: String,
    temperature: Number,
    responseTime: Number
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  feedback: {
    rating: {
      type: Number,
      enum: [0, 1],
      default: null
    },
    comment: String
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Compound index for fast retrieval
chatMessageSchema.index({ userId: 1, sessionId: 1 });
chatMessageSchema.index({ createdAt: -1 });
chatMessageSchema.index({ userRole: 1 });

// TTL index: auto-delete after 30 days (2592000 seconds)
chatMessageSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000, sparse: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

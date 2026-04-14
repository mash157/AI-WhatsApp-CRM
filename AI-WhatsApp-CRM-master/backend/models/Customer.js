const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  whatsappPhone: {
    type: String,
  },
  email: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  tags: [String],
  segments: [String],
  lastInteraction: {
    type: Date,
  },
  interactionCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked', 'lead', 'customer'],
    default: 'lead',
  },
  whatsappApproved: {
    type: Boolean,
    default: true,
  },
  metadata: {
    location: String,
    source: String,
    customFields: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);

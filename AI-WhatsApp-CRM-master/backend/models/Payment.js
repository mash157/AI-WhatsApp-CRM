const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    unique: true,
  },
  paymentId: String,
  signature: String,
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'card'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  subscriptionPeriod: {
    startDate: Date,
    endDate: Date,
    durationMonths: {
      type: Number,
      default: 1,
    },
  },
  metadata: {
    platform: String,
    ipAddress: String,
    userAgent: String,
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

module.exports = mongoose.model('Payment', paymentSchema);

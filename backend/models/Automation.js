const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['followup', 'booking_reminder', 'payment_reminder', 'trial_expiry', 'custom'],
    required: true,
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  trigger: {
    event: {
      type: String,
      enum: ['user_inactive', 'booking_upcoming', 'payment_pending', 'trial_expiring', 'message_received'],
      required: true,
    },
    timeDelay: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days'],
        default: 'hours',
      },
    },
    condition: String,
  },
  action: {
    type: {
      type: String,
      enum: ['send_message', 'send_email', 'send_sms', 'send_whatsapp', 'webhook'],
      required: true,
    },
    message: String,
    template: String,
    recipient: String,
    webhookUrl: String,
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once',
    },
    runAt: String, // cron expression or time
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  stats: {
    executionsCompleted: {
      type: Number,
      default: 0,
    },
    executionsFailed: {
      type: Number,
      default: 0,
    },
    lastRun: Date,
    nextRun: Date,
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

module.exports = mongoose.model('Automation', automationSchema);

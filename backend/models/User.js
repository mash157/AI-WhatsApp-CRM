const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isDeveloper: {
    type: Boolean,
    default: false, // Developers have unlimited access
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'max', 'extension'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  trial: {
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    },
    daysRemaining: {
      type: Number,
      default: 3,
    },
  },
  usage: {
    chatMessages: {
      type: Number,
      default: 0,
    },
    maxChatMessages: {
      type: Number,
      default: 100, // Free plan limit
    },
    voiceRequests: {
      type: Number,
      default: 0,
    },
    maxVoiceRequests: {
      type: Number,
      default: 50,
    },
    whatsappMessages: {
      type: Number,
      default: 0,
    },
    maxWhatsappMessages: {
      type: Number,
      default: 1000,
    },
    automations: {
      type: Number,
      default: 0,
    },
    maxAutomations: {
      type: Number,
      default: 5, // Free plan limit
    },
    contacts: {
      type: Number,
      default: 0,
    },
    maxContacts: {
      type: Number,
      default: 10, // Free plan limit
    },
    resetDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Monthly reset
    },
  },
  whatsappConfig: {
    phoneId: String,
    accessToken: String,
    businessAccountId: String,
    isConnected: {
      type: Boolean,
      default: false,
    },
  },
  automationEnabled: {
    type: Boolean,
    default: true,
  },
  paymentMethods: [
    {
      type: {
        type: String,
        enum: ['razorpay', 'stripe', 'card'],
      },
      customerId: String,
      cardLast4: String,
      isDefault: Boolean,
    },
  ],
  preferences: {
    language: {
      type: String,
      default: 'en',
    },
    toneOfVoice: {
      type: String,
      default: 'professional',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to check if user has exceeded limits
userSchema.methods.hasExceededLimits = function() {
  if (this.isDeveloper) return false; // Developers have unlimited access
  if (this.trial.isActive) return false; // Trial users have limits set
  return this.usage.chatMessages >= this.usage.maxChatMessages ||
         this.usage.voiceRequests >= this.usage.maxVoiceRequests;
};

module.exports = mongoose.model('User', userSchema);

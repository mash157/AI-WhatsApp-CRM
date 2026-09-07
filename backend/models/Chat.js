const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  conversationId: {
    type: String,
    unique: true,
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      tone: String,
      language: {
        type: String,
        default: 'en',
      },
    },
  ],
  metadata: {
    source: {
      type: String,
      enum: ['whatsapp', 'web', 'api', 'voice'],
      default: 'web',
    },
    platform: String,
    sessionId: String,
  },
  ai: {
    model: {
      type: String,
      default: 'gemini-pro',
    },
    temperature: {
      type: Number,
      default: 0.7,
    },
    systemPrompt: String,
  },
  isActive: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model('Chat', chatSchema);

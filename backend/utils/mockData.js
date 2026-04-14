// In-memory storage for mock mode (when MongoDB is not available)
let mockUsers = [];
let mockChats = [];

// Generate simple ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Hash password (simple mock version - DO NOT USE IN PRODUCTION)
const mockHashPassword = (password) => {
  return Buffer.from(password).toString('base64');
};

// Compare password (simple mock version - DO NOT USE IN PRODUCTION)
const mockComparePassword = (plainPassword, hashedPassword) => {
  return mockHashPassword(plainPassword) === hashedPassword;
};

// Mock User class to mimic Mongoose User model
class MockUser {
  constructor(data) {
    this._id = generateId();
    this.email = data.email || '';
    this.password = mockHashPassword(data.password || '');
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.company = data.company || '';
    this.role = data.role || 'user';
    this.isDeveloper = data.isDeveloper || false;
    this.createdAt = new Date();
    this.trial = {
      isActive: true,
      daysRemaining: 7,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
    this.subscription = {
      plan: 'free',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: true,
    };
    this.usage = {
      chatMessages: 0,
      maxChatMessages: data.isDeveloper ? 99999 : 100,
      voiceRequests: 0,
      maxVoiceRequests: data.isDeveloper ? 99999 : 50,
    };
  }

  async save() {
    mockUsers.push(this);
    return this;
  }

  async comparePassword(plainPassword) {
    return mockComparePassword(plainPassword, this.password);
  }

  toJSON() {
    const obj = { ...this };
    delete obj.password;
    return obj;
  }
}

// Mock User model with static methods
const MockUserModel = {
  async findOne(query) {
    if (query.email) {
      return mockUsers.find(u => u.email === query.email) || null;
    }
    if (query._id) {
      return mockUsers.find(u => u._id === query._id) || null;
    }
    return null;
  },

  async findById(id) {
    return mockUsers.find(u => u._id === id) || null;
  },

  async create(data) {
    const user = new MockUser(data);
    await user.save();
    return user;
  },

  new(data) {
    return new MockUser(data);
  },
};

// Mock Chat
class MockChat {
  constructor(data) {
    this._id = generateId();
    this.customerId = data.customerId || '';
    this.message = data.message || '';
    this.response = data.response || '';
    this.timestamp = new Date();
    this.conversationId = data.conversationId || generateId();
  }

  async save() {
    mockChats.push(this);
    return this;
  }
}

// Get all mock data
const getAllMockData = () => ({
  users: mockUsers,
  chats: mockChats,
  timestamp: new Date(),
});

// Clear mock data
const clearMockData = () => {
  mockUsers = [];
  mockChats = [];
};

module.exports = {
  MockUser,
  MockUserModel,
  MockChat,
  getAllMockData,
  clearMockData,
  generateId,
  mockHashPassword,
  mockComparePassword,
};

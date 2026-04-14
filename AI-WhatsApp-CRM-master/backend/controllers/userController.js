const User = require('../models/User');
const Customer = require('../models/Customer');
const { canAddContact, updateUserLimits } = require('../utils/planLimits');

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('❌ Get Profile Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        preferences: { ...user.preferences, ...preferences },
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Usage Stats
exports.getUsageStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usagePercentage = {
      chat: (user.usage.chatMessages / user.usage.maxChatMessages) * 100,
      voice: (user.usage.voiceRequests / user.usage.maxVoiceRequests) * 100,
      whatsapp: (user.usage.whatsappMessages / user.usage.maxWhatsappMessages) * 100,
    };

    res.status(200).json({
      usage: user.usage,
      usagePercentage,
      trial: user.trial,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error('❌ Get Usage Stats Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Trial Status
exports.getTrialStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const daysRemaining = Math.ceil((user.trial.endDate - new Date()) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      trial: {
        isActive: user.trial.isActive,
        startDate: user.trial.startDate,
        endDate: user.trial.endDate,
        daysRemaining: Math.max(0, daysRemaining),
      },
    });
  } catch (error) {
    console.error('❌ Get Trial Status Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Connect WhatsApp
exports.connectWhatsApp = async (req, res) => {
  try {
    const userId = req.userId;
    const { phoneId, accessToken, businessAccountId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        whatsappConfig: {
          phoneId,
          accessToken,
          businessAccountId,
          isConnected: true,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: 'WhatsApp connected successfully',
      whatsappConfig: user.whatsappConfig,
    });
  } catch (error) {
    console.error('❌ Connect WhatsApp Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Customers
exports.getCustomers = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, segment } = req.query;

    let query = { userId };
    if (status) query.status = status;
    if (segment) query.segments = segment;

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    res.status(200).json({ customers });
  } catch (error) {
    console.error('❌ Get Customers Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add Customer
exports.addCustomer = async (req, res) => {
  try {
    const userId = req.userId;
    const { phone, whatsappPhone, email, firstName, lastName, tags } = req.body;

    // Get user and check limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user limits based on current plan
    updateUserLimits(user);

    // Check if user can add contact
    const canAdd = canAddContact(user);
    if (!canAdd.allowed) {
      return res.status(429).json({
        error: canAdd.message,
        limitExceeded: true,
        current: canAdd.current,
        max: canAdd.max,
      });
    }

    // Validate required fields
    if (!phone || !firstName) {
      return res.status(400).json({
        error: 'Missing required fields: phone, firstName',
      });
    }

    const customer = new Customer({
      userId,
      phone,
      whatsappPhone,
      email,
      firstName,
      lastName,
      tags: tags || [],
    });

    await customer.save();

    // Increment user's contact count
    user.usage.contacts += 1;
    await user.save();

    res.status(201).json({
      message: 'Customer added successfully',
      customer,
      usage: {
        current: user.usage.contacts,
        max: user.usage.maxContacts,
      },
    });
  } catch (error) {
    console.error('❌ Add Customer Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    const userId = req.userId;
    const { customerId } = req.params;

    // Find and delete the customer
    const customer = await Customer.findOneAndDelete({
      _id: customerId,
      userId,
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Decrement user's contact count
    const user = await User.findById(userId);
    if (user && user.usage.contacts > 0) {
      user.usage.contacts -= 1;
      await user.save();
    }

    res.status(200).json({
      message: 'Customer deleted successfully',
      deletedCustomer: customer,
      usage: {
        current: user?.usage.contacts || 0,
        max: user?.usage.maxContacts || 0,
      },
    });
  } catch (error) {
    console.error('❌ Delete Customer Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Multiple Customers
exports.deleteMultipleCustomers = async (req, res) => {
  try {
    const userId = req.userId;
    const { customerIds } = req.body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ error: 'customerIds must be a non-empty array' });
    }

    // Delete customers
    const result = await Customer.deleteMany({
      _id: { $in: customerIds },
      userId,
    });

    // Decrement user's contact count
    const user = await User.findById(userId);
    if (user && user.usage.contacts > 0) {
      user.usage.contacts = Math.max(0, user.usage.contacts - result.deletedCount);
      await user.save();
    }

    res.status(200).json({
      message: `${result.deletedCount} customer(s) deleted successfully`,
      deletedCount: result.deletedCount,
      usage: {
        current: user?.usage.contacts || 0,
        max: user?.usage.maxContacts || 0,
      },
    });
  } catch (error) {
    console.error('❌ Delete Multiple Customers Error:', error);
    res.status(500).json({ error: error.message });
  }
};

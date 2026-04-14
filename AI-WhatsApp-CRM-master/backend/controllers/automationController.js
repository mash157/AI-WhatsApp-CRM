const Automation = require('../models/Automation');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const { canCreateAutomation, updateUserLimits } = require('../utils/planLimits');

// Create Automation
exports.createAutomation = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, type, trigger, action, schedule } = req.body;

    // Get user and check limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user limits based on current plan
    updateUserLimits(user);

    // Check if user can create automation
    const canCreate = canCreateAutomation(user);
    if (!canCreate.allowed) {
      return res.status(429).json({
        error: canCreate.message,
        limitExceeded: true,
        current: canCreate.current,
        max: canCreate.max,
      });
    }

    // Validate required fields
    if (!name || !type || !trigger) {
      return res.status(400).json({
        error: 'Missing required fields: name, type, trigger',
      });
    }

    const automation = new Automation({
      userId,
      name,
      type,
      trigger,
      action,
      schedule,
      isActive: true,
    });

    await automation.save();

    // Increment user's automation count
    user.usage.automations += 1;
    await user.save();

    res.status(201).json({
      message: 'Automation created successfully',
      automation,
      usage: {
        current: user.usage.automations,
        max: user.usage.maxAutomations,
      },
    });
  } catch (error) {
    console.error('❌ Create Automation Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Automations
exports.getAutomations = async (req, res) => {
  try {
    const userId = req.userId;

    const automations = await Automation.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ automations });
  } catch (error) {
    console.error('❌ Get Automations Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update Automation
exports.updateAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const userId = req.userId;
    const updates = req.body;

    const automation = await Automation.findOneAndUpdate(
      { _id: automationId, userId },
      updates,
      { new: true }
    );

    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    res.status(200).json({
      message: 'Automation updated successfully',
      automation,
    });
  } catch (error) {
    console.error('❌ Update Automation Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Automation
exports.deleteAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const userId = req.userId;

    const automation = await Automation.findOneAndDelete({
      _id: automationId,
      userId,
    });

    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    // Decrement user's automation count
    const user = await User.findById(userId);
    if (user && user.usage.automations > 0) {
      user.usage.automations -= 1;
      await user.save();
    }

    res.status(200).json({ 
      message: 'Automation deleted successfully',
      deletedAutomation: automation,
      usage: {
        current: user?.usage.automations || 0,
        max: user?.usage.maxAutomations || 0,
      },
    });
  } catch (error) {
    console.error('❌ Delete Automation Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Multiple Automations
exports.deleteMultipleAutomations = async (req, res) => {
  try {
    const userId = req.userId;
    const { automationIds } = req.body;

    if (!Array.isArray(automationIds) || automationIds.length === 0) {
      return res.status(400).json({ error: 'automationIds must be a non-empty array' });
    }

    // Delete automations
    const result = await Automation.deleteMany({
      _id: { $in: automationIds },
      userId,
    });

    // Decrement user's automation count
    const user = await User.findById(userId);
    if (user && user.usage.automations > 0) {
      user.usage.automations = Math.max(0, user.usage.automations - result.deletedCount);
      await user.save();
    }

    res.status(200).json({
      message: `${result.deletedCount} automation(s) deleted successfully`,
      deletedCount: result.deletedCount,
      usage: {
        current: user?.usage.automations || 0,
        max: user?.usage.maxAutomations || 0,
      },
    });
  } catch (error) {
    console.error('❌ Delete Multiple Automations Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Trigger Automation (Manual Execution)
exports.triggerAutomation = async (req, res) => {
  try {
    const { automationId } = req.params;
    const userId = req.userId;

    const automation = await Automation.findOne({ _id: automationId, userId });
    if (!automation) {
      return res.status(404).json({ error: 'Automation not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all customers for this user
    const customers = await Customer.find({ userId });
    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers found to send messages to' });
    }

    // All customers can receive messages (auto-approved on creation)
    const targetCustomers = customers;

    let messagesSent = 0;
    let errors = [];

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 TRIGGER AUTOMATION: ${automation.name}`);
    console.log(`📧 Customers to send to: ${targetCustomers.length}`);
    console.log(`🔑 Phone ID: ${process.env.WHATSAPP_PHONE_ID}`);
    console.log(`👤 User Plan: ${user.subscription?.plan || 'free'}`);
    console.log(`${'='.repeat(60)}\n`);

    // Send to each customer
    for (const customer of targetCustomers) {
      try {
        const axios = require('axios');
        
        // Get custom message from automation
        let customMessage = '';
        if (typeof automation.action === 'string') {
          customMessage = automation.action;
        } else if (automation.action?.template) {
          customMessage = automation.action.template;
        } else if (automation.action?.message) {
          customMessage = automation.action.message;
        } else {
          customMessage = `Hello ${customer.firstName}, this is an automated message from your WhatsApp Business.`;
        }

        // Sanitize message: remove newlines, tabs, and limit consecutive spaces to 4
        customMessage = customMessage
          .replace(/[\n\r\t]/g, ' ')  // Replace newlines and tabs with space
          .replace(/\s{5,}/g, '    ') // Replace 5+ spaces with 4 spaces
          .trim();  // Remove leading/trailing whitespace

        console.log(`📱 Customer: ${customer.firstName}`);
        console.log(`💬 Custom Message: "${customMessage.substring(0, 60)}..."`);
        console.log(`📋 Plan: ${user.subscription?.plan || 'free'}`);

        // Send via WhatsApp Meta API
        try {
          // Format phone number to E.164 format (without +)
          let cleanPhone = customer.phone.replace(/\D/g, '');
          
          // If phone doesn't start with country code, assume it needs one
          // Common case: if length < 12 digits, prepend country code
          if (cleanPhone.length < 12) {
            // Try to detect if it's missing country code (assume +91 for India as default)
            if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
              cleanPhone = '91' + cleanPhone; // Add India country code
            }
          }
          
          // Ensure + prefix for logging only
          let phoneWithPrefix = cleanPhone;
          if (!phoneWithPrefix.startsWith('+')) {
            phoneWithPrefix = '+' + phoneWithPrefix;
          }
          
          console.log(`📞 Phone: ${customer.phone} → ${phoneWithPrefix}`);
          
          // Determine which template to use and whether it has parameters
          // Priority: automation.template > env variable > default
          const templateName = automation.action?.templateName || 
                               process.env.WHATSAPP_TEMPLATE_NAME || 
                               'hello_world';
          
          const templateHasParams = automation.action?.templateHasParams !== false; // Default true for custom templates
          
          let templatePayload = {
            name: templateName,
            language: {
              code: 'en_US'
            }
          };
          
          // If template supports parameters (like custom_message template with {{1}}), add custom message as parameter
          if (templateHasParams && customMessage && templateName !== 'hello_world') {
            templatePayload.components = [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: customMessage
                  }
                ]
              }
            ];
            console.log(`🎯 Using template: ${templateName} (with parameters)`);
          } else {
            console.log(`🎯 Using template: ${templateName} (static)`);
          }
          
          // Send via WhatsApp Template API
          const response = await axios.post(
            `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanPhone,
              type: 'template',
              template: templatePayload
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              },
            }
          );

          messagesSent++;
          console.log(`✅ SUCCESS (Custom Template): Message ID = ${response.data?.messages?.[0]?.id}`);
          console.log(`📤 Full Response:`, JSON.stringify(response.data, null, 2));
        } catch (whatsappError) {
          console.log(`\n❌ FAILED: WhatsApp API Error`);
          console.log(`Status: ${whatsappError.response?.status}`);
          console.log(`Error Code: ${whatsappError.response?.data?.error?.code}`);
          console.log(`Error Message: ${whatsappError.response?.data?.error?.message}`);
          console.log(`Full Error Response:`, JSON.stringify(whatsappError.response?.data, null, 2));
          
          const errorMsg = whatsappError.response?.data?.error?.message || 
                          whatsappError.response?.data?.message ||
                          whatsappError.message;
          const errorCode = whatsappError.response?.status || 'UNKNOWN';
          errors.push(`${customer.phone}: [${errorCode}] ${errorMsg}`);
        }
      } catch (err) {
        console.log(`\n❌ ERROR: ${err.message}`);
        errors.push(`${customer.firstName}: ${err.message}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RESULTS: ${messagesSent}/${targetCustomers.length} Sent`);
    if (errors.length > 0) console.log(`⚠️  Errors:`, errors);
    console.log(`${'='.repeat(60)}\n`);

    res.status(200).json({
      message: `Automation triggered successfully`,
      automation: automation.name,
      messagesSent,
      totalCustomers: targetCustomers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ Trigger Automation Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send Follow-up Message (triggered by automation)
exports.sendFollowUp = async (req, res) => {
  try {
    const { customerId, message } = req.body;
    const userId = req.userId;

    const customer = await Customer.findOne({ _id: customerId, userId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // In production, send via WhatsApp or email
    console.log(`📨 Follow-up message to ${customer.firstName}: ${message}`);

    res.status(200).json({
      message: 'Follow-up message sent',
      customerId,
    });
  } catch (error) {
    console.error('❌ Send Follow-up Error:', error);
    res.status(500).json({ error: error.message });
  }
};

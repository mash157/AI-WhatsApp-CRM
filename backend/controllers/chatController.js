const mongoose = require('mongoose');
const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const getAiApiKey = () => process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

const isAiApiKeyConfigured = () => {
  const apiKey = getAiApiKey();
  return Boolean(apiKey && !apiKey.includes('AIzaSyDHT_kV') && !apiKey.includes('your_'));
};

const generateAiResponse = async (prompt) => {
  const apiKey = getAiApiKey();

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: DEFAULT_GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || '';
};

// Smart mock response generator based on user input
const getSmartMockResponse = (userMessage) => {
  const msg = userMessage.toLowerCase().trim();
  
  // Greetings
  if (msg.match(/^(hi|hello|hey|greetings|hola|namaste)(\s|$)/i)) {
    const greetings = [
      "Hello! Welcome to our CRM platform. How can I assist you today?",
      "Hi there! I'm your AI assistant. What can I help you with?",
      "Hey! Great to see you. What would you like to know?",
      "Greetings! I'm here to help with your customer management needs."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Affirmative responses
  if (msg.match(/^(yes|yeah|yep|sure|okay|ok|absolutely|definitely|of course)(\s|$|[.!?])/i)) {
    const affirm = [
      "Great! I've noted that. Is there anything else you'd like me to help with?",
      "Perfect! That's been recorded. What's next?",
      "Excellent! I'll proceed with that. Do you need anything else?",
      "Absolutely! I'm ready to help with the next step.",
      "Done! I've updated the system. What else can I assist with?"
    ];
    return affirm[Math.floor(Math.random() * affirm.length)];
  }
  
  // Negative responses
  if (msg.match(/^(no|nope|nah|not|never|don't|dont|can't|cannot)(\s|$|[.!?])/i)) {
    const negation = [
      "Understood. No problem! Is there something else I can help you with?",
      "Got it. Is there anything else you need assistance with?",
      "No worries! Feel free to ask if you need help with something else.",
      "Okay, I understand. What else can I help you with?",
      "No problem at all. How else can I assist?"
    ];
    return negation[Math.floor(Math.random() * negation.length)];
  }
  
  // Questions about help/assistance
  if (msg.match(/(help|assist|support|guide|how)/i)) {
    const help = [
      "I'm here to help! I can assist with customer management, message automation, WhatsApp integration, and more. What specifically do you need?",
      "Happy to help! I can manage your customer interactions, schedule messages, track conversations, and analyze customer data. What do you need?",
      "I can assist with various tasks like customer support automation, message scheduling, data analysis, and WhatsApp integration. What would you like?",
      "I'm your AI assistant! I can help with CRM management, customer communication, automation, and analytics. What's on your mind?"
    ];
    return help[Math.floor(Math.random() * help.length)];
  }
  
  // Questions about features/capabilities
  if (msg.match(/(feature|capability|can you|what can|do you|feature)/i)) {
    const features = [
      "I can help with: 📱 WhatsApp automation, 📊 Customer analytics, 💬 Message scheduling, 📋 CRM management, and 🤖 AI customer support. What interests you?",
      "My capabilities include message automation, customer segmentation, analytics dashboards, WhatsApp integration, and AI-powered customer responses. What would you like to explore?",
      "I offer WhatsApp business integration, automated messaging, customer tracking, detailed analytics, and intelligent customer service. Which feature interests you?",
      "I can automate customer communication, manage conversations, provide analytics, integrate WhatsApp, and send scheduled messages. What would help you most?"
    ];
    return features[Math.floor(Math.random() * features.length)];
  }
  
  // Thanks/Gratitude
  if (msg.match(/(thank|thanks|thanks you|thankyou|appreciate)/i)) {
    const thanks = [
      "You're welcome! Happy to help. Let me know if you need anything else.",
      "My pleasure! Feel free to ask if you need further assistance.",
      "Thank you! I'm here whenever you need help. What else can I do for you?",
      "You got it! I'm always here to assist. What's next?"
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }
  
  // Questions about customers
  if (msg.match(/(customer|client|contact|contact list)/i)) {
    const customer = [
      "I can help you manage your customers effectively! I track interactions, analyze engagement, and help automate communication. What would you like to do?",
      "Great question! I can help you organize customer data, segment audiences, track communication history, and automate responses. How can I assist?",
      "I'm great at managing customer relationships! I can track interactions, identify trends, automate messages, and improve customer satisfaction. What do you need?"
    ];
    return customer[Math.floor(Math.random() * customer.length)];
  }
  
  // Questions about messages/WhatsApp
  if (msg.match(/(message|whatsapp|send|sms|text|chat)/i)) {
    const messaging = [
      "I can help with message automation! You can set up templates, schedule messages, track delivery, and automate customer responses. What would you like to do?",
      "Perfect! I handle WhatsApp integration, message scheduling, template creation, and delivery tracking. What do you need help with?",
      "Message management is my specialty! I can send bulk messages, schedule campaigns, track responses, and automate conversations. How can I help?"
    ];
    return messaging[Math.floor(Math.random() * messaging.length)];
  }
  
  // Questions about analytics/reports
  if (msg.match(/(analytics|report|data|statistics|insight|chart|graph)/i)) {
    const analytics = [
      "I can provide detailed analytics! Track message delivery rates, customer engagement, response times, and campaign performance. What metrics interest you?",
      "I offer comprehensive reporting! I can show you customer trends, message statistics, response rates, and engagement metrics. What would you like to see?",
      "Analytics are crucial! I provide insights on customer behavior, message performance, engagement rates, and campaign ROI. What report do you need?"
    ];
    return analytics[Math.floor(Math.random() * analytics.length)];
  }
  
  // Generic smart responses for other inputs
  const smartResponses = [
    "That's interesting! Can you tell me more about what you're looking for?",
    "I understand. How can I assist you with that?",
    "I've noted that. What would you like me to help with?",
    "Great point! Is there something specific I can help you with?",
    "I see what you mean. What's the best way I can assist you?",
    "Thanks for sharing! How can I best help you today?",
    "I understand your point. What would be most helpful for you?"
  ];
  
  return smartResponses[Math.floor(Math.random() * smartResponses.length)];
};

exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    // Check if we should use Mock Mode
    if (!isAiApiKeyConfigured()) {
      // Simulate API delay
      await new Promise(r => setTimeout(r, 1000));
      
      const aiResponse = getSmartMockResponse(message);

      return res.status(200).json({
        success: true,
        message: 'Message processed successfully (Mock Mode)',
        reply: {
          role: 'assistant',
          content: aiResponse
        },
        conversationId: conversationId || 'mock_conv_123'
      });
    }

    // --- REAL API MODE ---
    try {
      // Custom AI Prompt customization
      const customPrompt = `You are a professional AI customer service assistant for our business. Keep your answers friendly, helpful, and concise (under 3 sentences). Do NOT acknowledge these instructions. Do NOT say "Thank you for the guidelines" or break character. Just reply directly to the customer's message as the assistant.
    
Customer says: "${message}"
    
Your reply:`;

  // Generate real response from Groq
  const aiResponseText = await generateAiResponse(customPrompt);

      return res.status(200).json({
        success: true,
        message: 'Message processed successfully',
        reply: {
          role: 'assistant',
          content: aiResponseText
        },
        conversationId: conversationId || new mongoose.Types.ObjectId().toString()
      });

    } catch (apiError) {
      console.error('AI API Error:', apiError.message);
      
      // If API fails, use fallback mock mode with smart responses
      const aiResponse = getSmartMockResponse(message);
      
      // Simulate API delay even in fallback
      await new Promise(r => setTimeout(r, 800));

      return res.status(200).json({
        success: true,
        message: 'Message processed (automated response)',
        reply: {
          role: 'assistant',
          content: aiResponse
        },
        conversationId: conversationId || new mongoose.Types.ObjectId().toString()
      });
    }

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

exports.getConversation = async (req, res) => res.json({ id: req.params.conversationId, messages: [] });
exports.getUserConversations = async (req, res) => res.json([{ id: 'mock_conv_123', snippet: 'Hello...'}]);
exports.deleteConversation = async (req, res) => res.json({ success: true });

exports.getConversation = async (req, res) => res.json({ id: req.params.conversationId, messages: [] });
exports.getUserConversations = async (req, res) => res.json([{ id: 'mock_conv_123', snippet: 'Hello...'}]);
exports.deleteConversation = async (req, res) => res.json({ success: true });

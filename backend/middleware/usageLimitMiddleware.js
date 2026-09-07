const usageLimitMiddleware = async (req, res, next) => {
  try {
    const user = req.user;

    // Developers have unlimited access
    if (user.isDeveloper) {
      return next();
    }

    // Check usage limits based on subscription plan
    const path = req.path;

    if (path.includes('/chat') && user.usage.chatMessages >= user.usage.maxChatMessages) {
      return res.status(429).json({
        error: `Chat message limit (${user.usage.maxChatMessages}) exceeded. Upgrade your plan.`,
        limitExceeded: true,
        current: user.usage.chatMessages,
        max: user.usage.maxChatMessages,
      });
    }

    if (path.includes('/voice') && user.usage.voiceRequests >= user.usage.maxVoiceRequests) {
      return res.status(429).json({
        error: `Voice request limit (${user.usage.maxVoiceRequests}) exceeded. Upgrade your plan.`,
        limitExceeded: true,
        current: user.usage.voiceRequests,
        max: user.usage.maxVoiceRequests,
      });
    }

    if (path.includes('/whatsapp') && user.usage.whatsappMessages >= user.usage.maxWhatsappMessages) {
      return res.status(429).json({
        error: `WhatsApp message limit (${user.usage.maxWhatsappMessages}) exceeded. Upgrade your plan.`,
        limitExceeded: true,
        current: user.usage.whatsappMessages,
        max: user.usage.maxWhatsappMessages,
      });
    }

    next();
  } catch (error) {
    console.error('❌ Usage Limit Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = usageLimitMiddleware;

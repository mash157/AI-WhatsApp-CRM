// Plan-based feature limits
const PLAN_LIMITS = {
  free: {
    automations: 5,
    contacts: 10,
    chatMessages: 100,
    voiceRequests: 50,
    whatsappMessages: 1000,
  },
  basic: {
    automations: 20,
    contacts: 50,
    chatMessages: 500,
    voiceRequests: 200,
    whatsappMessages: 5000,
  },
  pro: {
    automations: 100,
    contacts: 500,
    chatMessages: 2000,
    voiceRequests: 1000,
    whatsappMessages: 20000,
  },
  max: {
    automations: Infinity,
    contacts: Infinity,
    chatMessages: Infinity,
    voiceRequests: Infinity,
    whatsappMessages: Infinity,
  },
  extension: {
    automations: Infinity,
    contacts: Infinity,
    chatMessages: Infinity,
    voiceRequests: Infinity,
    whatsappMessages: Infinity,
  },
};

/**
 * Update plan limits for a user based on their subscription
 */
const updateUserLimits = (user) => {
  const plan = user.subscription.plan;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  user.usage.maxAutomations = limits.automations;
  user.usage.maxContacts = limits.contacts;
  user.usage.maxChatMessages = limits.chatMessages;
  user.usage.maxVoiceRequests = limits.voiceRequests;
  user.usage.maxWhatsappMessages = limits.whatsappMessages;

  return user;
};

/**
 * Check if user can create an automation
 */
const canCreateAutomation = (user) => {
  if (user.isDeveloper) return { allowed: true };
  
  const plan = user.subscription.plan;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  if (user.usage.automations >= limits.automations) {
    return {
      allowed: false,
      current: user.usage.automations,
      max: limits.automations,
      message: `Automation limit (${limits.automations}) exceeded for ${plan} plan. Upgrade to create more.`,
    };
  }

  return { allowed: true };
};

/**
 * Check if user can add a contact
 */
const canAddContact = (user) => {
  if (user.isDeveloper) return { allowed: true };
  
  const plan = user.subscription.plan;
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  if (user.usage.contacts >= limits.contacts) {
    return {
      allowed: false,
      current: user.usage.contacts,
      max: limits.contacts,
      message: `Contact limit (${limits.contacts}) exceeded for ${plan} plan. Upgrade to add more.`,
    };
  }

  return { allowed: true };
};

module.exports = {
  PLAN_LIMITS,
  updateUserLimits,
  canCreateAutomation,
  canAddContact,
};

const User = require('../models/User');

const trialCheckMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if trial is still active
    if (user.trial.isActive && new Date() > user.trial.endDate) {
      user.trial.isActive = false;
      user.trial.daysRemaining = 0;
      await user.save();

      return res.status(403).json({
        error: 'Trial period expired. Please upgrade to continue using premium features.',
        trialExpired: true,
      });
    }

    // Calculate days remaining
    if (user.trial.isActive) {
      const daysRemaining = Math.ceil((user.trial.endDate - new Date()) / (1000 * 60 * 60 * 24));
      user.trial.daysRemaining = Math.max(0, daysRemaining);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Trial Check Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = trialCheckMiddleware;

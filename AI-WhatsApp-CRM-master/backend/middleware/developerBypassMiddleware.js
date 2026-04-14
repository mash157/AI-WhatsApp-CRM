const developerBypassMiddleware = (req, res, next) => {
  try {
    // If user is a developer, bypass all restrictions
    if (req.isDeveloper) {
      req.bypassRestrictions = true;
    }
    next();
  } catch (error) {
    console.error('❌ Developer Bypass Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = developerBypassMiddleware;

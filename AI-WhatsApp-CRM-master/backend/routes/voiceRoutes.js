const express = require('express');
const voiceController = require('../controllers/voiceController');
const authMiddleware = require('../middleware/authMiddleware');
const trialCheckMiddleware = require('../middleware/trialCheckMiddleware');
const usageLimitMiddleware = require('../middleware/usageLimitMiddleware');
const developerBypassMiddleware = require('../middleware/developerBypassMiddleware');

const router = express.Router();

// Apply middlewares
router.use(authMiddleware);
router.use(trialCheckMiddleware);
router.use(developerBypassMiddleware);
router.use(usageLimitMiddleware);

// Process Voice Text
router.post('/process', voiceController.processVoice);

// Synthesize Speech
router.post('/synthesize', voiceController.synthesizeSpeech);

module.exports = router;

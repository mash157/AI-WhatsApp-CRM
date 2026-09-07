const express = require('express');
const whatsappController = require('../controllers/whatsappController');
const authMiddleware = require('../middleware/authMiddleware');
const trialCheckMiddleware = require('../middleware/trialCheckMiddleware');
const usageLimitMiddleware = require('../middleware/usageLimitMiddleware');
const developerBypassMiddleware = require('../middleware/developerBypassMiddleware');

const router = express.Router();

// Webhook for Meta verification (GET)
router.get('/webhook', whatsappController.verifyWebhook);

// Webhook for receiving messages (POST - no auth required)
router.post('/webhook', whatsappController.receiveWebhook);

// Apply middlewares for authenticated routes
router.use(authMiddleware);
router.use(trialCheckMiddleware);
router.use(developerBypassMiddleware);
router.use(usageLimitMiddleware);

// Send Message
router.post('/send', whatsappController.sendMessage);

// Send Booking Reminder
router.post('/send-booking-reminder', whatsappController.sendBookingReminder);

// Send Payment Reminder
router.post('/send-payment-reminder', whatsappController.sendPaymentReminder);

module.exports = router;

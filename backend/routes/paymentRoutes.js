const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Razorpay
router.post('/razorpay/create-order', paymentController.createRazorpayOrder);
router.post('/razorpay/verify', paymentController.verifyRazorpayPayment);

// Stripe
router.post('/stripe/create-intent', paymentController.createStripePaymentIntent);
router.post('/stripe/confirm', paymentController.confirmStripePayment);

// Payment History
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;

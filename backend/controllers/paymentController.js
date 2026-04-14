const Payment = require('../models/Payment');
const User = require('../models/User');
const Razorpay = require('razorpay');

let razorpay = null;
let stripe = null;

// Initialize Razorpay only if valid credentials are provided
if (process.env.RAZORPAY_KEY_ID && !process.env.RAZORPAY_KEY_ID.includes('your_')) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Initialize Stripe only if valid credentials are provided
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Plan pricing mapping
const PLANS = {
  extension: { monthly: 14900, yearly: 14900 }, // ₹149 for 2 days
  basic: { monthly: 99900, yearly: 999900 },   // ₹999 / month
  pro: { monthly: 199900, yearly: 1999900 },   // ₹1999 / month
  max: { monthly: 499900, yearly: 4999900 },   // ₹4999 / month 
};

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { plan, duration = 'monthly' } = req.body;
    const userId = req.userId;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const amount = PLANS[plan][duration];
    
    // Generate receipt with max 40 character limit for Razorpay
    const shortId = userId.toString().slice(-8);
    const timestamp = Date.now().toString().slice(-6);
    const receipt = `rcpt_${shortId}${timestamp}`.slice(0, 40);

    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId,
        plan,
        duration,
      },
    });

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error('❌ Create Order Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, plan, duration = 'monthly' } = req.body;
    const userId = req.userId;

    // Save payment to database
    const payment = new Payment({
      userId,
      orderId,
      paymentId,
      signature,
      plan,
      amount: PLANS[plan][duration],
      currency: 'INR',
      paymentMethod: 'razorpay',
      status: 'completed',
      subscriptionPeriod: {
        startDate: new Date(),
        endDate: plan === 'extension' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : new Date(Date.now() + (duration === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        durationMonths: plan === 'extension' ? 0 : (duration === 'monthly' ? 1 : 12),
      },
    });

    await payment.save();

    // Update user subscription
    const user = await User.findById(userId);
    user.subscription.plan = plan;
    user.subscription.status = 'active';
    user.subscription.startDate = new Date();
    user.subscription.endDate = plan === 'extension' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : new Date(Date.now() + (duration === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);
    user.trial.isActive = false;

    // Update usage limits based on plan
    if (plan === 'extension') {
      user.usage.maxChatMessages = Math.max(user.usage.maxChatMessages || 100, 500);
      user.usage.maxVoiceRequests = Math.max(user.usage.maxVoiceRequests || 50, 200);
    } else if (plan === 'basic') {
      user.usage.maxChatMessages = 1000;
      user.usage.maxVoiceRequests = 500;
    } else if (plan === 'pro') {
      user.usage.maxChatMessages = 10000;
      user.usage.maxVoiceRequests = 5000;
    } else if (plan === 'max') {
      user.usage.maxChatMessages = 9999999;
      user.usage.maxVoiceRequests = 9999999;
    }

    await user.save();

    res.status(200).json({
      message: 'Payment verified and subscription activated',
      payment: {
        id: payment._id,
        status: payment.status,
        plan: payment.plan,
      },
    });
  } catch (error) {
    console.error('❌ Verify Payment Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create Stripe Payment Intent
exports.createStripePaymentIntent = async (req, res) => {
  try {
    const { plan, duration = 'monthly' } = req.body;
    const userId = req.userId;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const amount = PLANS[plan][duration] / 100; // Convert to dollars/euros

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        userId,
        plan,
        duration,
      },
    });

    res.status(201).json({
      message: 'Payment intent created',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Create Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm Stripe Payment
exports.confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, plan, duration = 'monthly' } = req.body;
    const userId = req.userId;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Save payment
    const payment = new Payment({
      userId,
      paymentId: paymentIntentId,
      plan,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paymentMethod: 'stripe',
      status: 'completed',
      subscriptionPeriod: {
        startDate: new Date(),
        endDate: plan === 'extension' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : new Date(Date.now() + (duration === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
        durationMonths: plan === 'extension' ? 0 : (duration === 'monthly' ? 1 : 12),
      },
    });

    await payment.save();

    // Update user subscription
    const user = await User.findById(userId);
    user.subscription.plan = plan;
    user.subscription.status = 'active';
    user.subscription.startDate = new Date();
    user.subscription.endDate = plan === 'extension' ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) : new Date(Date.now() + (duration === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000);
    user.trial.isActive = false;

    // Update usage limits
    if (plan === 'extension') {
      user.usage.maxChatMessages = Math.max(user.usage.maxChatMessages || 100, 500);
      user.usage.maxVoiceRequests = Math.max(user.usage.maxVoiceRequests || 50, 200);
    } else if (plan === 'basic') {
      user.usage.maxChatMessages = 1000;
      user.usage.maxVoiceRequests = 500;
    } else if (plan === 'pro') {
      user.usage.maxChatMessages = 10000;
      user.usage.maxVoiceRequests = 5000;
    } else if (plan === 'max') {
      user.usage.maxChatMessages = 9999999;
      user.usage.maxVoiceRequests = 9999999;
    }

    await user.save();

    res.status(200).json({
      message: 'Payment confirmed and subscription activated',
      payment: {
        id: payment._id,
        status: payment.status,
        plan: payment.plan,
      },
    });
  } catch (error) {
    console.error('❌ Confirm Payment Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ payments });
  } catch (error) {
    console.error('❌ Get Payment History Error:', error);
    res.status(500).json({ error: error.message });
  }
};

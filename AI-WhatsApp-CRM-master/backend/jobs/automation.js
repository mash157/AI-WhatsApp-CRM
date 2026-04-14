const cron = require('node-cron');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const axios = require('axios');

// Auto Follow-up: Send reminder if user inactive for 24h
const inactivityFollowupJob = cron.schedule('0 */6 * * *', async () => {
  try {
    console.log('🔄 Running inactivity follow-up job...');

    const thirtyMinutesAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const inactiveUsers = await User.find({
      lastActivityAt: { $lt: thirtyMinutesAgo },
    });

    for (const user of inactiveUsers) {
      console.log(`📨 Sending follow-up to ${user.email}`);
      // Send email or WhatsApp reminder
    }
  } catch (error) {
    console.error('❌ Inactivity Job Error:', error);
  }
});

// Booking Reminders: Notify before appointment
const bookingReminderJob = cron.schedule('0 * * * *', async () => {
  try {
    console.log('📅 Running booking reminder job...');

    const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const upcomingBookings = await Booking.find({
      date: {
        $gte: new Date(),
        $lte: nextDay,
      },
      reminderSent: false,
    }).populate('userId customerId');

    for (const booking of upcomingBookings) {
      if (booking.customerId && booking.customerId.whatsappPhone) {
        console.log(`📤 Sending booking reminder for ${booking.title}`);

        // Send WhatsApp reminder via Meta API
        try {
          await axios.post(
            `https://graph.instagram.com/v18.0/${booking.userId.whatsappConfig.phoneId}/messages`,
            {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: booking.customerId.whatsappPhone,
              type: 'text',
              text: {
                body: `📅 Reminder: Your appointment "${booking.title}" is confirmed for ${booking.date.toDateString()} at ${booking.time}. See you soon!`,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${booking.userId.whatsappConfig.accessToken}`,
              },
            }
          );
        } catch (whatsappError) {
          console.error('❌ WhatsApp send error:', whatsappError.message);
        }
      }

      booking.reminderSent = true;
      await booking.save();
    }
  } catch (error) {
    console.error('❌ Booking Reminder Job Error:', error);
  }
});

// Payment Reminders: Send payment pending alerts
const paymentReminderJob = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('💰 Running payment reminder job...');

    // Find customers with pending payments (you'd need a Payment model with status)
    console.log('💳 Checking for pending payments...');
    // Send payment reminders via WhatsApp
  } catch (error) {
    console.error('❌ Payment Reminder Job Error:', error);
  }
});

// Trial Expiry Alerts
const trialExpiryJob = cron.schedule('0 12 * * *', async () => {
  try {
    console.log('⏰ Running trial expiry check...');

    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const users = await User.find({
      'trial.isActive': true,
      'trial.endDate': {
        $gte: new Date(),
        $lte: nextWeek,
      },
    });

    for (const user of users) {
      console.log(`⚠️ Trial expiring soon for ${user.email}`);
      // Send email notification about trial expiry
    }
  } catch (error) {
    console.error('❌ Trial Expiry Job Error:', error);
  }
});

// Reset Usage Limits (monthly)
const resetUsageJob = cron.schedule('0 0 1 * *', async () => {
  try {
    console.log('🔄 Resetting monthly usage limits...');

    const users = await User.find({});
    for (const user of users) {
      user.usage.chatMessages = 0;
      user.usage.voiceRequests = 0;
      user.usage.whatsappMessages = 0;
      user.usage.resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    console.log(`✅ Reset usage for ${users.length} users`);
  } catch (error) {
    console.error('❌ Reset Usage Job Error:', error);
  }
});

// Initialize all cron jobs
const initializeCronJobs = () => {
  console.log('✅ Cron jobs initialized');
};

module.exports = {
  initializeCronJobs,
  inactivityFollowupJob,
  bookingReminderJob,
  paymentReminderJob,
  trialExpiryJob,
  resetUsageJob,
};

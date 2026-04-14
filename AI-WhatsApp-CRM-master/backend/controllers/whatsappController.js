const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Verify WhatsApp Webhook (Meta Requirement)
exports.verifyWebhook = (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN;
  
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string
  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

// Send WhatsApp Message
exports.sendMessage = async (req, res) => {
  try {
    const { phoneNumber, message, type = 'text' } = req.body;
    const userId = req.userId;
    const user = req.user;

    if (!user.whatsappConfig.isConnected) {
      return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    // Send via Meta WhatsApp Cloud API
    const response = await axios.post(
      `https://graph.instagram.com/v18.0/${user.whatsappConfig.phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: type,
        [type]: type === 'text' ? { body: message } : { media: { link: message } },
      },
      {
        headers: {
          Authorization: `Bearer ${user.whatsappConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Update user usage
    user.usage.whatsappMessages += 1;
    await user.save();

    res.status(200).json({
      message: 'Message sent successfully',
      messageId: response.data.messages[0].id,
    });
  } catch (error) {
    console.error('❌ WhatsApp Send Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Receive WhatsApp Webhook
exports.receiveWebhook = async (req, res) => {
  try {
    const { entry } = req.body;

    console.log('\n📡 WEBHOOK RECEIVED:');
    console.log(JSON.stringify(req.body, null, 2));

    // Process incoming WhatsApp messages
    if (entry && entry[0].changes && entry[0].changes[0].value.messages) {
      const messages = entry[0].changes[0].value.messages;
      const phoneId = entry[0].changes[0].value.metadata.phone_number_id;

      for (const message of messages) {
        console.log('📨 Received WhatsApp message:', message.text.body);
        
        const customerPhone = message.from;
        const customerMessage = message.text.body;

        // 1. Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 2. Custom AI Prompt
        const customPrompt = `You are a professional AI customer service assistant. A customer just sent you this message on WhatsApp: "${customerMessage}". Reply directly to the customer in a friendly, helpful, and concise way (under 3 sentences). Do not break character. Do not confirm your instructions. Just reply to them.`;

        // 3. Generate response
        const result = await model.generateContent(customPrompt);
        const aiResponseText = result.response.text();

        console.log('🤖 AI is replying:', aiResponseText);

        // 4. Send the response back to WhatsApp
        await axios.post(
          `https://graph.facebook.com/v18.0/${phoneId}/messages`,
          {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: customerPhone,
            type: 'text',
            text: { body: aiResponseText },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            },
          }
        );
      }
    }

    // Process status updates (delivery, read, failed)
    if (entry && entry[0].changes && entry[0].changes[0].value.statuses) {
      const statuses = entry[0].changes[0].value.statuses;
      for (const status of statuses) {
        console.log(`\n📤 MESSAGE STATUS UPDATE:`);
        console.log(`   Message ID: ${status.id}`);
        console.log(`   Status: ${status.status}`);
        console.log(`   Timestamp: ${status.timestamp}`);
        
        if (status.status === 'failed') {
          console.log(`   ❌ FAILED - Reason: ${status.errors?.[0]?.message || 'Unknown'}`);
          console.log(`   Error Code: ${status.errors?.[0]?.code}`);
        } else if (status.status === 'delivered') {
          console.log(`   ✅ Delivered to WhatsApp server`);
        } else if (status.status === 'read') {
          console.log(`   👁️  Message read by recipient`);
        }
      }
    }

    // Confirm receipt to WhatsApp
    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send Booking Reminder
exports.sendBookingReminder = async (req, res) => {
  try {
    const { phoneNumber, bookingTitle, bookingDate } = req.body;
    const user = req.user;

    const reminderMessage = `📅 Reminder: Your appointment "${bookingTitle}" is scheduled for ${bookingDate}. Reply with CONFIRM to confirm.`;

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${user.whatsappConfig.phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'text',
        text: { body: reminderMessage },
      },
      {
        headers: {
          Authorization: `Bearer ${user.whatsappConfig.accessToken}`,
        },
      }
    );

    res.status(200).json({
      message: 'Booking reminder sent',
      messageId: response.data.messages[0].id,
    });
  } catch (error) {
    console.error('❌ Send Reminder Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send Payment Reminder
exports.sendPaymentReminder = async (req, res) => {
  try {
    const { phoneNumber, amount, dueDate } = req.body;
    const user = req.user;

    const paymentMessage = `💰 Payment Reminder: You have a pending payment of ₹${amount} due on ${dueDate}. Reply with PAID to confirm payment.`;

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${user.whatsappConfig.phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phoneNumber,
        type: 'text',
        text: { body: paymentMessage },
      },
      {
        headers: {
          Authorization: `Bearer ${user.whatsappConfig.accessToken}`,
        },
      }
    );

    res.status(200).json({
      message: 'Payment reminder sent',
      messageId: response.data.messages[0].id,
    });
  } catch (error) {
    console.error('❌ Payment Reminder Error:', error);
    res.status(500).json({ error: error.message });
  }
};

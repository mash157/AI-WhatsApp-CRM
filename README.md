AI WhatsApp Business Automation CRM

A production-ready full-stack SaaS application for AI-powered WhatsApp business automation, customer relationship management, and intelligent chatbots.

Frontend (Vercel)

# Deploy to Vercel

vercel deploy --prod

# Frontend URL: https://ai-whatsapp-crm-1.vercel.app

# Set environment variables in Render Dashboard

# Backend URL: https://ai-whatsapp-crm-backend.onrender.com

## 🛠️ Technology Stack

### Backend

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
</p>

### Frontend

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router"/>
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white" alt="Zustand"/>
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios"/>
</p>

### AI & Communication

<p align="left">
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Google Gemini"/>
  <img src="https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp Cloud API"/>
  <img src="https://img.shields.io/badge/Web_Speech_API-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Web Speech API"/>
</p>

### Payments

<p align="left">
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay"/>
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe"/>
</p>

### Tools & Security

<p align="left">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/bcryptjs-000000?style=for-the-badge" alt="bcryptjs"/>
  <img src="https://img.shields.io/badge/Helmet-000000?style=for-the-badge" alt="Helmet"/>
</p>

## 🖼️ Screenshots

### 🔐 Authentication

![Authentication](./screenshots/Authentication.png)

### 📊 Dashboard

![Dashboard](./screenshots/Dashboard.png)

### 👥 Contacts

![Contacts](./screenshots/Contacts.png)

### 📢 Campaigns

![Campaigns](./screenshots/Campaigns.png)

### 💳 Subscriptions

![Subscriptions](./screenshots/Subscriptions.png)
🚀 Features

✅ Core Features

User Authentication: JWT-based authentication with role-based access control

Free Trial: 3-day trial with limited access to premium features

Subscription System: Free, Basic, and Pro plans with different feature sets

Payment Integration: Razorpay (India) and Stripe (Global)

Developer Mode: Unlimited access for developers with special login

🤖 AI Chat System

Google Gemini API Integration: Advanced AI responses with customizable tone

Chat History: Full conversation storage and retrieval

Multi-language Support: Support for multiple languages

Tone Control: Customize AI response tone (professional, casual, friendly)

🎤 Voice Assistant

Speech-to-Text: Convert voice to text using Web Speech API

AI Processing: Send text to Gemini API for intelligent responses

Text-to-Speech: Convert AI responses back to audio

Browser-based: No backend transcription required (using Web Speech API)

💬 WhatsApp Automation

Meta WhatsApp Cloud API Integration: Send messages via WhatsApp

Auto Replies: Automatic response to customer messages

Booking Reminders: Automated appointment notifications

Payment Reminders: Invoice and payment due notifications

Webhook Support: Receive incoming messages

⚙️ Automation System (node-cron)

Inactivity Follow-ups: Remind inactive users after 24 hours

Booking Reminders: Notify customers 24 hours before appointments

Payment Reminders: Send payment pending alerts

Trial Expiry Alerts: Notify about expiring trials

Usage Reset: Monthly usage limit reset

💳 Payment System

Razorpay Integration: For India-based payments

Stripe Integration: For global payments

Automatic Plan Upgrade: Update subscription after successful payment

Payment History: Track all transactions

📊 Tech Stack

<div align="center">















</div>

Backend

Node.js + Express.js: Server framework

MongoDB: NoSQL database

JWT: Authentication

node-cron: Task scheduling

Google Generative AI: AI responses

Razorpay & Stripe: Payment processing

bcryptjs: Password hashing

Helmet: Security headers

Rate Limiting: DDoS protection

Frontend

React 18: UI framework

Tailwind CSS: Styling

React Router: Navigation

Zustand: State management

Axios: HTTP client

React Icons: Icon library

Web Speech API: Voice recognition

📁 Project Structure


ai-whatsapp-crm/

├── backend/

│   ├── controllers/          # Business logic

│   │   ├── authController.js

│   │   ├── chatController.js

│   │   ├── paymentController.js

│   │   ├── voiceController.js

│   │   ├── whatsappController.js

│   │   ├── userController.js

│   │   └── automationController.js

│   │

│   ├── models/               # Database schemas

│   │   ├── User.js

│   │   ├── Chat.js

│   │   ├── Customer.js

│   │   ├── Payment.js

│   │   ├── Booking.js

│   │   └── Automation.js

│   │

│   ├── routes/               # API routes

│   │   ├── authRoutes.js

│   │   ├── chatRoutes.js

│   │   ├── paymentRoutes.js

│   │   ├── voiceRoutes.js

│   │   ├── whatsappRoutes.js

│   │   ├── userRoutes.js

│   │   └── automationRoutes.js

│   │

│   ├── middleware/           # Custom middlewares

│   │   ├── authMiddleware.js

│   │   ├── trialCheckMiddleware.js

│   │   ├── usageLimitMiddleware.js

│   │   └── developerBypassMiddleware.js

│   │

│   ├── jobs/                 # Cron jobs

│   │   └── automation.js

│   │

│   ├── utils/                # Helper functions

│   │   └── helpers.js

│   │

│   ├── config/               # Configuration files

│   │

│   ├── app.js                # Express app setup

│   ├── server.js             # Server entry point

│   ├── package.json

│   └── .env

│

├── frontend/

│   ├── src/

│   │   ├── pages/            # Page components

│   │   │   ├── Login.js

│   │   │   ├── Register.js

│   │   │   └── Dashboard.js

│   │   │

│   │   ├── components/       # Reusable components

│   │   │

│   │   ├── services/         # API services

│   │   │   ├── api.js

│   │   │   └── authStore.js

│   │   │

│   │   ├── App.js

│   │   ├── index.js

│   │   └── index.css

│   │

│   ├── public/

│   │   └── index.html

│   │

│   └── package.json

│

└── README.md


🚀 Setup & Installation

Prerequisites

Node.js 16+

npm or yarn

MongoDB (local or Atlas)

Git

Backend Setup


cd backend

# Install dependencies

npm install

# Create .env file with required variables

cp .env.example .env

# Set your environment variables in .env:

# MONGO_URI=mongodb://localhost:27017/whatsapp-crm

# JWT_SECRET=your_super_secret_key

# GEMINI_API_KEY=your_gemini_api_key

# RAZORPAY_KEY_ID=your_razorpay_key

# RAZORPAY_KEY_SECRET=your_razorpay_secret

# etc...

# Start the server

npm run dev

# Server runs on http://localhost:5000


Frontend Setup


cd frontend

# Install dependencies

npm install

# Create .env file

echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server

npm start

# Frontend runs on http://localhost:3000


🔐 API Endpoints

Authentication


POST   /api/auth/register           - Register new user

POST   /api/auth/login              - Login user

POST   /api/auth/developer-login    - Developer login

POST   /api/auth/logout             - Logout

GET    /api/auth/me                 - Get current user


Chat


POST   /api/chat/send               - Send chat message

GET    /api/chat                    - Get conversations

GET    /api/chat/:conversationId    - Get conversation details

DELETE /api/chat/:conversationId    - Delete conversation


Payment


POST   /api/payment/razorpay/create-order      - Create Razorpay order

POST   /api/payment/razorpay/verify            - Verify Razorpay payment

POST   /api/payment/stripe/create-intent       - Create Stripe intent

POST   /api/payment/stripe/confirm             - Confirm Stripe payment

GET    /api/payment/history                    - Get payment history


User


GET    /api/user/profile            - Get user profile

PUT    /api/user/profile            - Update user profile

GET    /api/user/usage              - Get usage statistics

GET    /api/user/trial              - Get trial status

POST   /api/user/customers/add      - Add customer

GET    /api/user/customers          - Get customers

POST   /api/user/whatsapp/connect   - Connect WhatsApp


Voice


POST   /api/voice/process           - Process voice text

POST   /api/voice/synthesize        - Synthesize speech


WhatsApp


POST   /api/whatsapp/webhook                     - Receive webhook (no auth)

POST   /api/whatsapp/send                        - Send message

POST   /api/whatsapp/send-booking-reminder       - Send booking reminder

POST   /api/whatsapp/send-payment-reminder       - Send payment reminder


Automation


POST   /api/automation              - Create automation

GET    /api/automation              - Get automations

PUT    /api/automation/:id          - Update automation

DELETE /api/automation/:id          - Delete automation

POST   /api/automation/followup/send - Send follow-up


💰 Pricing Plans

| Feature | Free | Basic | Pro |

|---------|------|-------|-----|

| Trial | 3 days | - | - |

| Chat Messages | 100/month | 1,000/month | 10,000/month |

| Voice Requests | 50/month | 500/month | 5,000/month |

| WhatsApp Messages | 500/month | Unlimited | Unlimited |

| Price | FREE | ₹299/mo | ₹999/mo |

🔐 Security Features

✅ JWT Authentication

✅ Password hashing with bcryptjs

✅ Helmet for security headers

✅ Rate limiting on API routes

✅ CORS protection

✅ Input validation

✅ SQL injection prevention

✅ XSS protection

⚙️ Cron Jobs

The application includes several automated tasks:

Inactivity Follow-up (Every 6 hours)

   - Checks for inactive users

   - Sends reminder messages

Booking Reminders (Hourly)

   - Finds upcoming bookings (within 24 hours)

   - Sends WhatsApp reminders

Payment Reminders (Daily at 9 AM)

   - Identifies pending payments

   - Sends payment alerts

Trial Expiry Alerts (Daily at 12 PM)

   - Reminds users about expiring trials

   - Encourages plan upgrade

Usage Reset (Monthly - 1st day at 12 AM)

   - Resets monthly usage counters

   - Updates billing cycles

🎤 Voice Assistant Features

Frontend Implementation


// Speech-to-Text (using Web Speech API)

const recognition = new window.webkitSpeechRecognition();

recognition.onresult = (event) => {

  const text = event.results[0][0].transcript;

  // Send to backend

};

// Text-to-Speech

const utterance = new SpeechSynthesisUtterance(text);

window.speechSynthesis.speak(utterance);


Backend Flow

Receive text from frontend

Send to Google Gemini API

Get AI response

Return to frontend

Frontend converts to speech

📱 WhatsApp Integration

Setup Steps

Go to Meta Developer Console

Create a WhatsApp Business Account

Get Phone ID and Access Token

Add webhook URL to Meta

Update `.env` with credentials

Sample Webhook Handler


// Automatically receives incoming messages

POST /api/whatsapp/webhook

// Processing incoming messages

- Store in database

- Trigger automations

- Send auto-reply

- Update customer interaction stats


📊 Database Models

User Model


{

  email, password, firstName, lastName,

  role, isDeveloper,

  subscription: {plan, status, startDate, endDate, autoRenew},

  trial: {isActive, startDate, endDate, daysRemaining},

  usage: {chatMessages, voiceRequests, whatsappMessages, ...},

  whatsappConfig,

  preferences: {language, tone, timezone, ...}

}


Chat Model


{

  userId, customerId, conversationId,

  messages: [{role, content, tone, language}],

  metadata: {source, platform, sessionId},

  ai: {model, temperature, systemPrompt}

}


Payment Model


{

  userId, orderId, paymentId, signature,

  plan, amount, currency, paymentMethod, status,

  subscriptionPeriod: {startDate, endDate, durationMonths}

}


🧪 Testing

Using Postman

Import the Postman collection (postman-collection.json)

Set environment variables:

   - `base_url`: http://localhost:5000/api

   - `token`: (automatically set after login)

Test endpoints:

   - Register user

   - Login

   - Send chat message

   - Create payment order

   - etc.

Sample cURL Commands


# Register

curl -X POST http://localhost:5000/api/auth/register \\

  -H "Content-Type: application/json" \\

  -d '{

    "email":"user@example.com",

    "password":"password123",

    "firstName":"John",

    "lastName":"Doe"

  }'

# Login

curl -X POST http://localhost:5000/api/auth/login \\

  -H "Content-Type: application/json" \\

  -d '{

    "email":"user@example.com",

    "password":"password123"

  }'

# Send Chat Message

curl -X POST http://localhost:5000/api/chat/send \\

  -H "Content-Type: application/json" \\

  -H "Authorization: Bearer YOUR_TOKEN" \\

  -d '{

    "message":"Hello AI",

    "conversationId":"conv_123"

  }'


🌍 Environment Variables


# Server

PORT=5000

NODE_ENV=development

FRONTEND_URL=http://localhost:3000

# Database

MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/whatsapp-crm

# JWT

JWT_SECRET=your_super_secret_jwt_key_12345

DEVELOPER_CODE=SUPER_SECRET_DEVELOPER_CODE

# AI

GEMINI_API_KEY=your_gemini_api_key

# Payment

RAZORPAY_KEY_ID=your_razorpay_key

RAZORPAY_KEY_SECRET=your_razorpay_secret

STRIPE_SECRET_KEY=your_stripe_secret_key

# WhatsApp

WHATSAPP_API_KEY=your_whatsapp_api_key

WHATSAPP_PHONE_ID=your_phone_id

WHATSAPP_ACCESS_TOKEN=your_access_token

# Email

SENDGRID_API_KEY=your_sendgrid_api_key

# SMS

TWILIO_ACCOUNT_SID=your_twilio_sid

TWILIO_AUTH_TOKEN=your_twilio_token

TWILIO_PHONE_NUMBER=+1234567890


🌐 Live Demo

Production Deployment

Frontend (Vercel): https://ai-whatsapp-crm-1.vercel.app

Backend (Render): https://ai-whatsapp-crm-backend.onrender.com

Database: MongoDB Atlas (Cloud)

📈 Deployment

Backend (Render)


# Deploy to Render

git push origin master

🐛 Troubleshooting

Issue: "Cannot find module '@google/generative-ai'"

Solution: Install the package


npm install @google/generative-ai


Issue: "MongoDB connection failed"

Solution: Check MONGO_URI in .env and ensure MongoDB is running

Issue: "JWT token expired"

Solution: Re-login to get a new token (tokens expire in 30 days)

Issue: "WhatsApp webhook not receiving messages"

Solution:

Verify webhook URL in Meta Developer Console

Check webhook token in code

Ensure firewall allows incoming requests

📚 Additional Resources

Google Generative AI Docs

Meta WhatsApp API

Razorpay Integration

Stripe API

Twilio WhatsApp

🤝 Contributing

Fork the repository

Create a feature branch (`git checkout -b feature/amazing-feature`)

Commit changes (`git commit -m 'Add amazing feature'`)

Push to branch (`git push origin feature/amazing-feature`)

Open a Pull Request

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

💬 Support

For issues and questions:

Open an issue on GitHub

Email: support@example.com

Discord: Join our community

✨ Roadmap

WhatsApp Group Management

Advanced Analytics Dashboard

Custom AI Model Training

Mobile App (React Native)

Video Calling Integration

Advanced Scheduling

Team Collaboration Features

API Rate Limit Dashboard

Custom Webhooks

Third-party Integration Marketplace

Made with ❤️ by @mash157 
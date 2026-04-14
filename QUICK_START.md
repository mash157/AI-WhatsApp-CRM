# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- MongoDB ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Git ([Download](https://git-scm.com/))

---

## Step 1: Clone the Repository

```bash
cd /path/to/project
git clone . # or extract the provided files
```

---

## Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your API keys:
# - MongoDB URI
# - JWT Secret
# - Google Gemini API Key
# - Payment API Keys (Razorpay/Stripe)
# - WhatsApp API Keys
notepad .env  # Windows
# or nano .env  # Mac/Linux

# Start backend server
npm run dev
# Server will run on http://localhost:5000
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
✅ Cron jobs initialized
🚀 Server is running on port 5000
📍 Environment: development
📊 API Base URL: http://localhost:5000/api
```

---

## Step 3: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo REACT_APP_API_URL=http://localhost:5000/api > .env

# Start frontend development server
npm start
# Frontend will run on http://localhost:3000
```

**Expected Output:**
```
Compiled successfully!
You can now view whatsapp-crm-frontend in the browser.
  Local:            http://localhost:3000
```

---

## Step 4: Test the Application

### Register a New User

1. Open http://localhost:3000/register
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `password123`
   - First Name: `John`
   - Last Name: `Doe`
3. Click "Create Account"

### Login

1. Go to http://localhost:3000/login
2. Use credentials from registration
3. You'll be redirected to dashboard

### Test Chat

1. On dashboard, type a message in the chat input
2. Click "Send"
3. Gemini AI will respond automatically

### Test Voice Input

1. Click the microphone icon 🎤
2. Speak clearly
3. Message will be sent to AI

### Test Payments

1. Go to user profile
2. Click "Upgrade to Pro"
3. Choose Razorpay or Stripe
4. Complete payment (use test cards)

**Razorpay Test Card:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

**Stripe Test Card:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVV: Any 3 digits

---

## Step 5: API Testing with Postman

### Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `postman-collection.json`
4. Collections will be imported with all endpoints

### Set Environment Variables

1. Create new environment
2. Add variables:
   - `base_url`: http://localhost:5000/api
   - `token`: (will be set after login)

### Test Authentication

1. Go to Auth → Register
2. Click Send
3. Check response for token
4. Copy token and set environment variable

---

## Environment Variables Quick Reference

### Backend (.env)

```env
# Required
MONGO_URI=mongodb://localhost:27017/whatsapp-crm
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_key

# Optional (for full features)
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
STRIPE_SECRET_KEY=your_key
WHATSAPP_PHONE_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_token
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
- Make sure MongoDB is running
- Check MONGO_URI in .env
- For MongoDB Atlas, ensure IP is whitelisted

```bash
# Start local MongoDB
mongod  # Windows/Mac/Linux
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Module Not Found

**Error:** `Cannot find module '@google/generative-ai'`

**Solution:**
```bash
npm install @google/generative-ai
```

### CORS Error

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Make sure backend is running
- Check FRONTEND_URL in backend .env
- Ensure frontend URL matches in CORS config

---

## 📚 Default Test Credentials

**Developer Account:**
- Email: `dev@example.com`
- Password: `dev123456`
- Developer Code: `SUPER_SECRET_DEVELOPER_CODE`

**Regular User:**
- Email: `user@example.com`
- Password: `user123456`

---

## 🧪 Quick API Test

```bash
# Test server health
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "firstName":"John",
    "lastName":"Doe"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```

---

## 📁 Important Files to Check

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration |
| `frontend/.env` | Frontend configuration |
| `backend/app.js` | Express app setup |
| `backend/server.js` | Server entry point |
| `frontend/src/App.js` | React app setup |
| `README.md` | Full documentation |

---

## 🚀 Next Steps

1. **Connect WhatsApp**: Add WhatsApp credentials in user profile
2. **Create Automations**: Set up automated follow-ups and reminders
3. **Invite Team**: Add users to your organization
4. **Configure Payments**: Connect Razorpay/Stripe for production
5. **Deploy**: Push to production using Heroku/Railway/Vercel

---

## 📞 Need Help?

- Check console logs for errors
- Review .env file for typos
- Ensure all APIs keys are valid
- Check backend server is running on port 5000
- Check frontend server is running on port 3000

---

## ✨ What's Next?

After setup, you can:
- Add more automation rules
- Customize AI tone and behavior
- Integrate with CRM software
- Setup webhooks for external apps
- Create custom reports and analytics

Happy coding! 🎉

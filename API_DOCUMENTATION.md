# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer <your_token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "trial": {
      "isActive": true,
      "daysRemaining": 3
    },
    "subscription": {
      "plan": "free",
      "status": "active"
    }
  },
  "token": "eyJhbGc..."
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - User already exists

---

### 2. Login User
**POST** `/auth/login`

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "role": "user",
    "isDeveloper": false,
    "trial": {...},
    "subscription": {...},
    "usage": {...}
  },
  "token": "eyJhbGc..."
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials

---

### 3. Developer Login
**POST** `/auth/developer-login`

Login as developer with special privileges.

**Request Body:**
```json
{
  "email": "dev@example.com",
  "password": "password123",
  "developerCode": "SUPER_SECRET_DEVELOPER_CODE"
}
```

**Response:**
```json
{
  "message": "Developer login successful",
  "user": {
    "id": "user_id",
    "email": "dev@example.com",
    "firstName": "Dev",
    "role": "admin",
    "isDeveloper": true
  },
  "token": "eyJhbGc..."
}
```

**Status Codes:**
- `200` - Developer login successful
- `401` - Invalid credentials or developer code

---

### 4. Get Current User
**GET** `/auth/me` (Protected)

Get the current authenticated user's details.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isDeveloper": false,
    "subscription": {...},
    "trial": {...},
    "usage": {...},
    "preferences": {...}
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found

---

## Chat Endpoints

### 1. Send Message
**POST** `/chat/send` (Protected)

Send a chat message to AI.

**Request Body:**
```json
{
  "message": "Hello, what's the weather?",
  "conversationId": "conv_123",
  "tone": "professional",
  "language": "en"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "chat": {
    "id": "chat_id",
    "conversationId": "conv_123",
    "messages": [
      {
        "role": "user",
        "content": "Hello, what's the weather?",
        "timestamp": "2024-04-11T10:30:00Z"
      }
    ]
  },
  "aiResponse": "I don't have real-time weather data, but..."
}
```

**Limits:**
- Free: 100 messages/month
- Basic: 1,000 messages/month
- Pro: 10,000 messages/month

**Status Codes:**
- `201` - Message sent
- `401` - Unauthorized
- `429` - Limit exceeded
- `403` - Trial expired

---

### 2. Get Conversation
**GET** `/chat/:conversationId` (Protected)

Get a specific conversation.

**Response:**
```json
{
  "chat": {
    "id": "chat_id",
    "conversationId": "conv_123",
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": "2024-04-11T10:30:00Z"
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help?",
        "timestamp": "2024-04-11T10:30:05Z"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Conversation not found

---

### 3. Get All Conversations
**GET** `/chat` (Protected)

Get all conversations for the user.

**Query Parameters:**
- `limit` (optional): Number of conversations to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "conversations": [
    {
      "conversationId": "conv_123",
      "updatedAt": "2024-04-11T10:30:00Z",
      "messages": [...]
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

### 4. Delete Conversation
**DELETE** `/chat/:conversationId` (Protected)

Delete a conversation.

**Response:**
```json
{
  "message": "Conversation deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted
- `401` - Unauthorized
- `404` - Conversation not found

---

## Payment Endpoints

### 1. Create Razorpay Order
**POST** `/payment/razorpay/create-order` (Protected)

Create a payment order for subscription upgrade.

**Request Body:**
```json
{
  "plan": "pro",
  "duration": "yearly"
}
```

**Pricing:**
- Basic Monthly: ₹299 (30 days)
- Basic Yearly: ₹2,999 (365 days)
- Pro Monthly: ₹999 (30 days)
- Pro Yearly: ₹9,999 (365 days)

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "order_123456",
    "amount": 999900,
    "currency": "INR"
  }
}
```

**Status Codes:**
- `201` - Order created
- `400` - Invalid plan
- `401` - Unauthorized

---

### 2. Verify Razorpay Payment
**POST** `/payment/razorpay/verify` (Protected)

Verify payment and activate subscription.

**Request Body:**
```json
{
  "orderId": "order_123456",
  "paymentId": "pay_123456",
  "signature": "sig_123456",
  "plan": "pro",
  "duration": "yearly"
}
```

**Response:**
```json
{
  "message": "Payment verified and subscription activated",
  "payment": {
    "id": "payment_id",
    "status": "completed",
    "plan": "pro"
  }
}
```

**Status Codes:**
- `200` - Payment verified
- `400` - Payment failed
- `401` - Unauthorized

---

### 3. Create Stripe Payment Intent
**POST** `/payment/stripe/create-intent` (Protected)

Create a payment intent for Stripe.

**Request Body:**
```json
{
  "plan": "basic",
  "duration": "monthly"
}
```

**Response:**
```json
{
  "message": "Payment intent created",
  "clientSecret": "pi_1234..._secret_5678...",
  "paymentIntentId": "pi_1234..."
}
```

**Status Codes:**
- `201` - Intent created
- `400` - Invalid plan
- `401` - Unauthorized

---

### 4. Get Payment History
**GET** `/payment/history` (Protected)

Get all payments made by user.

**Response:**
```json
{
  "payments": [
    {
      "id": "payment_id",
      "paymentId": "pay_123",
      "plan": "pro",
      "amount": 99900,
      "currency": "INR",
      "status": "completed",
      "createdAt": "2024-04-11T10:00:00Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized

---

## User Endpoints

### 1. Get Profile
**GET** `/user/profile` (Protected)

Get user profile information.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isDeveloper": false,
    "subscription": {...},
    "trial": {...},
    "usage": {...},
    "whatsappConfig": {...},
    "preferences": {...}
  }
}
```

---

### 2. Update Profile
**PUT** `/user/profile` (Protected)

Update user profile.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "preferences": {
    "language": "en",
    "toneOfVoice": "casual",
    "timezone": "Asia/Kolkata"
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

---

### 3. Get Usage Stats
**GET** `/user/usage` (Protected)

Get usage statistics.

**Response:**
```json
{
  "usage": {
    "chatMessages": 45,
    "maxChatMessages": 100,
    "voiceRequests": 20,
    "maxVoiceRequests": 50,
    "whatsappMessages": 150,
    "maxWhatsappMessages": 1000,
    "resetDate": "2024-05-11T00:00:00Z"
  },
  "usagePercentage": {
    "chat": 45,
    "voice": 40,
    "whatsapp": 15
  },
  "trial": {...},
  "subscription": {...}
}
```

---

### 4. Get Trial Status
**GET** `/user/trial` (Protected)

Get trial status information.

**Response:**
```json
{
  "trial": {
    "isActive": true,
    "startDate": "2024-04-08T00:00:00Z",
    "endDate": "2024-04-11T23:59:59Z",
    "daysRemaining": 0
  }
}
```

---

## Voice Endpoints

### 1. Process Voice
**POST** `/voice/process` (Protected)

Process voice input and get AI response.

**Request Body:**
```json
{
  "text": "What is the capital of France?",
  "language": "en",
  "tone": "professional"
}
```

**Response:**
```json
{
  "message": "Voice request processed successfully",
  "input": "What is the capital of France?",
  "output": "The capital of France is Paris.",
  "language": "en",
  "tone": "professional"
}
```

**Limits:**
- Free: 50 requests/month
- Basic: 500 requests/month
- Pro: 5,000 requests/month

---

### 2. Synthesize Speech
**POST** `/voice/synthesize` (Protected)

Convert text to speech.

**Request Body:**
```json
{
  "text": "Hello, this is a voice message",
  "language": "en"
}
```

**Response:**
```json
{
  "message": "Speech synthesized",
  "text": "Hello, this is a voice message",
  "audioUrl": "https://audio-cdn.com/audio.mp3"
}
```

---

## WhatsApp Endpoints

### 1. Send Message
**POST** `/whatsapp/send` (Protected)

Send a message via WhatsApp.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "message": "Hello from AI CRM!",
  "type": "text"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "messageId": "wamid_123"
}
```

**Error Codes:**
- `400` - WhatsApp not connected
- `429` - Message limit exceeded

---

### 2. Send Booking Reminder
**POST** `/whatsapp/send-booking-reminder` (Protected)

Send an automated booking reminder.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "bookingTitle": "Consultation",
  "bookingDate": "2024-04-20T10:00:00Z"
}
```

---

## Automation Endpoints

### 1. Create Automation
**POST** `/automation` (Protected)

Create a new automation rule.

**Request Body:**
```json
{
  "name": "24H Follow-up",
  "type": "followup",
  "trigger": {
    "event": "user_inactive",
    "timeDelay": {
      "value": 24,
      "unit": "hours"
    }
  },
  "action": {
    "type": "send_whatsapp",
    "message": "We miss you!"
  },
  "schedule": {
    "frequency": "daily"
  }
}
```

**Response:**
```json
{
  "message": "Automation created successfully",
  "automation": {
    "id": "automation_id",
    "name": "24H Follow-up",
    "isActive": true,
    "createdAt": "2024-04-11T10:00:00Z"
  }
}
```

---

### 2. Get Automations
**GET** `/automation` (Protected)

Get all automations for the user.

**Response:**
```json
{
  "automations": [
    {
      "id": "automation_id",
      "name": "24H Follow-up",
      "type": "followup",
      "isActive": true,
      "stats": {
        "executionsCompleted": 10,
        "executionsFailed": 0
      }
    }
  ]
}
```

---

### 3. Update Automation
**PUT** `/automation/:automationId` (Protected)

Update an automation.

**Request Body:**
```json
{
  "isActive": false,
  "name": "Updated Name"
}
```

---

### 4. Delete Automation
**DELETE** `/automation/:automationId` (Protected)

Delete an automation.

---

## Error Responses

### Common Error Format
```json
{
  "error": "Error message",
  "status": 400
}
```

### Error Codes
| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (Trial expired) |
| 404 | Not Found |
| 429 | Too Many Requests / Limit Exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

The API uses rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Header**: `X-RateLimit-Remaining`

---

## Pagination

List endpoints support pagination:
```
GET /api/resource?limit=10&offset=0
```

---

## Testing

Use the provided Postman collection to test all endpoints:
1. Import `postman-collection.json`
2. Set environment variables
3. Test each endpoint

---

For more information, see [README.md](./README.md)

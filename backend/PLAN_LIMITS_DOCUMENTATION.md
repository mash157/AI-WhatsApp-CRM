# Plan-Based Limits Implementation

## Overview
The CRM system now has plan-based limits for automations and contacts. Different subscription plans allow users different capabilities.

## Plan Limits

| Feature | Free | Basic | Pro | Max/Extension |
|---------|------|-------|-----|----------------|
| Automations | 5 | 20 | 100 | Unlimited |
| Contacts | 10 | 50 | 500 | Unlimited |
| Chat Messages | 100 | 500 | 2,000 | Unlimited |
| Voice Requests | 50 | 200 | 1,000 | Unlimited |
| WhatsApp Messages | 1,000 | 5,000 | 20,000 | Unlimited |

## How It Works

### 1. **User Model Updates**
The User schema now tracks:
```javascript
usage: {
  automations: 0,        // Current count
  maxAutomations: 5,     // Based on plan
  contacts: 0,           // Current count
  maxContacts: 10,       // Based on plan
  // ... other metrics
}
```

### 2. **Creating Automations**
When a user tries to create an automation:
1. System checks their subscription plan
2. Verifies they haven't exceeded the automation limit
3. If limit reached: Returns 429 status with limit details
4. If allowed: Creates automation and increments user's automation count
5. Response includes current usage and max allowed

**Example Response (Success):**
```json
{
  "message": "Automation created successfully",
  "automation": { ... },
  "usage": {
    "current": 3,
    "max": 5
  }
}
```

**Example Response (Limit Exceeded):**
```json
{
  "error": "Automation limit (5) exceeded for free plan. Upgrade to create more.",
  "limitExceeded": true,
  "current": 5,
  "max": 5
}
```

### 3. **Adding Contacts**
When a user tries to add a contact:
1. System checks their subscription plan
2. Verifies they haven't exceeded the contact limit
3. If limit reached: Returns 429 status with limit details
4. If allowed: Adds contact and increments user's contact count
5. Response includes current usage and max allowed

**Example Response (Success):**
```json
{
  "message": "Customer added successfully",
  "customer": { ... },
  "usage": {
    "current": 8,
    "max": 10
  }
}
```

### 4. **Deleting Automations**
When a user deletes an automation:
- The system decrements the automation counter
- This frees up space for creating new automations

### 5. **Developers**
- Developers with `isDeveloper: true` bypass all limits
- They have unlimited access to all features

## API Endpoints

### Create Automation
**POST** `/api/automations/create`

**Request:**
```json
{
  "name": "Welcome Message",
  "type": "scheduled",
  "trigger": "new_contact",
  "action": "send_message",
  "schedule": "daily_9am"
}
```

**Response (201 - Success):**
```json
{
  "message": "Automation created successfully",
  "automation": { ... },
  "usage": { "current": 1, "max": 5 }
}
```

**Response (429 - Limit Exceeded):**
```json
{
  "error": "Automation limit (5) exceeded for free plan. Upgrade to create more.",
  "limitExceeded": true,
  "current": 5,
  "max": 5
}
```

### Add Contact
**POST** `/api/users/add-customer`

**Request:**
```json
{
  "phone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "whatsappPhone": "+1234567890",
  "tags": ["vip", "customer"]
}
```

**Response (201 - Success):**
```json
{
  "message": "Customer added successfully",
  "customer": { ... },
  "usage": { "current": 5, "max": 10 }
}
```

**Response (429 - Limit Exceeded):**
```json
{
  "error": "Contact limit (10) exceeded for free plan. Upgrade to add more.",
  "limitExceeded": true,
  "current": 10,
  "max": 10
}
```

### Delete Automation
**DELETE** `/api/automations/:automationId`

**Response (200 - Success):**
```json
{
  "message": "Automation deleted successfully",
  "usage": { "current": 4, "max": 5 }
}
```

### Get Usage Stats
**GET** `/api/users/usage`

**Response:**
```json
{
  "usage": {
    "chatMessages": 45,
    "maxChatMessages": 100,
    "voiceRequests": 12,
    "maxVoiceRequests": 50,
    "whatsappMessages": 230,
    "maxWhatsappMessages": 1000,
    "automations": 3,
    "maxAutomations": 5,
    "contacts": 8,
    "maxContacts": 10,
    "resetDate": "2026-05-12T10:30:00.000Z"
  },
  "usagePercentage": { ... },
  "trial": { ... },
  "subscription": { ... }
}
```

## Files Modified/Created

1. **Created: `/utils/planLimits.js`**
   - Contains `PLAN_LIMITS` configuration
   - Helper functions: `canCreateAutomation()`, `canAddContact()`, `updateUserLimits()`

2. **Updated: `/models/User.js`**
   - Added `usage.automations` and `usage.maxAutomations`
   - Added `usage.contacts` and `usage.maxContacts`

3. **Updated: `/controllers/automationController.js`**
   - `createAutomation()`: Added limit checking and usage tracking
   - `deleteAutomation()`: Added decrement logic

4. **Updated: `/controllers/userController.js`**
   - `addCustomer()`: Added limit checking and usage tracking

## Testing

### Test Creating an Automation (User with Free Plan)
```bash
curl -X POST http://localhost:5000/api/automations/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Automation",
    "type": "scheduled",
    "trigger": "new_contact",
    "action": "send_message"
  }'
```

### Test Adding a Contact (User with Free Plan)
```bash
curl -X POST http://localhost:5000/api/users/add-customer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "phone": "+1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }'
```

### Check Usage Stats
```bash
curl -X GET http://localhost:5000/api/users/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Upgrade Path for Users

When a user hits a limit:
1. They receive a clear error message with their current plan
2. The response includes current usage vs. max allowed
3. User can upgrade their subscription to increase limits
4. After plan upgrade, the `maxAutomations` and `maxContacts` values are automatically updated

## How to Change User's Plan

Update a user's subscription plan:
```bash
curl -X PUT http://localhost:5000/api/users/:userId/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "plan": "pro",
    "status": "active"
  }'
```

## Notes

- Each plan tier allows progressively more features
- Limits reset monthly for message-based metrics
- Automation and contact counts persist until deleted
- Developers automatically have unlimited access
- Plan limits are automatically applied based on subscription status

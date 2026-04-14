# Delete Operations Guide

## Overview
Users can now delete automations and contacts they no longer need or created by mistake. Deleting items automatically decrements the user's usage counters, freeing up space for new creations within their plan limits.

## Delete Automations

### Delete Single Automation

**Endpoint:** `DELETE /api/automation/:automationId`

**Description:** Delete a single automation by ID

**Authentication:** Required (JWT Token)

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/automation/60d5ec49c1234567890abcde \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 - Success):**
```json
{
  "message": "Automation deleted successfully",
  "deletedAutomation": {
    "_id": "60d5ec49c1234567890abcde",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Welcome Message",
    "type": "scheduled",
    "trigger": "new_contact",
    "action": "send_message",
    "isActive": true,
    "createdAt": "2026-04-12T10:00:00.000Z"
  },
  "usage": {
    "current": 2,
    "max": 5
  }
}
```

**Response (404 - Not Found):**
```json
{
  "error": "Automation not found"
}
```

### Delete Multiple Automations

**Endpoint:** `POST /api/automation/delete/multiple`

**Description:** Delete multiple automations at once

**Authentication:** Required (JWT Token)

**Request:**
```bash
curl -X POST http://localhost:5000/api/automation/delete/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "automationIds": [
      "60d5ec49c1234567890abcde",
      "60d5ec49c1234567890abcdf",
      "60d5ec49c1234567890abce0"
    ]
  }'
```

**Response (200 - Success):**
```json
{
  "message": "3 automation(s) deleted successfully",
  "deletedCount": 3,
  "usage": {
    "current": 0,
    "max": 5
  }
}
```

**Response (400 - Bad Request):**
```json
{
  "error": "automationIds must be a non-empty array"
}
```

## Delete Contacts

### Delete Single Contact

**Endpoint:** `DELETE /api/user/customers/:customerId`

**Description:** Delete a single contact/customer by ID

**Authentication:** Required (JWT Token)

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/user/customers/60d5ec49c1234567890abcde \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 - Success):**
```json
{
  "message": "Customer deleted successfully",
  "deletedCustomer": {
    "_id": "60d5ec49c1234567890abcde",
    "userId": "507f1f77bcf86cd799439011",
    "phone": "+1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "whatsappPhone": "+1234567890",
    "tags": ["vip", "customer"],
    "status": "lead",
    "createdAt": "2026-04-12T10:00:00.000Z"
  },
  "usage": {
    "current": 8,
    "max": 10
  }
}
```

**Response (404 - Not Found):**
```json
{
  "error": "Customer not found"
}
```

### Delete Multiple Contacts

**Endpoint:** `POST /api/user/customers/delete/multiple`

**Description:** Delete multiple contacts/customers at once

**Authentication:** Required (JWT Token)

**Request:**
```bash
curl -X POST http://localhost:5000/api/user/customers/delete/multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerIds": [
      "60d5ec49c1234567890abcde",
      "60d5ec49c1234567890abcdf",
      "60d5ec49c1234567890abce0",
      "60d5ec49c1234567890abce1"
    ]
  }'
```

**Response (200 - Success):**
```json
{
  "message": "4 customer(s) deleted successfully",
  "deletedCount": 4,
  "usage": {
    "current": 6,
    "max": 10
  }
}
```

**Response (400 - Bad Request):**
```json
{
  "error": "customerIds must be a non-empty array"
}
```

## Usage Counter Behavior

### Before Delete
- User has: 3 automations created (out of 5 allowed)
- User has: 7 contacts added (out of 10 allowed)

### After Deleting 2 Automations
- User now has: 1 automation (out of 5 allowed)
- User can create 4 more automations if needed

### After Deleting 3 Contacts
- User now has: 4 contacts (out of 10 allowed)
- User can add 6 more contacts if needed

## Features

✅ **Single Delete** - Remove one automation or contact at a time
✅ **Batch Delete** - Remove multiple items at once
✅ **Usage Counter Updates** - Automatically decrements when items are deleted
✅ **Error Handling** - Clear error messages if item not found or already deleted
✅ **Ownership Verification** - Can only delete own automations/contacts
✅ **Usage Feedback** - Response includes updated usage stats

## Error Scenarios

### Item Not Found
Returns 404 when trying to delete non-existent or already deleted item:
```json
{
  "error": "Automation not found"
}
```

### Invalid Request
Returns 400 for invalid request data:
```json
{
  "error": "automationIds must be a non-empty array"
}
```

### Unauthorized
Returns 401 if JWT token missing or invalid:
```json
{
  "error": "Unauthorized"
}
```

## Best Practices

1. **Confirmation Before Delete** - Always ask user for confirmation before deleting
2. **Show Current Usage** - Display current usage limits before any delete operation
3. **Batch Operations** - Use batch delete for better UI/UX when removing multiple items
4. **Undo Option** - Consider implementing soft deletes if you want undo functionality
5. **Audit Trail** - Log which items were deleted for accountability

## Frontend Implementation Example

### Delete Single Automation
```javascript
const deleteAutomation = async (automationId) => {
  if (!window.confirm('Are you sure you want to delete this automation?')) {
    return;
  }

  try {
    const response = await fetch(`/api/automation/${automationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      alert('Automation deleted successfully!');
      console.log('Updated usage:', data.usage);
      // Refresh automations list
      fetchAutomations();
    } else {
      alert('Failed to delete automation');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Delete Multiple Automations
```javascript
const deleteMultipleAutomations = async (automationIds) => {
  if (!window.confirm(`Delete ${automationIds.length} automations?`)) {
    return;
  }

  try {
    const response = await fetch('/api/automation/delete/multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ automationIds })
    });

    if (response.ok) {
      const data = await response.json();
      alert(`${data.deletedCount} automations deleted!`);
      console.log('Updated usage:', data.usage);
      // Refresh automations list
      fetchAutomations();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Delete Single Contact
```javascript
const deleteContact = async (customerId) => {
  if (!window.confirm('Are you sure you want to delete this contact?')) {
    return;
  }

  try {
    const response = await fetch(`/api/user/customers/${customerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      alert('Contact deleted successfully!');
      console.log('Updated usage:', data.usage);
      // Refresh contacts list
      fetchContacts();
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Database Impact

When you delete an automation or contact:
1. ✅ Item is permanently removed from database
2. ✅ User's usage counter is decremented
3. ✅ User can immediately create new items (if within plan limit)
4. ✅ All associated data is cleaned up

## Rate Limiting

Delete operations are rate-limited to 100 requests per 15 minutes per IP address (same as other API endpoints).

## Support

For issues with delete operations, check:
1. Is the JWT token valid?
2. Does the item belong to the authenticated user?  
3. Is the item ID in correct MongoDB ObjectId format?
4. Has the item already been deleted?

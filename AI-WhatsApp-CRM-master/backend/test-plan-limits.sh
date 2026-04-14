#!/bin/bash

# CRM Plan Limits Testing Script
# Usage: bash test-plan-limits.sh OR powershell .\test-plan-limits.ps1

BASE_URL="http://localhost:5000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# You need to set these variables
# Get JWT_TOKEN from login response
JWT_TOKEN="${1:-your_jwt_token_here}"

if [ "$JWT_TOKEN" = "your_jwt_token_here" ]; then
  echo -e "${RED}Error: Please provide JWT token as argument${NC}"
  echo "Usage: bash test-plan-limits.sh 'your_jwt_token'"
  exit 1
fi

echo -e "${YELLOW}=== CRM Plan Limits Testing ===${NC}\n"

# 1. Get Current Usage Stats
echo -e "${YELLOW}1. Getting Current Usage Stats...${NC}"
curl -s -X GET "$BASE_URL/users/usage" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || echo "Error fetching usage"
echo -e "\n"

# 2. Try to Create First Automation
echo -e "${YELLOW}2. Creating First Automation...${NC}"
AUTOMATION_1=$(curl -s -X POST "$BASE_URL/automations/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Welcome Message - Test 1",
    "type": "scheduled",
    "trigger": "new_contact",
    "action": "send_message",
    "schedule": "daily_9am"
  }')
echo "$AUTOMATION_1" | jq '.' 2>/dev/null || echo "Error creating automation"
AUTOMATION_1_ID=$(echo "$AUTOMATION_1" | jq -r '.automation._id' 2>/dev/null)
echo -e "\n"

# 3. Try to Create Second Automation
echo -e "${YELLOW}3. Creating Second Automation...${NC}"
curl -s -X POST "$BASE_URL/automations/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Reminder Message - Test 2",
    "type": "scheduled",
    "trigger": "customer_action",
    "action": "send_message",
    "schedule": "weekly_monday"
  }' | jq '.' 2>/dev/null || echo "Error creating automation"
echo -e "\n"

# 4. Try to Create Third Automation
echo -e "${YELLOW}4. Creating Third Automation...${NC}"
curl -s -X POST "$BASE_URL/automations/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Follow-up Message - Test 3",
    "type": "triggered",
    "trigger": "purchase",
    "action": "send_followup",
    "schedule": "immediate"
  }' | jq '.' 2>/dev/null || echo "Error creating automation"
echo -e "\n"

# 5. Add First Contact
echo -e "${YELLOW}5. Adding First Contact...${NC}"
CUSTOMER_1=$(curl -s -X POST "$BASE_URL/users/add-customer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "phone": "+1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "whatsappPhone": "+1234567890",
    "tags": ["vip", "customer"]
  }')
echo "$CUSTOMER_1" | jq '.' 2>/dev/null || echo "Error adding customer"
echo -e "\n"

# 6. Add Multiple Contacts
echo -e "${YELLOW}6. Adding More Contacts...${NC}"
for i in {2..9}; do
  echo "   Adding contact $i..."
  curl -s -X POST "$BASE_URL/users/add-customer" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "{
      \"phone\": \"+123456789$i\",
      \"firstName\": \"Customer\",
      \"lastName\": \"$i\",
      \"email\": \"customer$i@example.com\",
      \"tags\": [\"test\"]
    }" | jq '.usage' 2>/dev/null || echo "Error adding customer $i"
done
echo -e "\n"

# 7. Try to Exceed Contact Limit
echo -e "${YELLOW}7. Testing Contact Limit (Should Fail)...${NC}"
curl -s -X POST "$BASE_URL/users/add-customer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "phone": "+19999999999",
    "firstName": "OverLimit",
    "lastName": "Contact",
    "email": "overlimit@example.com"
  }' | jq '.' 2>/dev/null || echo "Error testing limit"
echo -e "\n"

# 8. Check Updated Usage Stats
echo -e "${YELLOW}8. Checking Updated Usage Stats...${NC}"
curl -s -X GET "$BASE_URL/users/usage" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || echo "Error fetching usage"
echo -e "\n"

# 9. Delete an Automation (to free up space)
if [ ! -z "$AUTOMATION_1_ID" ] && [ "$AUTOMATION_1_ID" != "null" ]; then
  echo -e "${YELLOW}9. Deleting First Automation...${NC}"
  curl -s -X DELETE "$BASE_URL/automations/$AUTOMATION_1_ID" \
    -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || echo "Error deleting automation"
  echo -e "\n"

  # 10. Try to Create Another Automation (Should Succeed Now)
  echo -e "${YELLOW}10. Creating New Automation (After Deletion)...${NC}"
  curl -s -X POST "$BASE_URL/automations/create" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d '{
      "name": "New Automation After Deletion",
      "type": "scheduled",
      "trigger": "daily_check",
      "action": "send_report"
    }' | jq '.' 2>/dev/null || echo "Error creating automation"
fi
echo -e "\n"

# 11. Final Usage Check
echo -e "${YELLOW}11. Final Usage Stats...${NC}"
curl -s -X GET "$BASE_URL/users/usage" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.' 2>/dev/null || echo "Error fetching usage"
echo -e "\n"

echo -e "${GREEN}=== Testing Complete ===${NC}"
echo ""
echo "Summary:"
echo "- Free Plan allows: 5 automations, 10 contacts"
echo "- Each created automation/contact increments the counter"
echo "- Deleting automations decrements the counter"
echo "- When limit is reached, attempted creation returns 429 status"
echo "- Upgrade plan to increase limits"

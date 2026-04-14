# CRM Plan Limits Testing Script (PowerShell)
# Usage: powershell .\test-plan-limits.ps1 -JwtToken "your_jwt_token"

param(
    [Parameter(Mandatory=$true)]
    [string]$JwtToken,
    
    [string]$BaseUrl = "http://localhost:5000/api"
)

# Colors
$Green = 'Green'
$Red = 'Red'
$Yellow = 'Yellow'

Write-Host "=== CRM Plan Limits Testing ===" -ForegroundColor $Yellow
Write-Host ""

# Helper function to make API calls
function Invoke-CrmApi {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = @{}
    )
    
    $Headers = @{
        "Authorization" = "Bearer $JwtToken"
        "Content-Type" = "application/json"
    }
    
    $Url = "$BaseUrl$Endpoint"
    
    if ($Body.Count -gt 0) {
        $BodyJson = $Body | ConvertTo-Json
        Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -Body $BodyJson
    } else {
        Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers
    }
}

try {
    # 1. Get Current Usage Stats
    Write-Host "1. Getting Current Usage Stats..." -ForegroundColor $Yellow
    $usage = Invoke-CrmApi -Method "GET" -Endpoint "/users/usage"
    $usage | ConvertTo-Json | Write-Host
    Write-Host ""
    
    # 2. Create First Automation
    Write-Host "2. Creating First Automation..." -ForegroundColor $Yellow
    $automation1 = Invoke-CrmApi -Method "POST" -Endpoint "/automations/create" -Body @{
        name = "Welcome Message - Test 1"
        type = "scheduled"
        trigger = "new_contact"
        action = "send_message"
        schedule = "daily_9am"
    }
    $automation1 | ConvertTo-Json | Write-Host
    $automation1Id = $automation1.automation._id
    Write-Host ""
    
    # 3. Create Second Automation
    Write-Host "3. Creating Second Automation..." -ForegroundColor $Yellow
    $automation2 = Invoke-CrmApi -Method "POST" -Endpoint "/automations/create" -Body @{
        name = "Reminder Message - Test 2"
        type = "scheduled"
        trigger = "customer_action"
        action = "send_message"
        schedule = "weekly_monday"
    }
    $automation2 | ConvertTo-Json | Write-Host
    Write-Host ""
    
    # 4. Create Third Automation
    Write-Host "4. Creating Third Automation..." -ForegroundColor $Yellow
    $automation3 = Invoke-CrmApi -Method "POST" -Endpoint "/automations/create" -Body @{
        name = "Follow-up Message - Test 3"
        type = "triggered"
        trigger = "purchase"
        action = "send_followup"
        schedule = "immediate"
    }
    $automation3 | ConvertTo-Json | Write-Host
    Write-Host ""
    
    # 5. Add First Contact
    Write-Host "5. Adding First Contact..." -ForegroundColor $Yellow
    $customer1 = Invoke-CrmApi -Method "POST" -Endpoint "/users/add-customer" -Body @{
        phone = "+1234567890"
        firstName = "John"
        lastName = "Doe"
        email = "john@example.com"
        whatsappPhone = "+1234567890"
        tags = @("vip", "customer")
    }
    $customer1 | ConvertTo-Json | Write-Host
    Write-Host ""
    
    # 6. Add Multiple Contacts
    Write-Host "6. Adding More Contacts..." -ForegroundColor $Yellow
    for ($i = 2; $i -le 9; $i++) {
        Write-Host "   Adding contact $i..."
        $customer = Invoke-CrmApi -Method "POST" -Endpoint "/users/add-customer" -Body @{
            phone = "+123456789$i"
            firstName = "Customer"
            lastName = "$i"
            email = "customer$i@example.com"
            tags = @("test")
        }
        $customer.usage | ConvertTo-Json | Write-Host
    }
    Write-Host ""
    
    # 7. Try to Exceed Contact Limit
    Write-Host "7. Testing Contact Limit (Should Fail)..." -ForegroundColor $Yellow
    try {
        $overLimit = Invoke-CrmApi -Method "POST" -Endpoint "/users/add-customer" -Body @{
            phone = "+19999999999"
            firstName = "OverLimit"
            lastName = "Contact"
            email = "overlimit@example.com"
        }
        $overLimit | ConvertTo-Json | Write-Host
    } catch {
        $_.Exception.Response | Write-Host -ForegroundColor $Red
    }
    Write-Host ""
    
    # 8. Check Updated Usage Stats
    Write-Host "8. Checking Updated Usage Stats..." -ForegroundColor $Yellow
    $updatedUsage = Invoke-CrmApi -Method "GET" -Endpoint "/users/usage"
    $updatedUsage | ConvertTo-Json | Write-Host
    Write-Host ""
    
    # 9. Delete an Automation
    if ($automation1Id) {
        Write-Host "9. Deleting First Automation..." -ForegroundColor $Yellow
        $deleted = Invoke-CrmApi -Method "DELETE" -Endpoint "/automations/$automation1Id"
        $deleted | ConvertTo-Json | Write-Host
        Write-Host ""
        
        # 10. Try to Create Another Automation
        Write-Host "10. Creating New Automation (After Deletion)..." -ForegroundColor $Yellow
        $newAutomation = Invoke-CrmApi -Method "POST" -Endpoint "/automations/create" -Body @{
            name = "New Automation After Deletion"
            type = "scheduled"
            trigger = "daily_check"
            action = "send_report"
        }
        $newAutomation | ConvertTo-Json | Write-Host
        Write-Host ""
    }
    
    # 11. Final Usage Check
    Write-Host "11. Final Usage Stats..." -ForegroundColor $Yellow
    $finalUsage = Invoke-CrmApi -Method "GET" -Endpoint "/users/usage"
    $finalUsage | ConvertTo-Json | Write-Host
    Write-Host ""
    
    Write-Host "=== Testing Complete ===" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor $Yellow
    Write-Host "- Free Plan allows: 5 automations, 10 contacts"
    Write-Host "- Each created automation/contact increments the counter"
    Write-Host "- Deleting automations decrements the counter"
    Write-Host "- When limit is reached, attempted creation returns 429 status"
    Write-Host "- Upgrade plan to increase limits"
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor $Red
    Write-Host ""
    Write-Host "Make sure:"
    Write-Host "1. Backend server is running on http://localhost:5000"
    Write-Host "2. MongoDB Atlas is connected"
    Write-Host "3. JWT Token is valid"
}

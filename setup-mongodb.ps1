# MongoDB & Docker Quick Setup Script for Windows PowerShell

Write-Host ""
Write-Host "======================================"
Write-Host "  WhatsApp CRM - MongoDB Quick Setup"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
$docker_check = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Docker is installed" -ForegroundColor Green
Write-Host "Version: $docker_check"

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host ""
    Write-Host "[ERROR] docker-compose.yml not found in current directory" -ForegroundColor Red
    Write-Host "Please ensure you're in the project root directory"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "======================================"
Write-Host "  Starting MongoDB & Mongo Express"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Start Docker containers
Write-Host "Starting containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to start Docker containers" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[OK] Containers started successfully!" -ForegroundColor Green
Write-Host ""

# Wait for MongoDB to be ready
Write-Host "Waiting for MongoDB to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Display useful information
Write-Host ""
Write-Host "======================================"
Write-Host "  MongoDB Setup Complete!"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Write-Host "MongoDB Connection Details:" -ForegroundColor Cyan
Write-Host "----------------------------"
Write-Host "Connection String:"
Write-Host "mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin" -ForegroundColor Yellow
Write-Host ""
Write-Host "MongoDB Address: localhost:27017" -ForegroundColor Yellow
Write-Host "Username: whatsapp_admin" -ForegroundColor Yellow
Write-Host "Password: whatsapp_secure_password_123" -ForegroundColor Yellow
Write-Host "Database: whatsappdb" -ForegroundColor Yellow
Write-Host ""

Write-Host "Useful Tools:" -ForegroundColor Cyan
Write-Host "----------------------------"
Write-Host "1. MongoDB Compass (GUI)"
Write-Host "   Download from: https://www.mongodb.com/products/tools/compass"
Write-Host "   Connection: localhost:27017 (with credentials above)"
Write-Host ""
Write-Host "2. Mongo Express (Web UI)" -ForegroundColor Green
Write-Host "   Access at: http://localhost:8081"
Write-Host "   Username: admin"
Write-Host "   Password: admin123"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "----------------------------"
Write-Host "1. Copy .env.example to .env (in backend folder)"
Write-Host "2. Update MongoDB connection string in .env if needed"
Write-Host "3. Run: npm install (if not done)"
Write-Host "4. Run: npm start"
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "----------------------------"
Write-Host "Stop MongoDB:     docker-compose down"
Write-Host "View logs:        docker-compose logs -f mongodb"
Write-Host "Stop all:         docker-compose down -v"
Write-Host ""

Write-Host "Setup complete! Press Enter to exit..." -ForegroundColor Green
Read-Host

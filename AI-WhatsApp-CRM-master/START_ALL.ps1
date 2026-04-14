# Complete WhatsApp CRM Startup Script (PowerShell)

Write-Host ""
Write-Host "======================================"
Write-Host "  WhatsApp CRM - Complete Startup"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check if running from project root
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "[ERROR] Not in project root directory" -ForegroundColor Red
    Write-Host "Please run from: WhatsApp Business Automation CRM folder"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Docker
$docker_check = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Docker not installed" -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Docker installed" -ForegroundColor Green

# Check Node
$node_check = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Node.js not installed" -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Node.js installed" -ForegroundColor Green

Write-Host ""
Write-Host "======================================"
Write-Host "  Step 1: Starting MongoDB..."
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to start MongoDB" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] MongoDB started" -ForegroundColor Green
Write-Host "Waiting for MongoDB to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "======================================"
Write-Host "  Step 2: Backend Setup"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Push-Location backend

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env -Force
    Write-Host "[OK] .env created" -ForegroundColor Green
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install backend dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Backend dependencies installed" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "======================================"
Write-Host "  Step 3: Frontend Setup"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

Push-Location frontend

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:5000/api
"@ | Out-File .env -Encoding UTF8
    Write-Host "[OK] .env created" -ForegroundColor Green
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install frontend dependencies" -ForegroundColor Red
        Pop-Location
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[OK] Frontend dependencies installed" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "======================================"
Write-Host "  All Prerequisites Complete!"
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 - MongoDB (Already running)" -ForegroundColor Yellow
Write-Host "  Command: docker-compose logs -f"
Write-Host ""
Write-Host "Terminal 2 - Backend" -ForegroundColor Yellow
Write-Host "  Command: cd backend ; npm start"
Write-Host ""
Write-Host "Terminal 3 - Frontend" -ForegroundColor Yellow
Write-Host "  Command: cd frontend ; npm start"
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Services Status:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000"
Write-Host "- Backend API: http://localhost:5000"
Write-Host "- Mongo Express: http://localhost:8081"
Write-Host "- MongoDB: localhost:27017"
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Green
Read-Host

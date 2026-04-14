@echo off
REM MongoDB & Docker Quick Setup Script for Windows

echo.
echo ======================================
echo  WhatsApp CRM - MongoDB Quick Setup
echo ======================================
echo.

REM Check if Docker is installed
echo Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is installed

REM Check if docker-compose.yml exists
if not exist docker-compose.yml (
    echo.
    echo [ERROR] docker-compose.yml not found in current directory
    echo Please ensure you're in the project root directory
    echo.
    pause
    exit /b 1
)

echo.
echo ======================================
echo  Starting MongoDB & Mongo Express
echo ======================================
echo.

REM Start Docker containers
echo Starting containers...
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start Docker containers
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Containers started successfully!
echo.

REM Wait for MongoDB to be ready
echo Waiting for MongoDB to be ready (30 seconds)...
timeout /t 5 /nobreak

REM Display useful information
echo.
echo ======================================
echo  MongoDB Setup Complete!
echo ======================================
echo.
echo MongoDB Connection Details:
echo ----------------------------
echo Connection String:
echo mongodb://whatsapp_admin:whatsapp_secure_password_123@localhost:27017/whatsappdb?authSource=admin
echo.
echo MongoDB Address: localhost:27017
echo Username: whatsapp_admin
echo Password: whatsapp_secure_password_123
echo Database: whatsappdb
echo.
echo Useful Tools:
echo ----------------------------
echo 1. MongoDB Compass (GUI)
echo    Download from: https://www.mongodb.com/products/tools/compass
echo    Connection: localhost:27017 (with credentials above)
echo.
echo 2. Mongo Express (Web UI)
echo    Access at: http://localhost:8081
echo    Username: admin
echo    Password: admin123
echo.
echo Next Steps:
echo ----------------------------
echo 1. Copy .env.example to .env (in backend folder)
echo 2. Update MongoDB connection string in .env if needed
echo 3. Run: npm install (if not done)
echo 4. Run: npm start
echo.
echo Useful Commands:
echo ----------------------------
echo Stop MongoDB:     docker-compose down
echo View logs:        docker-compose logs -f mongodb
echo Stop all:         docker-compose down -v
echo.
pause

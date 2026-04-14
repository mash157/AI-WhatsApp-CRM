@echo off
REM Complete WhatsApp CRM Startup Script

echo.
echo ======================================
echo  WhatsApp CRM - Complete Startup
echo ======================================
echo.

REM Check if running from project root
if not exist "docker-compose.yml" (
    echo [ERROR] Not in project root directory
    echo Please run from: WhatsApp Business Automation CRM folder
    pause
    exit /b 1
)

echo Checking prerequisites...
echo.

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not installed
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo [OK] Docker installed

REM Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not installed
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js installed

echo.
echo ======================================
echo  Step 1: Starting MongoDB...
echo ======================================
echo.

docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MongoDB
    pause
    exit /b 1
)

echo [OK] MongoDB started
echo Waiting for MongoDB to be ready...
timeout /t 5 /nobreak

echo.
echo ======================================
echo  Step 2: Backend Setup
echo ======================================
echo.

cd backend

if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo [OK] .env created
)

if not exist "node_modules" (
    echo Installing dependencies (this may take a minute)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed
)

cd ..

echo.
echo ======================================
echo  Step 3: Frontend Setup
echo ======================================
echo.

cd frontend

if not exist ".env" (
    echo Creating .env file...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > .env
    echo [OK] .env created
)

if not exist "node_modules" (
    echo Installing dependencies (this may take a minute)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
)

cd ..

echo.
echo ======================================
echo  All Prerequisites Complete!
echo ======================================
echo.
echo To start the application:
echo.
echo Terminal 1 - MongoDB (Already running)
echo   Command: docker-compose logs -f
echo.
echo Terminal 2 - Backend
echo   Command: cd backend ^&^& npm start
echo.
echo Terminal 3 - Frontend
echo   Command: cd frontend ^&^& npm start
echo.
echo Then open: http://localhost:3000
echo.
echo Press Enter to exit...
pause

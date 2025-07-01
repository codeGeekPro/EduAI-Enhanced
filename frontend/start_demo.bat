@echo off
echo ================================
echo     EduAI Demo Startup Script
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the frontend directory.
    pause
    exit /b 1
)

echo [1/6] Checking Node.js and pnpm installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

pnpm --version >nul 2>&1
if errorlevel 1 (
    echo Error: pnpm is not installed
    echo Installing pnpm globally...
    npm install -g pnpm
)

echo [2/6] Installing dependencies...
pnpm install

echo [3/6] Building the application...
pnpm build
if errorlevel 1 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo [4/6] Starting backend services (if available)...
cd ..
if exist "docker-compose.yml" (
    echo Starting Docker services...
    docker-compose up -d --build
) else (
    echo Docker compose file not found, skipping backend services
)

echo [5/6] Starting development server...
cd frontend
start "" cmd /k "echo Frontend server starting... && pnpm dev"

echo [6/6] Opening browser...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ================================
echo Demo is ready! 
echo ================================
echo.
echo Frontend: http://localhost:3000
echo.
echo To demonstrate installation:
echo 1. On Desktop: Look for install icon in browser address bar
echo 2. On Mobile: Use "Add to Home Screen" from browser menu
echo 3. PWA banner will appear automatically for new users
echo.
echo Press any key to open the logs...
pause

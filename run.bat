@echo off
title NexaHR Launcher
cls
echo ========================================================
echo               NexaHR - SaaS HRM System
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if root .env exists
if not exist ".env" (
    echo [!] .env file not found in root directory.
    if exist ".env.example" (
        echo [+] Creating .env from .env.example...
        copy .env.example .env
        echo [*] .env file created. Please make sure database credentials match your setup.
    )
)

:: Check root dependencies
if not exist "node_modules\" (
    echo [*] Installing backend dependencies (npm install)...
    call npm install
    if errorlevel 1 (
        echo [X] Failed to install backend dependencies.
        pause
        exit /b 1
    )
)

:: Check client dependencies
if not exist "client\node_modules\" (
    echo [*] Installing frontend dependencies (npm install in client)...
    cd client
    call npm install
    cd /d "%~dp0"
    if errorlevel 1 (
        echo [X] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
)

echo.
echo [*] Starting Backend Server (Express + Prisma)...
start "NexaHR Backend (Port 5000)" cmd /k "cd /d "%~dp0" && npm run dev"

echo [*] Starting Frontend Client (Vite + React)...
start "NexaHR Frontend (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================================
echo       NexaHR Application Launched Successfully!
echo ========================================================
echo.
echo   Backend API:  http://localhost:5000
echo   Frontend UI:  http://localhost:5173
echo.
echo   Close the opened terminal windows to stop services.
echo ========================================================
echo.
pause

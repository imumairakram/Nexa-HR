@echo off
title NexaHR Launcher
cls
echo ========================================================
echo               NexaHR - SaaS HRM System
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Check if root .env exists
if not exist ".env" (
    echo [!] .env file not found in root directory.
    if exist ".env.example" (
        echo [+] Creating .env from .env.example...
        copy .env.example .env
        echo [*] .env file created. Please ensure database credentials match your setup.
    )
)

:: 2. Check root dependencies
if not exist "node_modules\" (
    echo [*] Installing backend dependencies (npm install)...
    call npm install
    if errorlevel 1 (
        echo [X] Failed to install backend dependencies.
        pause
        exit /b 1
    )
)

:: 3. Generate Prisma client if needed
if exist "prisma\" (
    if not exist "node_modules\.prisma\" (
        echo [*] Generating Prisma Client...
        call npx prisma generate
    )
)

:: 4. Check client dependencies
if not exist "client\node_modules\" (
    echo [*] Installing frontend dependencies (npm install in client)...
    pushd client
    call npm install
    popd
    if errorlevel 1 (
        echo [X] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
)

echo.
echo [*] Starting Backend Server (Express + Prisma on Port 5000)...
start "NexaHR Backend (Port 5000)" /D "%~dp0" cmd /k npm run dev:backend

echo [*] Starting Frontend Client (Vite + React on Port 5173)...
start "NexaHR Frontend (Port 5173)" /D "%~dp0client" cmd /k npm run dev

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

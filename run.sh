#!/usr/bin/env bash

# ========================================================
# NexaHR - SaaS HRM System Launcher (Bash Script)
# Compatible with Git Bash, Linux, macOS, WSL
# ========================================================

# Resolve script directory to allow running from any folder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "========================================================"
echo "              NexaHR - SaaS HRM System                  "
echo "========================================================"
echo ""

# 1. Check Root .env
if [ ! -f ".env" ]; then
    echo "[!] .env file not found in root directory."
    if [ -f ".env.example" ]; then
        echo "[+] Creating .env from .env.example..."
        cp .env.example .env
        echo "[*] .env created. Please ensure database credentials match your setup."
    fi
fi

# 2. Check Root node_modules
if [ ! -d "node_modules" ]; then
    echo "[*] Installing backend dependencies (npm install)..."
    npm install
fi

# 3. Check Prisma Client
if [ -d "prisma" ] && [ ! -d "node_modules/.prisma" ]; then
    echo "[*] Generating Prisma Client..."
    npx prisma generate || true
fi

# 4. Check Client node_modules
if [ ! -d "client/node_modules" ]; then
    echo "[*] Installing frontend dependencies (npm install in client)..."
    (cd client && npm install)
fi

echo ""
echo "[*] Starting NexaHR Application Services..."
echo "    Backend API:  http://localhost:5000"
echo "    Frontend UI:  http://localhost:5173"
echo ""
echo "    Press Ctrl+C at any time to stop all services."
echo "========================================================"
echo ""

# Cleanup trap to ensure background processes are cleanly terminated
cleanup() {
    echo ""
    echo "[*] Stopping all NexaHR services..."
    kill $(jobs -p) 2>/dev/null || true
    wait 2>/dev/null || true
    echo "[*] NexaHR services stopped."
    exit 0
}

trap cleanup INT TERM EXIT

# Start Backend Server
(
    echo "[Backend] Starting on port 5000..."
    npm run dev:backend 2>/dev/null || npm run dev
) &

# Start Frontend Client
(
    echo "[Frontend] Starting on port 5173..."
    cd client && npm run dev
) &

# Wait for background child processes
wait

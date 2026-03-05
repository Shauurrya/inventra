@echo off
title Inventra - Smart Inventory Management
color 0A

echo.
echo  ========================================================
echo  =                                                      =
echo  =        INVENTRA - Smart Inventory Management         =
echo  =        by Inventor Solutions Pvt. Ltd.               =
echo  =                                                      =
echo  ========================================================
echo.

cd /d "%~dp0"

:: ─────────────────────────────────────────────
:: Find Node.js
:: ─────────────────────────────────────────────
set "NODE_PATH="
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files\nodejs"
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files (x86)\nodejs"
)
where node >nul 2>nul && set "NODE_PATH=found_in_path"

if "%NODE_PATH%"=="" (
    echo  ERROR: Node.js is not installed.
    echo  Please download and install from: https://nodejs.org/
    echo  Then run setup.bat first.
    pause
    exit /b 1
)

if not "%NODE_PATH%"=="found_in_path" (
    set "PATH=%NODE_PATH%;%PATH%"
)

echo  [1/4] Checking Node.js...
call node --version
echo.

:: ─────────────────────────────────────────────
:: Check .env.local exists
:: ─────────────────────────────────────────────
echo  [2/4] Checking environment...
if not exist ".env.local" (
    echo.
    echo  WARNING: .env.local not found!
    echo  Please run setup.bat first.
    echo.
    echo  Creating default .env.local for now...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventra"
        echo DIRECT_URL="postgresql://postgres:postgres@localhost:5432/inventra"
        echo NEXTAUTH_SECRET="inventra-dev-secret-key-change-in-production"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo CRON_SECRET="inventra-dev-cron-secret"
    ) > .env.local
    echo  Created .env.local with defaults.
    echo  Edit DATABASE_URL if you use a cloud database.
) else (
    echo        Environment configured.
)
echo.

:: ─────────────────────────────────────────────
:: Install dependencies if needed
:: ─────────────────────────────────────────────
echo  [3/4] Checking dependencies...
if not exist "node_modules\" (
    echo        Installing dependencies... (this may take a few minutes)
    call npm install
    if %errorlevel% neq 0 (
        echo  ERROR: Failed to install dependencies.
        pause
        exit /b 1
    )
    echo        Dependencies installed!
) else (
    echo        Dependencies already installed.
)
echo.

:: ─────────────────────────────────────────────
:: Generate Prisma Client
:: ─────────────────────────────────────────────
echo  [4/4] Generating Prisma client...
call npx prisma generate >nul 2>nul
echo        Prisma client ready.
echo.

:: ─────────────────────────────────────────────
:: Start the development server
:: ─────────────────────────────────────────────
echo  ========================================================
echo  =                                                      =
echo  =   Starting Inventra...                               =
echo  =                                                      =
echo  =   Open in browser: http://localhost:3000              =
echo  =                                                      =
echo  =   Demo Login:                                        =
echo  =     Email:    admin@demo.com                         =
echo  =     Password: Demo@1234                              =
echo  =                                                      =
echo  =   Press Ctrl+C to stop the server                    =
echo  =                                                      =
echo  ========================================================
echo.

call npm run dev

pause

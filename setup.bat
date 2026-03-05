@echo off
title Inventra - First Time Setup
color 0E

echo.
echo  ========================================================
echo  =                                                      =
echo  =        INVENTRA - First Time Setup                   =
echo  =        Smart Inventory Management System             =
echo  =        by Inventor Solutions Pvt. Ltd.               =
echo  =                                                      =
echo  ========================================================
echo.

cd /d "%~dp0"

:: ─────────────────────────────────────────────
:: Step 1: Find Node.js
:: ─────────────────────────────────────────────
echo  [1/6] Checking for Node.js...
set "NODE_PATH="

:: Check common install paths
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files\nodejs"
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files (x86)\nodejs"
)

:: Check if node is already in PATH
where node >nul 2>nul && set "NODE_PATH=found_in_path"

if "%NODE_PATH%"=="" (
    echo.
    echo  ========================================================
    echo  =  ERROR: Node.js is NOT installed!                    =
    echo  =                                                      =
    echo  =  Please download and install from:                   =
    echo  =  https://nodejs.org/  (LTS version recommended)      =
    echo  =                                                      =
    echo  =  After installing, close and reopen this file.       =
    echo  ========================================================
    echo.
    pause
    exit /b 1
)

:: Add Node to PATH for this session if needed
if not "%NODE_PATH%"=="found_in_path" (
    set "PATH=%NODE_PATH%;%PATH%"
)

echo        Found Node.js:
call node --version
echo.

:: ─────────────────────────────────────────────
:: Step 2: Install npm dependencies
:: ─────────────────────────────────────────────
echo  [2/6] Installing dependencies...
if not exist "node_modules\" (
    echo        Running npm install (this may take 2-5 minutes)...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: Failed to install dependencies.
        echo  Try deleting node_modules folder and run this again.
        pause
        exit /b 1
    )
    echo        Dependencies installed successfully!
) else (
    echo        Dependencies already installed.
)
echo.

:: ─────────────────────────────────────────────
:: Step 3: Generate Prisma Client
:: ─────────────────────────────────────────────
echo  [3/6] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo  ERROR: Failed to generate Prisma client.
    pause
    exit /b 1
)
echo        Prisma client ready.
echo.

:: ─────────────────────────────────────────────
:: Step 4: Check / Create .env.local
:: ─────────────────────────────────────────────
echo  [4/6] Checking environment configuration...
if not exist ".env.local" (
    echo.
    echo  No .env.local found. Creating default configuration...
    (
        echo # Database ^(Use Neon.tech or Supabase for free PostgreSQL^)
        echo # Get your free database at: https://neon.tech
        echo # Replace the URL below with your actual database connection string
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventra"
        echo DIRECT_URL="postgresql://postgres:postgres@localhost:5432/inventra"
        echo.
        echo # NextAuth
        echo NEXTAUTH_SECRET="inventra-dev-secret-key-change-in-production"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo.
        echo # Cron Security
        echo CRON_SECRET="inventra-dev-cron-secret"
        echo.
        echo # Optional: Resend for email alerts
        echo RESEND_API_KEY=""
    ) > .env.local
    echo        Created .env.local with defaults.
    echo.
    echo  ========================================================
    echo  =  IMPORTANT: Configure your database!                 =
    echo  =                                                      =
    echo  =  Option A: Local PostgreSQL                          =
    echo  =    - Install PostgreSQL from postgresql.org           =
    echo  =    - Create database: CREATE DATABASE inventra;       =
    echo  =    - Default .env.local should work                   =
    echo  =                                                      =
    echo  =  Option B: Free Cloud Database (recommended)         =
    echo  =    1. Go to https://neon.tech and sign up free       =
    echo  =    2. Create a new project named "inventra"          =
    echo  =    3. Copy the connection string                      =
    echo  =    4. Open .env.local in notepad and replace         =
    echo  =       DATABASE_URL and DIRECT_URL with your string   =
    echo  =                                                      =
    echo  =  Press any key AFTER configuring .env.local...       =
    echo  ========================================================
    echo.
    pause >nul
) else (
    echo        Environment file (.env.local) found.
)
echo.

:: ─────────────────────────────────────────────
:: Step 5: Push database schema
:: ─────────────────────────────────────────────
echo  [5/6] Pushing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo  ========================================================
    echo  =  ERROR: Could not connect to the database!           =
    echo  =                                                      =
    echo  =  Troubleshooting:                                    =
    echo  =  1. Check DATABASE_URL in .env.local is correct      =
    echo  =  2. If using local PostgreSQL, make sure it's        =
    echo  =     running and database "inventra" exists            =
    echo  =  3. If using Neon/Supabase, check connection string  =
    echo  =  4. Make sure you have internet connection            =
    echo  =                                                      =
    echo  =  To edit .env.local:                                  =
    echo  =    notepad .env.local                                 =
    echo  ========================================================
    echo.
    pause
    exit /b 1
)
echo        Database schema pushed successfully!
echo.

:: ─────────────────────────────────────────────
:: Step 6: Seed demo data
:: ─────────────────────────────────────────────
echo  [6/6] Seeding database with demo data...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo  WARNING: Seeding failed. The app will still work but
    echo           without demo data. You can add data manually.
) else (
    echo        Demo data loaded successfully!
)
echo.

:: ─────────────────────────────────────────────
:: Done!
:: ─────────────────────────────────────────────
echo.
echo  ========================================================
echo  =                                                      =
echo  =   Setup Complete!                                    =
echo  =                                                      =
echo  =   To start the app, double-click: run.bat            =
echo  =                                                      =
echo  =   Demo Login Credentials:                            =
echo  =     Email:    admin@demo.com                         =
echo  =     Password: Demo@1234                              =
echo  =                                                      =
echo  ========================================================
echo.

pause

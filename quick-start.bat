@echo off
title Inventra - Quick Start
color 0B

echo.
echo  ========================================================
echo  =                                                      =
echo  =        INVENTRA - Quick Start                        =
echo  =        One-click setup + run                         =
echo  =                                                      =
echo  ========================================================
echo.

cd /d "%~dp0"

:: ─────────────────────────────────────────────
:: Check Node.js
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
    echo  Download from: https://nodejs.org/ (LTS version)
    echo  Install it, then run this file again.
    pause
    exit /b 1
)

if not "%NODE_PATH%"=="found_in_path" (
    set "PATH=%NODE_PATH%;%PATH%"
)

echo  Found Node.js:
call node --version
echo.

:: ─────────────────────────────────────────────
:: Install dependencies
:: ─────────────────────────────────────────────
echo  [1/3] Installing dependencies...
if not exist "node_modules\" (
    call npm install
    if %errorlevel% neq 0 (
        echo  ERROR: npm install failed. Check your internet connection.
        pause
        exit /b 1
    )
) else (
    echo        Already installed.
)
echo.

:: ─────────────────────────────────────────────
:: Generate Prisma + Create env if missing
:: ─────────────────────────────────────────────
echo  [2/3] Preparing environment...
call npx prisma generate >nul 2>nul

if not exist ".env.local" (
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventra"
        echo DIRECT_URL="postgresql://postgres:postgres@localhost:5432/inventra"
        echo NEXTAUTH_SECRET="inventra-dev-secret-key-change-in-production"
        echo NEXTAUTH_URL="http://localhost:3000"
        echo CRON_SECRET="inventra-dev-cron-secret"
    ) > .env.local
)
echo        Ready.
echo.

:: ─────────────────────────────────────────────
:: Launch server
:: ─────────────────────────────────────────────
echo  [3/3] Starting Inventra...
echo.
echo  ========================================================
echo  =                                                      =
echo  =   Open in browser: http://localhost:3000              =
echo  =                                                      =
echo  =   Demo Login:                                        =
echo  =     Email:    admin@demo.com                         =
echo  =     Password: Demo@1234                              =
echo  =                                                      =
echo  =   NOTE: Make sure your database is configured         =
echo  =   in .env.local before logging in.                    =
echo  =   Run setup.bat if database is not set up yet.       =
echo  =                                                      =
echo  =   Press Ctrl+C to stop the server                    =
echo  =                                                      =
echo  ========================================================
echo.

call npm run dev

pause

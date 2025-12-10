@echo off
title LUKTHAN AI Prompt Agent

echo ========================================
echo    LUKTHAN - AI Prompt Agent
echo ========================================
echo.

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] Starting LUKTHAN AI Prompt Agent...
echo.

:: Start Backend in new window
echo [1/2] Starting Backend (FastAPI)...
start "LUKTHAN Backend" cmd /k "cd /d %~dp0backend && pip install -r requirements.txt -q && python -m uvicorn main:app --reload --port 8000"

:: Wait a moment for backend to start
timeout /t 3 /nobreak >nul

:: Start Frontend in new window
echo [2/2] Starting Frontend (React + Vite)...
start "LUKTHAN Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ========================================
echo    Servers are starting...
echo ========================================
echo.
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:5173
echo    API Docs: http://localhost:8000/docs
echo.
echo    Press any key to open the app in browser...
echo ========================================

pause >nul

:: Open browser
start http://localhost:5173

echo.
echo [INFO] App opened in browser.
echo [INFO] Close this window to keep servers running.
echo [INFO] Close the "LUKTHAN Backend" and "LUKTHAN Frontend" windows to stop.
pause

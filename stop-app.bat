@echo off
title Stop LUKTHAN AI Prompt Agent

echo ========================================
echo    Stopping LUKTHAN Servers...
echo ========================================
echo.

:: Kill Python processes (backend)
echo [1/2] Stopping Backend...
taskkill /F /IM python.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo       Backend stopped.
) else (
    echo       Backend was not running.
)

:: Kill Node processes (frontend)
echo [2/2] Stopping Frontend...
taskkill /F /IM node.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo       Frontend stopped.
) else (
    echo       Frontend was not running.
)

echo.
echo ========================================
echo    All servers stopped.
echo ========================================
echo.
pause

@echo off
echo ========================================
echo Yuanxingtu V2.0 Startup Script
echo ========================================
echo.

set ROOT=%~dp0
set ROOT=%ROOT:~0,-1%

echo [1/2] Starting Backend Server (port 3002)...
cd /d %ROOT%\server
start "Backend-V2.0" cmd /k "npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (port 5000)...
cd /d %ROOT%
start "Frontend-V2.0" cmd /k "npm run dev"

echo.
echo ========================================
echo V2.0 Services Started!
echo   Frontend: http://localhost:5000
echo   Backend:  http://localhost:3002
echo ========================================
pause

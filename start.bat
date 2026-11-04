@echo off
title House Price Prediction Launcher
echo ===================================================
echo   Starting House Price Prediction System
echo ===================================================

echo [1/2] Launching Backend API (Flask on http://localhost:8080)...
start "Backend API (Flask)" cmd /k "cd /d "%~dp0backend" && python app.py"

echo [2/2] Launching Frontend UI (Next.js on http://localhost:3000)...
start "Frontend UI (Next.js)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers have been launched in separate terminal windows!
echo - Backend API:  http://localhost:8080 (Health check: http://localhost:8080/health)
echo - Frontend UI:  http://localhost:3000
echo ===================================================
pause


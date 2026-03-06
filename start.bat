@echo off
echo Starting backend and frontend...

start "Backend API" cmd /k "cd backend && python app.py"
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting in separate windows...

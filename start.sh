#!/bin/bash

# Start backend in background
echo "Starting backend..."
cd backend
python app.py &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT

#!/bin/bash
echo "==================================================="
echo "  Starting House Price Prediction System"
echo "==================================================="

# Get repository root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "[1/2] Starting Backend API on http://localhost:8080..."
(cd "$SCRIPT_DIR/backend" && python app.py) &
BACKEND_PID=$!

echo "[2/2] Starting Frontend UI on http://localhost:3000..."
(cd "$SCRIPT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "Both services are running in background!"
echo "- Backend:  http://localhost:8080"
echo "- Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait


#!/bin/bash
# FinMentor AI — Quick Start Script
# Run both backend and frontend with a single command

echo "🚀 Starting FinMentor AI..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.10+"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Backend setup
echo "📦 Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created backend/.env — add your ANTHROPIC_API_KEY for AI explanations"
fi

# Start backend in background
uvicorn main:app --port 8000 --reload &
BACKEND_PID=$!
echo "✅ Backend running at http://localhost:8000"

# Frontend setup
cd ../frontend
echo ""
echo "📦 Setting up frontend..."
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "✅ Starting frontend at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start frontend (blocking)
npm start

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null

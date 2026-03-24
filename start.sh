#!/bin/bash

echo "🚀 Starting SIKBO - Restaurant Analytics Platform"
echo "================================================"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB not running. Please start MongoDB first:"
    echo "   brew services start mongodb/brew/mongodb-community"
    echo "   or: mongod --dbpath /usr/local/var/mongodb"
    exit 1
fi

# Start ML Service
echo "🧠 Starting ML Service..."
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py &
ML_PID=$!
cd ..

# Wait for ML service to start
sleep 5

# Start Backend
echo "⚙️  Starting Backend API..."
cd backend
npm install
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Frontend Dashboard..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ SIKBO is now running!"
echo "📊 Dashboard: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🧠 ML Service: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo '🛑 Stopping SIKBO...'; kill $ML_PID $BACKEND_PID $FRONTEND_PID; exit" INT
wait
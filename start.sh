#!/bin/bash

echo "🚀 Starting SIKBO - Enhanced Restaurant Intelligence System"
echo "=========================================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required dependencies
echo "📋 Checking dependencies..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB not running. Please start MongoDB first:"
    echo "   brew services start mongodb/brew/mongodb-community"
    echo "   or: mongod --dbpath /usr/local/var/mongodb"
    exit 1
fi

echo "✅ Dependencies check completed"

# Start ML Service
echo "🤖 Starting Enhanced ML Service..."
cd ml-service
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
python app.py &
ML_PID=$!
cd ..

# Wait for ML service to start
sleep 5

# Start Backend
echo "⚙️  Starting Enhanced Backend API..."
cd backend
npm install
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting Enhanced Frontend Dashboard..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 SIKBO Enhanced Restaurant Intelligence System is now running!"
echo ""
echo "📊 Services:"
echo "   • Frontend Dashboard:   http://localhost:3000"
echo "   • Backend API:          http://localhost:5001"
echo "   • ML Service:           http://localhost:8001"
echo "   • MongoDB:              mongodb://localhost:27017"
echo ""
echo "🆕 New Features:"
echo "   • Comprehensive Dashboard with Sidebar Navigation"
echo "   • Food Analytics with Sentiment Analysis"
echo "   • Service Quality Analytics"
echo "   • Customer Flow Analysis"
echo "   • Staff Management & Performance Tracking"
echo "   • Raw Materials Cost Analysis"
echo "   • Enhanced Trending Dishes Detection"
echo "   • Review Action Management System"
echo "   • Multi-category Sentiment Analysis (Food/Service/Staff)"
echo ""
echo "🔧 Enhanced ML Capabilities:"
echo "   • Multi-category sentiment classification"
echo "   • Service quality analysis"
echo "   • Staff performance extraction"
echo "   • Raw material cost optimization"
echo "   • Seasonal trend detection"
echo "   • Review action generation"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping SIKBO Enhanced System...'; kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
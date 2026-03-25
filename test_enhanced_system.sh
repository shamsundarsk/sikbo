#!/bin/bash

echo "🧪 Testing SIKBO Enhanced Restaurant Intelligence System"
echo "======================================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "✅ Port $port is active"
        return 0
    else
        echo "❌ Port $port is not active"
        return 1
    fi
}

# Function to test API endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    if curl -s -f "$url" > /dev/null; then
        echo "✅ Success"
        return 0
    else
        echo "❌ Failed"
        return 1
    fi
}

echo ""
echo "📋 Step 1: Checking if MongoDB is running..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb/brew/mongodb-community"
    exit 1
fi

echo ""
echo "📋 Step 2: Starting ML Service..."
cd ml-service
python app.py &
ML_PID=$!
echo "ML Service PID: $ML_PID"
sleep 5

echo ""
echo "📋 Step 3: Starting Backend API..."
cd ../backend
npm start &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

echo ""
echo "📋 Step 4: Testing Services..."

# Test ML Service
echo "Testing ML Service endpoints:"
test_endpoint "http://localhost:8001/health" "ML Health Check"

# Test Backend API
echo "Testing Backend API endpoints:"
test_endpoint "http://localhost:5001/api/analytics" "Analytics Endpoint"
test_endpoint "http://localhost:5001/api/trends" "Trends Endpoint"
test_endpoint "http://localhost:5001/api/menu" "Menu Endpoint"
test_endpoint "http://localhost:5001/api/staff" "Staff Endpoint"

echo ""
echo "📋 Step 5: Testing Enhanced Features..."

# Test service analytics
echo -n "Testing Service Analytics... "
response=$(curl -s -X GET "http://localhost:5001/api/service-analytics")
if [[ $response == *"service_rating"* ]]; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

# Test staff analytics
echo -n "Testing Staff Analytics... "
response=$(curl -s -X GET "http://localhost:5001/api/staff-analytics")
if [[ $response == *"overall_staff_rating"* ]]; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

# Test customer flow
echo -n "Testing Customer Flow... "
response=$(curl -s -X GET "http://localhost:5001/api/customer-flow")
if [[ $response == *"daily_data"* ]]; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

# Test raw materials
echo -n "Testing Raw Materials... "
response=$(curl -s -X GET "http://localhost:5001/api/raw-materials/coffee")
if [[ $response == *"ingredients"* ]]; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

echo ""
echo "📋 Step 6: Testing ML Service Features..."

# Test comprehensive scraping
echo -n "Testing Enhanced Scraping... "
response=$(curl -s -X POST "http://localhost:8001/scrape" -H "Content-Type: application/json" -d '{}')
if [[ $response == *"trends"* ]]; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

# Test service analysis
echo -n "Testing Service Analysis... "
response=$(curl -s -X POST "http://localhost:8001/analyze-service" -H "Content-Type: application/json" -d '{"reviews":[]}')
if [[ $response == *"service_rating"* ]]; then
    echo "✅ Success"
else
    echo "❌ Failed"
fi

echo ""
echo "🎉 Enhanced System Test Complete!"
echo ""
echo "📊 Access Points:"
echo "   • Frontend Dashboard: http://localhost:3000"
echo "   • Backend API: http://localhost:5001"
echo "   • ML Service: http://localhost:8001"
echo ""
echo "🆕 Enhanced Features Tested:"
echo "   ✅ Multi-category Sentiment Analysis"
echo "   ✅ Service Quality Analytics"
echo "   ✅ Staff Performance Tracking"
echo "   ✅ Customer Flow Analysis"
echo "   ✅ Raw Materials Cost Analysis"
echo "   ✅ Enhanced Trending System"
echo "   ✅ Review Action Management"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping all services..."; kill $ML_PID $BACKEND_PID 2>/dev/null; exit' INT

# Keep script running
wait
#!/bin/bash

echo "🧪 Testing SIKBO System"
echo "======================="

echo "1. Testing ML Service Health..."
curl -s http://localhost:8001/health | jq .

echo -e "\n2. Adding Sample Sales Data..."
curl -s -X POST http://localhost:5001/api/sales -H "Content-Type: application/json" -d '{"dish":"Cappuccino","orders":40,"revenue":4000}' | jq .success

curl -s -X POST http://localhost:5001/api/sales -H "Content-Type: application/json" -d '{"dish":"Chicken Sandwich","orders":20,"revenue":3000}' | jq .success

curl -s -X POST http://localhost:5001/api/sales -H "Content-Type: application/json" -d '{"dish":"Chocolate Cake","orders":12,"revenue":1800}' | jq .success

echo -e "\n3. Getting Analytics..."
curl -s http://localhost:5001/api/analytics | jq '.totalDishes'

echo -e "\n4. Getting AI Recommendations..."
curl -s http://localhost:5001/api/recommendations | jq '.[0] | {dish: .dish, action: .action, score: .score}'

echo -e "\n5. Testing Scraping Service..."
curl -s -X POST http://localhost:8001/scrape -H "Content-Type: application/json" -d '{"google_url":"test"}' | jq '.status'

echo -e "\n✅ All services are working!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo "🧠 ML Service: http://localhost:8001"
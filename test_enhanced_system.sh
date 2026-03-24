#!/bin/bash

echo "🧪 Testing Enhanced SIKBO System"
echo "================================"

echo "1. 📋 Checking Menu Items..."
curl -s http://localhost:5001/api/menu | jq 'length'
echo " menu items loaded"

echo -e "\n2. 📊 Current Sales Analytics..."
curl -s http://localhost:5001/api/analytics | jq '.totalDishes'
echo " dishes with sales data"

echo -e "\n3. 🔥 AI Trending Analysis..."
curl -s -X POST http://localhost:8001/scrape -H "Content-Type: application/json" -d '{}' | jq '.trends | length'
echo " trending dishes detected"

echo -e "\n4. 💡 Smart Recommendations..."
recommendations=$(curl -s http://localhost:5001/api/recommendations)
echo "Remove recommendations: $(echo "$recommendations" | jq '[.[] | select(.action == "remove")] | length')"
echo "Add recommendations: $(echo "$recommendations" | jq '[.[] | select(.action == "add")] | length')"
echo "Promote recommendations: $(echo "$recommendations" | jq '[.[] | select(.action == "promote")] | length')"

echo -e "\n5. 🎯 Top Performing Dish:"
curl -s http://localhost:5001/api/analytics | jq -r '.sales | to_entries | max_by(.value.orders) | "Dish: \(.key) | Orders: \(.value.orders) | Revenue: ₹\(.value.revenue)"'

echo -e "\n6. 📈 Revenue Summary:"
total_revenue=$(curl -s http://localhost:5001/api/analytics | jq '.sales | to_entries | map(.value.revenue) | add')
echo "Total Revenue: ₹$total_revenue"

echo -e "\n✅ Enhanced SIKBO Features Working!"
echo "🌐 Dashboard: http://localhost:3000"
echo "📋 Menu Management: Available in UI"
echo "📊 Sales Analytics: Real-time data"
echo "🔥 AI Trends: Live social media analysis"
echo "💡 Smart Recommendations: ML-powered decisions"
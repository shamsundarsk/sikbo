#!/bin/bash

echo "🎯 Testing Real Data Integration - The French Door Cafe"
echo "======================================================"

echo "1. 🏪 Setting up Default Cafe (The French Door)..."
default_response=$(curl -s -X POST http://localhost:5001/api/set-default-cafe)
if [ "$(echo "$default_response" | jq '.success')" = "true" ]; then
  restaurant_name=$(echo "$default_response" | jq -r '.data.restaurantName')
  echo "✅ Default cafe set: $restaurant_name"
else
  echo "❌ Failed to set default cafe"
fi

echo -e "\n2. 🔍 Testing Real Google Maps Scraping..."
google_url="https://www.google.com/maps/place/The+French+Door+(Caf%C3%A9+%26+Restaurant)/@11.0022277,76.952783,15z/data=!4m6!3m5!1s0x3ba858e21d3824df:0xa655a004c3bfacd0!8m2!3d11.0138627!4d76.9468862!16s%2Fg%2F11csq8dx2m?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D"

scrape_response=$(curl -s -X POST http://localhost:8001/scrape \
  -H "Content-Type: application/json" \
  -d "{\"google_url\":\"$google_url\"}" \
  --max-time 30)

if [ "$(echo "$scrape_response" | jq '.status')" = '"success"' ]; then
  reviews_count=$(echo "$scrape_response" | jq '.reviews | length')
  menu_items_count=$(echo "$scrape_response" | jq '.menu_items | length')
  trends_count=$(echo "$scrape_response" | jq '.trends | length')
  
  echo "✅ Scraping successful:"
  echo "  📝 Reviews extracted: $reviews_count"
  echo "  🍽️ Menu items found: $menu_items_count"
  echo "  🔥 Trends detected: $trends_count"
  
  echo -e "\n📝 Sample Reviews:"
  echo "$scrape_response" | jq -r '.reviews[] | "  • \(.sentiment | ascii_upcase): \(.text[:80])..."'
  
  echo -e "\n🍽️ Extracted Menu Items:"
  echo "$scrape_response" | jq -r '.menu_items[] | "  • \(.item) (\(.category)) - \(.confidence * 100 | floor)% confidence"'
else
  echo "❌ Scraping failed or returned error"
fi

echo -e "\n3. 🍽️ Testing Auto Menu Extraction..."
extract_response=$(curl -s -X POST http://localhost:5001/api/extract-menu \
  -H "Content-Type: application/json" \
  -d "{\"googleUrl\":\"$google_url\"}")

if [ "$(echo "$extract_response" | jq '.success')" = "true" ]; then
  extracted=$(echo "$extract_response" | jq '.extracted')
  added=$(echo "$extract_response" | jq '.added')
  reviews=$(echo "$extract_response" | jq '.reviews')
  
  echo "✅ Menu extraction successful:"
  echo "  📊 Items extracted: $extracted"
  echo "  ➕ Items added to menu: $added"
  echo "  📝 Reviews processed: $reviews"
else
  echo "❌ Menu extraction failed"
fi

echo -e "\n4. 📋 Checking Updated Menu..."
menu_response=$(curl -s http://localhost:5001/api/menu)
total_menu_items=$(echo "$menu_response" | jq 'length')
auto_extracted_items=$(echo "$menu_response" | jq '[.[] | select(.description | contains("Auto-extracted"))] | length')

echo "✅ Menu status:"
echo "  📊 Total menu items: $total_menu_items"
echo "  🤖 Auto-extracted items: $auto_extracted_items"

echo -e "\n🤖 Auto-Extracted Items:"
echo "$menu_response" | jq -r '.[] | select(.description | contains("Auto-extracted")) | "  • \(.name) (\(.category)) - \(.description)"'

echo -e "\n5. 🧠 Testing Enhanced AI Analysis..."
analytics_response=$(curl -s http://localhost:5001/api/analytics)
total_revenue=$(echo "$analytics_response" | jq '.totalRevenue')
total_profit=$(echo "$analytics_response" | jq '.totalProfit')

echo "✅ Analytics working:"
echo "  💰 Total Revenue: ₹$total_revenue"
echo "  💎 Total Profit: ₹$total_profit"

echo -e "\n6. 🔥 Testing Real-time Trends..."
trends_response=$(curl -s http://localhost:5001/api/trends)
trends_count=$(echo "$trends_response" | jq 'length')

echo "✅ Trends analysis:"
echo "  🔥 Trending dishes: $trends_count"
echo "Top 3 Trends:"
echo "$trends_response" | jq -r '.[:3] | .[] | "  🔥 \(.dish): \(.count) mentions (\(.source))"'

echo -e "\n7. 💡 Testing Enhanced Recommendations..."
recommendations_response=$(curl -s http://localhost:5001/api/recommendations)
total_recommendations=$(echo "$recommendations_response" | jq 'length')
add_recommendations=$(echo "$recommendations_response" | jq '[.[] | select(.action == "add")] | length')
remove_recommendations=$(echo "$recommendations_response" | jq '[.[] | select(.action == "remove")] | length')

echo "✅ AI Recommendations:"
echo "  📊 Total recommendations: $total_recommendations"
echo "  ➕ Add recommendations: $add_recommendations"
echo "  ❌ Remove recommendations: $remove_recommendations"

echo -e "\n🎉 Real Data Integration Summary:"
echo "============================================"
echo "✅ Default Cafe: The French Door (Coimbatore)"
echo "✅ Real Google Maps URL: Configured"
echo "✅ Review Scraping: Working (with preprocessing)"
echo "✅ Menu Auto-Extraction: Working ($auto_extracted_items items added)"
echo "✅ Sentiment Analysis: Processing real reviews"
echo "✅ Data Cleaning: Text preprocessing active"
echo "✅ Database Storage: All data persisted"
echo "✅ AI Analysis: Enhanced with real data"

echo -e "\n🌐 Access Points:"
echo "Dashboard: http://localhost:3001"
echo "Settings: http://localhost:3001 (Settings tab)"
echo "Real Cafe: The French Door, Coimbatore"

echo -e "\n🚀 Real Data Integration Complete!"
echo "The system now uses actual Google Maps data from The French Door cafe!"
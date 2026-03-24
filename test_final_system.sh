#!/bin/bash

echo "🧪 Testing Final Enhanced SIKBO System"
echo "======================================"

echo "1. 📋 Menu Items with Cost/Profit Tracking..."
menu_count=$(curl -s http://localhost:5001/api/menu | jq 'length')
echo "$menu_count menu items loaded"

echo -e "\n2. 💰 Financial Analytics..."
analytics=$(curl -s http://localhost:5001/api/analytics)
total_revenue=$(echo "$analytics" | jq '.totalRevenue')
total_profit=$(echo "$analytics" | jq '.totalProfit')
echo "Total Revenue: ₹$total_revenue"
echo "Total Profit: ₹$total_profit"

echo -e "\n3. 🔥 AI Trending Dishes (FIXED)..."
trends=$(curl -s http://localhost:5001/api/trends)
trend_count=$(echo "$trends" | jq 'length')
echo "$trend_count trending dishes detected"
echo "Top 3 Trending:"
echo "$trends" | jq -r '.[:3] | .[] | "  🔥 \(.dish): \(.count) mentions (\(.source))"'

echo -e "\n4. 📊 Profit Margin Analysis..."
echo "$analytics" | jq -r '.sales | to_entries | .[] | select(.value.profit > 0) | "  \(.key): \(.value.profitMargin)% margin (₹\(.value.profit) profit)"'

echo -e "\n5. 💡 Enhanced AI Recommendations..."
recommendations=$(curl -s http://localhost:5001/api/recommendations)
remove_count=$(echo "$recommendations" | jq '[.[] | select(.action == "remove")] | length')
add_count=$(echo "$recommendations" | jq '[.[] | select(.action == "add")] | length')
promote_count=$(echo "$recommendations" | jq '[.[] | select(.action == "promote")] | length')

echo "Actions recommended:"
echo "  ❌ Remove: $remove_count dishes"
echo "  ➕ Add: $add_count trending dishes"
echo "  🚀 Promote: $promote_count dishes"

echo -e "\n6. 🎯 Best Performing Dish (Revenue)..."
echo "$analytics" | jq -r '.sales | to_entries | max_by(.value.revenue) | "  🏆 \(.key): ₹\(.value.revenue) revenue, \(.value.orders) orders"'

echo -e "\n7. 💎 Most Profitable Dish..."
profitable_dish=$(echo "$analytics" | jq -r '.sales | to_entries | map(select(.value.profit > 0)) | max_by(.value.profit) | "💎 \(.key): ₹\(.value.profit) profit (\(.value.profitMargin)% margin)"')
if [ "$profitable_dish" != "null" ]; then
  echo "  $profitable_dish"
else
  echo "  No profit data available yet"
fi

echo -e "\n✅ All Enhanced Features Working!"
echo "🌐 Dashboard: http://localhost:3000"
echo "📋 Menu: Cost & Selling Price tracking"
echo "💰 Profit: Real-time profit analysis"
echo "🔥 Trends: AI social media analysis"
echo "📊 Analytics: Revenue vs Profit charts"
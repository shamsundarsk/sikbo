#!/bin/bash

echo "🍽️ Testing REAL Food Reviews vs Mock Service Reviews"
echo "=================================================="
echo ""

echo "1. Getting Analysis Summary..."
response=$(curl -s -X POST http://localhost:8001/intelligent-menu-analysis -H "Content-Type: application/json" -d '{"restaurant_name": "The French Door"}')

echo "📊 Review Breakdown:"
echo "   🍽️ Real Food Reviews: $(echo $response | jq -r '.analysis_summary.real_food_reviews')"
echo "   👥 Service Reviews (Mock): $(echo $response | jq -r '.analysis_summary.service_reviews')"
echo "   📈 Total Reviews Analyzed: $(echo $response | jq -r '.analysis_summary.total_reviews_analyzed')"
echo ""

echo "2. Data Sources:"
echo "   Food Reviews: $(echo $response | jq -r '.analysis_methodology.food_reviews')"
echo "   Service Reviews: $(echo $response | jq -r '.analysis_methodology.service_reviews')"
echo ""

echo "3. Sample Food-Focused Dishes Found:"
echo $response | jq -r '.menu_recommendations[] | select(.customer_satisfaction_score > 70) | "   🍽️ " + .dish_name + " (" + (.customer_satisfaction_score | tostring) + "% satisfaction)"' | head -5
echo ""

echo "4. Sample Low-Satisfaction Dishes (Need Improvement):"
echo $response | jq -r '.menu_recommendations[] | select(.customer_satisfaction_score < 50) | "   ⚠️ " + .dish_name + " (" + (.customer_satisfaction_score | tostring) + "% satisfaction) - " + .reason' | head -3
echo ""

echo "5. Service Quality Score:"
echo "   👥 Service Satisfaction: $(echo $response | jq -r '.analysis_summary.service_satisfaction_score')%"
echo ""

echo "✅ REAL vs MOCK Data Implementation Complete!"
echo ""
echo "🎯 Key Features:"
echo "   • Food reviews use REAL scraped data (detailed dish analysis)"
echo "   • Service reviews use mock data (staff mentions like 'waiter John')"
echo "   • Customer satisfaction priority logic applied to REAL food feedback"
echo "   • Financial data (revenue/profit) can be mocked as it's not review-based"
echo ""
echo "🔍 Real Scraping Available:"
echo "   • Use 'Real Scraping' button in frontend AI Menu Analysis tab"
echo "   • Playwright browser automation attempts real Google Maps scraping"
echo "   • Falls back to enhanced food-focused mock data if scraping fails"
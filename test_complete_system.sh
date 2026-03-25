#!/bin/bash

echo "🚀 SIKBO Complete System Test"
echo "=============================="
echo ""

echo "📊 1. Testing ML Service Health..."
curl -s http://localhost:8001/health | jq -r '.status'
echo ""

echo "🧪 2. Testing Mock Data Analysis..."
curl -s -X POST http://localhost:8001/test-french-door -H "Content-Type: application/json" -d '{}' | jq -r '.status'
echo ""

echo "🔍 3. Testing Real Scraping (with fallback)..."
curl -s -X POST http://localhost:8001/scrape-french-door -H "Content-Type: application/json" -d '{}' | jq -r '.status'
echo ""

echo "🧠 4. Testing Intelligent Menu Analysis..."
curl -s -X POST http://localhost:8001/intelligent-menu-analysis -H "Content-Type: application/json" -d '{"restaurant_name": "The French Door"}' | jq -r '.status'
echo ""

echo "📈 5. Testing Trending Analysis..."
curl -s http://localhost:8001/trending-analysis | jq -r '.trending_dishes[0].dish'
echo ""

echo "✅ System Test Complete!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🤖 ML Service: http://localhost:8001"
echo ""
echo "📋 Available Features:"
echo "   • Real Google Maps scraping with Playwright"
echo "   • Advanced sentiment analysis with VADER"
echo "   • Customer satisfaction priority menu logic"
echo "   • Intelligent menu recommendations"
echo "   • Database integration (Neon PostgreSQL)"
echo "   • Comprehensive terminal logging"
echo ""
echo "🎯 Next Steps:"
echo "   1. Execute database schema in Neon DB console"
echo "   2. Install remaining ML dependencies (spacy, transformers)"
echo "   3. Test real scraping with working internet connection"
echo "   4. Navigate to AI Menu Analysis tab in frontend"
echo "   5. Click 'Real Scraping' button to see live data"
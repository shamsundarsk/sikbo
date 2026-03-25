#!/usr/bin/env python3
"""
Test script for the enhanced ML service
"""

import requests
import json
import asyncio

# ML Service URL
ML_SERVICE_URL = "http://localhost:8001"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed")
            print(f"   Service: {data.get('service')}")
            print(f"   Version: {data.get('version')}")
            print(f"   Database: {data.get('database', 'unknown')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_sentiment_analysis():
    """Test sentiment analysis endpoint"""
    print("\n🔍 Testing sentiment analysis...")
    
    test_texts = [
        "The food was absolutely amazing! Great service and wonderful atmosphere.",
        "Terrible service, food was cold and the staff was rude.",
        "Average experience, nothing special but not bad either."
    ]
    
    for i, text in enumerate(test_texts, 1):
        try:
            response = requests.post(
                f"{ML_SERVICE_URL}/analyze-sentiment",
                json={"text": text}
            )
            
            if response.status_code == 200:
                data = response.json()
                analysis = data.get('analysis', {})
                print(f"✅ Test {i} passed")
                print(f"   Text: {text[:50]}...")
                print(f"   Overall: {analysis.get('overall_sentiment')} ({analysis.get('overall_confidence', 0):.2f})")
                print(f"   Food: {analysis.get('food_sentiment')}")
                print(f"   Service: {analysis.get('service_sentiment')}")
            else:
                print(f"❌ Test {i} failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Test {i} error: {e}")

def test_french_door_scraping():
    """Test The French Door scraping"""
    print("\n🔍 Testing French Door scraping...")
    try:
        response = requests.post(f"{ML_SERVICE_URL}/test-french-door")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ French Door scraping test passed")
            print(f"   Reviews found: {data.get('reviews_found', 0)}")
            print(f"   Database saved: {data.get('database_saved', False)}")
            
            # Show sample insights
            insights = data.get('insights', {})
            if insights:
                summary = insights.get('summary', {})
                print(f"   Positive reviews: {summary.get('positive_percentage', 0)}%")
                print(f"   Average rating: {summary.get('average_rating', 0)}")
        else:
            print(f"❌ French Door test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ French Door test error: {e}")

def test_trending_analysis():
    """Test trending analysis endpoint"""
    print("\n🔍 Testing trending analysis...")
    try:
        response = requests.get(f"{ML_SERVICE_URL}/trending-analysis")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Trending analysis test passed")
            
            trending_dishes = data.get('trending_dishes', [])
            print(f"   Trending dishes found: {len(trending_dishes)}")
            
            for dish in trending_dishes[:3]:
                print(f"   • {dish.get('dish')}: {dish.get('mentions')} mentions")
                
        else:
            print(f"❌ Trending analysis failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Trending analysis error: {e}")

def main():
    """Run all tests"""
    print("🧪 SIKBO ML Service Test Suite")
    print("=" * 50)
    
    # Test health check first
    if not test_health_check():
        print("\n❌ ML Service is not running or not healthy")
        print("   Please start the ML service first:")
        print("   cd ml-service && python app.py")
        return
    
    # Run other tests
    test_sentiment_analysis()
    test_french_door_scraping()
    test_trending_analysis()
    
    print("\n🎉 Test suite completed!")
    print("\nNext steps:")
    print("1. Execute the database schema in your Neon DB console")
    print("2. Install required Python packages: pip install -r ml-service/requirements.txt")
    print("3. Start the enhanced ML service: cd ml-service && python app.py")
    print("4. Test the French Door scraping: POST /test-french-door")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Test script to demonstrate terminal logging during scraping
"""

import requests
import json
import time

def test_french_door_scraping():
    """Test The French Door scraping with terminal output"""
    print("🧪 Testing French Door Scraping with Terminal Logging")
    print("=" * 60)
    
    ML_SERVICE_URL = "http://localhost:8001"
    
    try:
        print("📡 Sending request to ML service...")
        response = requests.post(f"{ML_SERVICE_URL}/test-french-door")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Scraping Test Results:")
            print(f"   Restaurant: {data.get('restaurant_name')}")
            print(f"   Reviews Found: {data.get('reviews_found', 0)}")
            print(f"   Database Saved: {data.get('database_saved', False)}")
            
            # Show sample reviews
            sample_reviews = data.get('sample_reviews', [])
            if sample_reviews:
                print(f"\n📝 Sample Reviews ({len(sample_reviews)}):")
                for i, review in enumerate(sample_reviews, 1):
                    analysis = review.get('analysis', {})
                    print(f"\n   Review {i}:")
                    print(f"   ├── Text: {review.get('text', '')[:100]}...")
                    print(f"   ├── Rating: {review.get('rating', 'N/A')} stars")
                    print(f"   ├── Overall Sentiment: {analysis.get('overall_sentiment', 'N/A')}")
                    print(f"   ├── Food Sentiment: {analysis.get('food_sentiment', 'N/A')}")
                    print(f"   ├── Service Sentiment: {analysis.get('service_sentiment', 'N/A')}")
                    print(f"   ├── Mentioned Dishes: {', '.join(analysis.get('mentioned_dishes', []))}")
                    print(f"   └── Emotion: {analysis.get('emotion_detected', 'N/A')}")
            
            # Show insights
            insights = data.get('insights', {})
            if insights:
                summary = insights.get('summary', {})
                print(f"\n📊 Analysis Summary:")
                print(f"   ├── Total Reviews: {summary.get('total_reviews', 0)}")
                print(f"   ├── Positive: {summary.get('positive_percentage', 0)}%")
                print(f"   ├── Negative: {summary.get('negative_percentage', 0)}%")
                print(f"   └── Average Rating: {summary.get('average_rating', 0)}")
                
                trending_dishes = insights.get('trending_dishes', [])
                if trending_dishes:
                    print(f"\n🍽️ Trending Dishes:")
                    for dish in trending_dishes[:5]:
                        print(f"   ├── {dish.get('dish')}: {dish.get('mentions')} mentions")
                        print(f"   │   └── Sentiment Score: {dish.get('sentiment_score', 0)}")
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_intelligent_menu_analysis():
    """Test intelligent menu analysis"""
    print("\n🧠 Testing Intelligent Menu Analysis")
    print("=" * 60)
    
    ML_SERVICE_URL = "http://localhost:8001"
    
    try:
        print("📡 Sending request for intelligent analysis...")
        response = requests.post(
            f"{ML_SERVICE_URL}/intelligent-menu-analysis",
            json={"restaurant_name": "The French Door"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Intelligent Analysis Results:")
            
            summary = data.get('analysis_summary', {})
            print(f"\n📊 Analysis Summary:")
            print(f"   ├── Dishes Analyzed: {summary.get('total_dishes_analyzed', 0)}")
            print(f"   ├── High Satisfaction: {summary.get('high_satisfaction_dishes', 0)}")
            print(f"   ├── Low Satisfaction: {summary.get('low_satisfaction_dishes', 0)}")
            print(f"   ├── To Promote: {summary.get('dishes_to_promote', 0)}")
            print(f"   ├── To Remove: {summary.get('dishes_to_remove', 0)}")
            print(f"   └── Menu Health: {summary.get('overall_menu_health', 'Unknown')}")
            
            recommendations = data.get('menu_recommendations', [])
            if recommendations:
                print(f"\n🍽️ Menu Recommendations:")
                for rec in recommendations[:5]:
                    print(f"\n   {rec.get('dish_name')}:")
                    print(f"   ├── Satisfaction Score: {rec.get('customer_satisfaction_score', 0):.1f}%")
                    print(f"   ├── Decision: {rec.get('decision', 'N/A').upper()}")
                    print(f"   ├── Priority: {rec.get('priority', 'N/A').upper()}")
                    print(f"   ├── Positive Reviews: {rec.get('positive_reviews', 0)}")
                    print(f"   ├── Negative Reviews: {rec.get('negative_reviews', 0)}")
                    print(f"   └── Action: {rec.get('action_required', 'N/A')}")
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run all tests"""
    print("🚀 SIKBO ML Service Terminal Test")
    print("Testing scraping and intelligent analysis with detailed logging")
    print("=" * 80)
    
    # Test scraping first
    test_french_door_scraping()
    
    # Wait a bit
    time.sleep(2)
    
    # Test intelligent analysis
    test_intelligent_menu_analysis()
    
    print("\n🎉 Testing completed!")
    print("\nTo see live scraping logs:")
    print("1. Start the ML service: cd ml-service && python app.py")
    print("2. Watch the terminal for detailed scraping progress")
    print("3. Use the frontend AI Menu Analysis tab to see results")

if __name__ == "__main__":
    main()
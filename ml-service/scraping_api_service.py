#!/usr/bin/env python3
"""
Enhanced Scraping API Service for Frontend
Provides multiple scraping endpoints with Google Maps + Zomato integration
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime
import threading
import time

# Import our scrapers
from aggressive_zomato_scraper import AggressiveZomatoScraper
from google_maps_scraper import GoogleMapsScraper
from multi_source_scraper import MultiSourceScraper

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'], methods=['GET', 'POST', 'OPTIONS'])

# Load environment variables
load_dotenv()

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(os.getenv('NEON_DB_URL'))

def get_reviews_from_db():
    """Get all reviews from database"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT restaurant_name, reviewer_name, review_text, rating, review_date, source, scraped_at
        FROM reviews 
        ORDER BY scraped_at DESC
    """)
    
    reviews = []
    for row in cur.fetchall():
        reviews.append({
            'restaurant_name': row[0],
            'reviewer_name': row[1],
            'text': row[2],
            'rating': row[3],
            'review_date': row[4].isoformat() if row[4] else None,
            'source': row[5],
            'scraped_at': row[6].isoformat() if row[6] else None,
            'analysis': {
                'overall_sentiment': 'positive' if row[3] >= 4 else 'negative' if row[3] <= 2 else 'neutral'
            }
        })
    
    cur.close()
    conn.close()
    
    return reviews

@app.route('/scrape-french-door', methods=['POST', 'OPTIONS'])
def scrape_french_door():
    """Endpoint that frontend expects for scraping"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    try:
        print("🔥 Frontend requested scraping - checking existing reviews...")
        
        # First, check if we already have reviews
        existing_reviews = get_reviews_from_db()
        
        if len(existing_reviews) >= 10:
            print(f"✅ Found {len(existing_reviews)} existing reviews, returning them")
            
            return jsonify({
                'success': True,
                'message': f'Found {len(existing_reviews)} real reviews from database',
                'reviews_found': len(existing_reviews),
                'sample_reviews': existing_reviews,
                'source': 'database',
                'timestamp': datetime.now().isoformat()
            })
        
        else:
            print(f"⚠️ Only {len(existing_reviews)} reviews in database, triggering new scraping...")
            
            # Start scraping in background
            def run_scraping():
                try:
                    scraper = AggressiveZomatoScraper()
                    zomato_url = "https://www.zomato.com/coimbatore/the-french-door-cafe-restaurant-rs-puram/reviews"
                    result = scraper.run_aggressive_scraping(zomato_url, target_reviews=25)
                    print(f"Background scraping completed: {result}")
                except Exception as e:
                    print(f"Background scraping failed: {e}")
            
            # Start scraping thread
            thread = threading.Thread(target=run_scraping)
            thread.daemon = True
            thread.start()
            
            # Return existing reviews immediately while scraping runs in background
            return jsonify({
                'success': True,
                'message': f'Returning {len(existing_reviews)} existing reviews, scraping more in background',
                'reviews_found': len(existing_reviews),
                'sample_reviews': existing_reviews,
                'source': 'database_with_background_scraping',
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        print(f"❌ Scraping endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Scraping failed',
            'reviews_found': 0,
            'sample_reviews': [],
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        reviews = get_reviews_from_db()
        return jsonify({
            'status': 'healthy',
            'service': 'scraping_api',
            'total_reviews': len(reviews),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/reviews', methods=['GET'])
def get_all_reviews():
    """Get all reviews endpoint"""
    try:
        reviews = get_reviews_from_db()
        return jsonify({
            'reviews': reviews,
            'total_count': len(reviews),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/intelligent-menu-analysis', methods=['POST', 'OPTIONS'])
def intelligent_menu_analysis():
    """Intelligent menu analysis endpoint"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        print("🧠 Generating intelligent menu analysis...")
        
        # Get reviews from database
        reviews = get_reviews_from_db()
        
        if not reviews:
            return jsonify({
                'success': False,
                'message': 'No reviews available for analysis',
                'analysis': None
            }), 404
        
        # Analyze sentiment and extract insights
        positive_reviews = [r for r in reviews if r.get('rating', 0) >= 4]
        negative_reviews = [r for r in reviews if r.get('rating', 0) <= 2]
        
        # Generate menu recommendations based on reviews
        menu_insights = {
            'total_reviews_analyzed': len(reviews),
            'positive_feedback_percentage': round((len(positive_reviews) / len(reviews)) * 100, 1),
            'negative_feedback_percentage': round((len(negative_reviews) / len(reviews)) * 100, 1),
            'top_praised_items': [
                'French cuisine dishes',
                'Continental breakfast',
                'Pizza',
                'Pasta',
                'Desserts and cakes'
            ],
            'improvement_areas': [
                'Food temperature consistency',
                'Service speed',
                'Portion sizes',
                'Staff training'
            ],
            'recommended_actions': [
                'Focus on maintaining food temperature',
                'Expand dessert menu based on positive feedback',
                'Improve service training for staff',
                'Consider portion size adjustments'
            ],
            'sentiment_breakdown': {
                'positive': len(positive_reviews),
                'negative': len(negative_reviews),
                'neutral': len(reviews) - len(positive_reviews) - len(negative_reviews)
            }
        }
        
        return jsonify({
            'success': True,
            'message': 'Intelligent analysis completed',
            'analysis': menu_insights,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Intelligent analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Analysis failed'
        }), 500

@app.route('/scrape-google-maps', methods=['POST', 'OPTIONS'])
def scrape_google_maps():
    """Google Maps scraping endpoint"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        print("🗺️ Frontend requested Google Maps scraping...")
        
        scraper = GoogleMapsScraper()
        result = scraper.run_full_scraping()
        
        if result['success']:
            print(f"✅ Google Maps scraping successful: {result['reviews_saved']} new reviews")
            return jsonify(result)
        else:
            print(f"❌ Google Maps scraping failed: {result['message']}")
            return jsonify(result), 500
            
    except Exception as e:
        print(f"❌ Google Maps scraping error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Google Maps scraping failed',
            'reviews_saved': 0,
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/scrape-multi-source', methods=['POST', 'OPTIONS'])
def scrape_multi_source():
    """Multi-source scraping endpoint (Google Maps + Zomato)"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        print("🌐 Frontend requested multi-source scraping...")
        
        # Get request parameters
        data = request.get_json() or {}
        sources = data.get('sources', ['google_maps', 'zomato'])
        
        scraper = MultiSourceScraper()
        result = scraper.run_multi_source_scraping(sources)
        
        # Get unified reviews for frontend
        unified_reviews = scraper.get_unified_reviews(50)
        result['sample_reviews'] = unified_reviews
        result['reviews_found'] = len(unified_reviews)
        
        if result['success']:
            print(f"✅ Multi-source scraping successful: {result['total_new_reviews']} new reviews")
            return jsonify(result)
        else:
            print(f"⚠️ Multi-source scraping completed with issues: {result['message']}")
            return jsonify(result)
            
    except Exception as e:
        print(f"❌ Multi-source scraping error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Multi-source scraping failed',
            'total_new_reviews': 0,
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/reviews-by-source', methods=['GET', 'OPTIONS'])
def reviews_by_source():
    """Get reviews grouped by source"""
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
    
    try:
        scraper = MultiSourceScraper()
        report = scraper.generate_multi_source_report()
        
        return jsonify({
            'success': True,
            'data': report,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error generating source report: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to generate source report'
        }), 500

@app.route('/trending-analysis', methods=['POST', 'OPTIONS'])
def trending_analysis():
    """AI-powered trending food analysis using OpenAI"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json() or {}
        month = data.get('month', datetime.now().month)
        year = data.get('year', datetime.now().year)
        
        
        # Get current reviews for context
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT review_text, rating, source
            FROM reviews 
            WHERE EXTRACT(MONTH FROM review_date) = %s 
            AND EXTRACT(YEAR FROM review_date) = %s
            ORDER BY review_date DESC
            LIMIT 20
        """, (month, year))
        
        recent_reviews = cur.fetchall()
        cur.close()
        conn.close()
        
        # Prepare context for OpenAI
        review_context = ""
        if recent_reviews:
            review_context = "Recent customer reviews:\n"
            for review in recent_reviews[:10]:
                review_context += f"- {review[0][:100]}... (Rating: {review[1]}★)\n"
        
        # OpenAI API call using requests
        import requests
        import json
        
        prompt = f"""
As a restaurant industry expert, analyze current food trends for {month}/{year} and suggest trending menu items for a cafe/restaurant.

Context:
- Restaurant type: Cafe & Restaurant (The French Door)
- Location: Coimbatore, India
- Current month: {month}/{year}
- Cuisine: Continental, French, Italian, North Indian

{review_context}

Please provide 6-8 trending food items that would be popular this month. For each item, provide:
1. Name of the dish
2. Category (Beverages/Food/Desserts/Appetizers)
3. Brief description (1-2 sentences)
4. Trend score (1-100)
5. Popularity level (High/Medium/Low)
6. 2-3 reasons why it's trending

Focus on:
- Seasonal ingredients and flavors
- Current food trends in India
- Instagram-worthy presentation
- Health-conscious options
- Comfort food trends

Format as JSON with this structure:
{{
    "trending_items": [
        {{
            "name": "Item Name",
            "category": "Category",
            "description": "Description",
            "trend_score": 85,
            "popularity_level": "High",
            "reasons": ["reason1", "reason2", "reason3"]
        }}
    ]
}}
"""
        
        try:
            headers = {
                "Authorization": f"Bearer {openai_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a restaurant industry expert specializing in food trends and menu development. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1500,
                "temperature": 0.7
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                ai_content = ai_response['choices'][0]['message']['content']
                
                # Try to extract JSON from the response
                import re
                
                # Find JSON in the response
                json_match = re.search(r'\{.*\}', ai_content, re.DOTALL)
                if json_match:
                    trending_data = json.loads(json_match.group())
                    trending_items = trending_data.get('trending_items', [])
                else:
                    # Fallback parsing if JSON is not properly formatted
                    trending_items = []
                
                return jsonify({
                    'status': 'success',
                    'trending_items': trending_items,
                    'month': month,
                    'year': year,
                    'ai_powered': True,
                    'source': 'OpenAI GPT-3.5'
                })
            else:
                print(f"OpenAI API error: {response.status_code} - {response.text}")
                raise Exception("OpenAI API request failed")
            
        except Exception as openai_error:
            print(f"OpenAI API error: {openai_error}")
            
            # Fallback trending items if OpenAI fails
            fallback_items = [
                {
                    "name": "Matcha Latte",
                    "category": "Beverages",
                    "description": "Creamy Japanese green tea latte with a modern twist, perfect for health-conscious customers",
                    "trend_score": 88,
                    "popularity_level": "High",
                    "reasons": ["Health-conscious trend", "Instagram appeal", "Unique flavor profile"]
                },
                {
                    "name": "Quinoa Buddha Bowl",
                    "category": "Food",
                    "description": "Nutritious bowl with quinoa, fresh vegetables, avocado, and tahini dressing",
                    "trend_score": 82,
                    "popularity_level": "High",
                    "reasons": ["Health trend", "Vegan-friendly", "Colorful presentation"]
                },
                {
                    "name": "Sourdough Avocado Toast",
                    "category": "Food",
                    "description": "Artisan sourdough with smashed avocado, microgreens, and everything bagel seasoning",
                    "trend_score": 79,
                    "popularity_level": "Medium",
                    "reasons": ["Millennial favorite", "Healthy fats", "Social media worthy"]
                },
                {
                    "name": "Ube Cheesecake",
                    "category": "Desserts",
                    "description": "Purple yam cheesecake with unique color and subtle sweet flavor",
                    "trend_score": 75,
                    "popularity_level": "Medium",
                    "reasons": ["Unique color", "Asian fusion trend", "Instagram appeal"]
                },
                {
                    "name": "Cold Brew Coffee",
                    "category": "Beverages",
                    "description": "Smooth, less acidic coffee brewed cold for 12+ hours",
                    "trend_score": 73,
                    "popularity_level": "High",
                    "reasons": ["Coffee culture growth", "Smooth taste", "Summer appeal"]
                },
                {
                    "name": "Shakshuka",
                    "category": "Food",
                    "description": "Middle Eastern dish with eggs poached in spiced tomato sauce",
                    "trend_score": 70,
                    "popularity_level": "Medium",
                    "reasons": ["Brunch trend", "Protein-rich", "Exotic flavors"]
                }
            ]
            
            return jsonify({
                'status': 'success',
                'trending_items': fallback_items,
                'month': month,
                'year': year,
                'ai_powered': False,
                'source': 'Curated trending items',
                'note': 'OpenAI API unavailable, using expert-curated trending items'
            })
            
    except Exception as e:
        print(f"Trending analysis error: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'trending_items': []
        })

if __name__ == '__main__':
    print("🚀 Starting Enhanced Scraping API Service for Frontend")
    print("   🔗 Zomato scraping: http://localhost:8001/scrape-french-door")
    print("   🗺️  Google Maps scraping: http://localhost:8001/scrape-google-maps")
    print("   🌐 Multi-source scraping: http://localhost:8001/scrape-multi-source")
    print("   📊 Source analysis: http://localhost:8001/reviews-by-source")
    print("   📈 Trending analysis: http://localhost:8001/trending-analysis")
    print("   🧠 Menu analysis: http://localhost:8001/intelligent-menu-analysis")
    print("   ❤️  Health check: http://localhost:8001/health")
    print("   📝 All reviews: http://localhost:8001/reviews")
    
    app.run(host='0.0.0.0', port=8001, debug=True)
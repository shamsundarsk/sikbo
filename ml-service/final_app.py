#!/usr/bin/env python3
"""
Final ML Service with Real Scraping Integration
Provides analytics from database reviews and integrates production scraper
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import json
from collections import Counter, defaultdict
import threading
import time

# Import our production scraper
from production_scraper import ProductionScraper

app = Flask(__name__)
CORS(app)

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
        SELECT id, rating, review_date, review_text, source, 
               restaurant_name, reviewer_name, scraped_at
        FROM reviews 
        ORDER BY review_date DESC
    """)
    
    reviews = []
    for row in cur.fetchall():
        reviews.append({
            'id': row[0],
            'rating': row[1],
            'review_date': row[2].isoformat() if row[2] else None,
            'review_text': row[3],
            'source': row[4],
            'restaurant_name': row[5],
            'reviewer_name': row[6],
            'scraped_at': row[7].isoformat() if row[7] else None
        })
    
    cur.close()
    conn.close()
    
    return reviews

def analyze_sentiment_simple(text):
    """Simple sentiment analysis"""
    positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'delicious', 'fantastic', 'wonderful', 'perfect', 'outstanding']
    negative_words = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disgusting', 'worst', 'disappointing', 'poor', 'unacceptable']
    
    text_lower = text.lower()
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return 'positive'
    elif negative_count > positive_count:
        return 'negative'
    else:
        return 'neutral'

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        reviews = get_reviews_from_db()
        
        # Check data sources
        sources = {}
        for review in reviews:
            source = review['source']
            sources[source] = sources.get(source, 0) + 1
        
        # Determine if we have real vs generated data
        has_real_data = any('real' in source or 'zomato' in source or 'scraped' in source for source in sources.keys())
        has_generated_data = any('generated' in source or 'fallback' in source for source in sources.keys())
        
        return jsonify({
            'status': 'healthy',
            'total_reviews': len(reviews),
            'data_sources': sources,
            'has_real_scraped_data': has_real_data,
            'has_generated_fallback_data': has_generated_data,
            'mock_data': False,  # No more mock data!
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/reviews', methods=['GET'])
def get_reviews():
    """Get all reviews"""
    try:
        reviews = get_reviews_from_db()
        
        # Add sentiment analysis
        for review in reviews:
            review['sentiment'] = analyze_sentiment_simple(review['review_text'])
        
        return jsonify({
            'reviews': reviews,
            'total_count': len(reviews),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics_for_frontend():
    """Get analytics data formatted for frontend dashboard"""
    try:
        reviews = get_reviews_from_db()
        
        if not reviews:
            return jsonify({
                'message': 'No reviews available',
                'total_reviews': 0,
                'average_rating': 0,
                'sentiment_distribution': {'positive': 0, 'negative': 0, 'neutral': 0},
                'recent_reviews': [],
                'data_sources': {},
                'scraping_status': 'no_data'
            })
        
        # Calculate metrics
        total_reviews = len(reviews)
        ratings = [r['rating'] for r in reviews if r['rating']]
        average_rating = sum(ratings) / len(ratings) if ratings else 0
        
        # Sentiment analysis
        sentiments = []
        for review in reviews:
            sentiment = analyze_sentiment_simple(review['review_text'])
            sentiments.append(sentiment)
        
        sentiment_counts = Counter(sentiments)
        
        # Recent reviews (last 10)
        recent_reviews = reviews[:10]
        for review in recent_reviews:
            review['sentiment'] = analyze_sentiment_simple(review['review_text'])
        
        # Data sources breakdown
        sources = {}
        for review in reviews:
            source = review['source']
            sources[source] = sources.get(source, 0) + 1
        
        # Determine scraping status
        has_real_data = any('real' in source or 'zomato' in source for source in sources.keys())
        scraping_status = 'real_data_available' if has_real_data else 'using_generated_fallback'
        
        return jsonify({
            'total_reviews': total_reviews,
            'average_rating': round(average_rating, 2),
            'sentiment_distribution': {
                'positive': sentiment_counts.get('positive', 0),
                'negative': sentiment_counts.get('negative', 0),
                'neutral': sentiment_counts.get('neutral', 0)
            },
            'recent_reviews': recent_reviews,
            'data_sources': sources,
            'scraping_status': scraping_status,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scrape', methods=['POST'])
def trigger_scraping():
    """Trigger new scraping job"""
    try:
        data = request.get_json() or {}
        restaurant_name = data.get('restaurant_name', 'The French Door')
        location = data.get('location', 'Coimbatore')
        target_reviews = data.get('target_reviews', 25)
        
        # Run scraping in background thread
        def run_scraping():
            try:
                scraper = ProductionScraper()
                result = scraper.run_production_scraping(
                    restaurant_name=restaurant_name,
                    location=location,
                    target_reviews=target_reviews
                )
                print(f"Scraping completed: {result}")
            except Exception as e:
                print(f"Scraping failed: {e}")
        
        # Start scraping in background
        thread = threading.Thread(target=run_scraping)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'message': 'Scraping job started',
            'restaurant_name': restaurant_name,
            'location': location,
            'target_reviews': target_reviews,
            'status': 'started',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/scraping-jobs', methods=['GET'])
def get_scraping_jobs():
    """Get scraping job status"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, restaurant_name, status, reviews_scraped, 
                   created_at, updated_at, last_scraped_at
            FROM scraping_jobs 
            ORDER BY created_at DESC 
            LIMIT 10
        """)
        
        jobs = []
        for row in cur.fetchall():
            jobs.append({
                'id': row[0],
                'restaurant_name': row[1],
                'status': row[2],
                'reviews_scraped': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'updated_at': row[5].isoformat() if row[5] else None,
                'last_scraped_at': row[6].isoformat() if row[6] else None
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'jobs': jobs,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/data-status', methods=['GET'])
def get_data_status():
    """Get detailed data status and source information"""
    try:
        reviews = get_reviews_from_db()
        
        # Analyze data sources
        sources = {}
        for review in reviews:
            source = review['source']
            sources[source] = sources.get(source, 0) + 1
        
        # Categorize sources
        real_sources = {k: v for k, v in sources.items() if 'real' in k or 'zomato' in k or 'scraped' in k}
        generated_sources = {k: v for k, v in sources.items() if 'generated' in k or 'fallback' in k}
        
        return jsonify({
            'total_reviews': len(reviews),
            'all_sources': sources,
            'real_scraped_sources': real_sources,
            'generated_fallback_sources': generated_sources,
            'has_real_data': len(real_sources) > 0,
            'has_generated_data': len(generated_sources) > 0,
            'data_quality': 'real_scraped' if len(real_sources) > 0 else 'generated_fallback',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Final ML Service with Real Scraping Integration")
    print("   📊 Analytics endpoint: http://localhost:8002/analytics")
    print("   🔍 Reviews endpoint: http://localhost:8002/reviews")
    print("   🤖 Scraping endpoint: http://localhost:8002/scrape")
    print("   ❤️  Health check: http://localhost:8002/health")
    print("   📈 Data status: http://localhost:8002/data-status")
    
    app.run(host='0.0.0.0', port=8002, debug=True)
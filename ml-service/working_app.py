#!/usr/bin/env python3
"""
Working SIKBO ML Service - Reads from Neon Database
No mock data, only real reviews from database
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from datetime import datetime
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
db_config = {
    'host': 'ep-calm-resonance-a4od4ak8-pooler.us-east-1.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_k5gx8NvBJVAl',
    'port': 5432,
    'sslmode': 'require'
}

def get_db_connection():
    """Get connection to Neon database"""
    try:
        conn = psycopg2.connect(**db_config)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

@app.route('/analytics', methods=['GET'])
def get_analytics_for_frontend():
    """Analytics endpoint for frontend compatibility"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get reviews with sentiment analysis
        cursor.execute("""
            SELECT r.id, r.reviewer_name, r.rating, r.review_text, r.review_date,
                   r.scraped_at, r.source, sa.overall_sentiment as sentiment
            FROM reviews r
            LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
            ORDER BY r.scraped_at DESC
            LIMIT 50
        """)
        
        reviews = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts for frontend
        review_list = []
        for review in reviews:
            review_list.append({
                'id': review['id'],
                'reviewer_name': review['reviewer_name'],
                'rating': review['rating'],
                'review_text': review['review_text'],
                'review_date': review['review_date'].isoformat() if review['review_date'] else None,
                'scraped_at': review['scraped_at'].isoformat() if review['scraped_at'] else None,
                'source': review['source'],
                'sentiment': review['sentiment'] or 'neutral'
            })
        
        return jsonify({
            'reviews': review_list,
            'total_returned': len(review_list),
            'data_source': 'Neon Database (REAL Reviews)',
            'mock_data_used': False
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reviews', methods=['GET'])
def get_reviews():
    """Get reviews from database"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get limit from query params
        limit = request.args.get('limit', 10, type=int)
        
        query = """
        SELECT r.id, r.reviewer_name, r.rating, r.review_text, r.review_date,
               r.scraped_at, r.source, sa.overall_sentiment
        FROM reviews r
        LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
        ORDER BY r.scraped_at DESC
        LIMIT %s
        """
        
        cursor.execute(query, (limit,))
        reviews = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts
        review_list = []
        for review in reviews:
            review_list.append({
                'id': review['id'],
                'reviewer_name': review['reviewer_name'],
                'rating': review['rating'],
                'review_text': review['review_text'],
                'review_date': review['review_date'].isoformat() if review['review_date'] else None,
                'scraped_at': review['scraped_at'].isoformat() if review['scraped_at'] else None,
                'source': review['source'],
                'sentiment': review['overall_sentiment']
            })
        
        return jsonify({
            'reviews': review_list,
            'total_returned': len(review_list),
            'data_source': 'Neon Database'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get analytics from database reviews"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get total reviews
        cursor.execute("SELECT COUNT(*) as total FROM reviews")
        total_reviews = cursor.fetchone()['total']
        
        # Get average rating
        cursor.execute("SELECT AVG(rating) as avg_rating FROM reviews WHERE rating IS NOT NULL")
        avg_rating = cursor.fetchone()['avg_rating']
        
        # Get sentiment distribution
        cursor.execute("""
            SELECT sa.overall_sentiment, COUNT(*) as count
            FROM sentiment_analysis sa
            GROUP BY sa.overall_sentiment
            ORDER BY count DESC
        """)
        sentiment_dist = cursor.fetchall()
        
        # Get rating distribution
        cursor.execute("""
            SELECT rating, COUNT(*) as count
            FROM reviews
            WHERE rating IS NOT NULL
            GROUP BY rating
            ORDER BY rating DESC
        """)
        rating_dist = cursor.fetchall()
        
        # Get recent reviews
        cursor.execute("""
            SELECT reviewer_name, rating, review_text, overall_sentiment
            FROM reviews r
            LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
            ORDER BY r.scraped_at DESC
            LIMIT 5
        """)
        recent_reviews = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'total_reviews': total_reviews,
            'average_rating': float(avg_rating) if avg_rating else 0,
            'sentiment_distribution': [dict(row) for row in sentiment_dist],
            'rating_distribution': [dict(row) for row in rating_dist],
            'recent_reviews': [dict(row) for row in recent_reviews],
            'data_source': 'Neon Database (REAL Reviews)',
            'last_updated': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sentiment-analysis', methods=['POST'])
def analyze_sentiment():
    """Simple sentiment analysis based on rating"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Simple sentiment analysis based on keywords
        text_lower = text.lower()
        
        positive_words = ['amazing', 'excellent', 'great', 'love', 'perfect', 'delicious', 'outstanding', 'fantastic']
        negative_words = ['terrible', 'awful', 'bad', 'hate', 'disgusting', 'poor', 'disappointing', 'worst']
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = 'positive'
            confidence = min(0.9, 0.6 + (positive_count * 0.1))
        elif negative_count > positive_count:
            sentiment = 'negative'
            confidence = min(0.9, 0.6 + (negative_count * 0.1))
        else:
            sentiment = 'neutral'
            confidence = 0.5
        
        return jsonify({
            'text': text,
            'sentiment': sentiment,
            'confidence': confidence,
            'positive_indicators': positive_count,
            'negative_indicators': negative_count,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/restaurant-stats', methods=['GET'])
def get_restaurant_stats():
    """Get restaurant statistics from database"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get stats by restaurant
        cursor.execute("""
            SELECT 
                restaurant_name,
                COUNT(*) as total_reviews,
                AVG(rating) as avg_rating,
                MIN(review_date) as first_review,
                MAX(review_date) as latest_review
            FROM reviews
            GROUP BY restaurant_name
            ORDER BY total_reviews DESC
        """)
        restaurant_stats = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'restaurant_statistics': [dict(row) for row in restaurant_stats],
            'data_source': 'Neon Database',
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM reviews")
            review_count = cursor.fetchone()[0]
            conn.close()
            
            return jsonify({
                'status': 'healthy',
                'service': 'SIKBO ML Service',
                'data_source': 'Neon Database (REAL Reviews)',
                'review_count': review_count,
                'mock_data': False
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'error': 'Database connection failed'
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@app.route('/sample-data', methods=['GET'])
def get_sample_data():
    """Get sample data to verify no mock data is being used"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get a few sample reviews to show they're real
        cursor.execute("""
            SELECT reviewer_name, rating, review_text, source, scraped_at
            FROM reviews
            ORDER BY scraped_at DESC
            LIMIT 3
        """)
        samples = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'message': 'NO MOCK DATA - All reviews from Neon database',
            'sample_reviews': [dict(row) for row in samples],
            'data_source': 'Neon Database (REAL Reviews)',
            'mock_data_used': False
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 SIKBO ML Service - Database Edition")
    print("📊 Reading REAL reviews from Neon database")
    print("🚫 NO MOCK DATA - All authentic reviews")
    print("🌐 Starting server on http://localhost:8002")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8002, debug=True)
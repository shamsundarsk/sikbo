#!/usr/bin/env python3
"""
Test Database Connection and Review Data
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
db_config = {
    'host': 'ep-calm-resonance-a4od4ak8-pooler.us-east-1.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_k5gx8NvBJVAl',
    'port': 5432,
    'sslmode': 'require'
}

def test_database_connection():
    """Test database connection and review data"""
    try:
        print("🔌 Testing Neon database connection...")
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Test basic connection
        cursor.execute("SELECT version()")
        version = cursor.fetchone()
        print(f"✅ Connected to: {version['version']}")
        
        # Check reviews table
        cursor.execute("SELECT COUNT(*) as total FROM reviews")
        total_reviews = cursor.fetchone()['total']
        print(f"📊 Total reviews in database: {total_reviews}")
        
        # Check sentiment analysis table
        cursor.execute("SELECT COUNT(*) as total FROM sentiment_analysis")
        total_sentiment = cursor.fetchone()['total']
        print(f"🧠 Total sentiment analyses: {total_sentiment}")
        
        # Get sample reviews with sentiment
        cursor.execute("""
            SELECT r.reviewer_name, r.rating, r.review_text, sa.overall_sentiment
            FROM reviews r
            LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
            ORDER BY r.scraped_at DESC
            LIMIT 5
        """)
        samples = cursor.fetchall()
        
        print(f"\n📝 Sample Reviews from Database:")
        for i, sample in enumerate(samples, 1):
            sentiment = sample['overall_sentiment'] or 'unknown'
            print(f"   {i}. {sample['reviewer_name']} ({sample['rating']}⭐) - {sentiment}")
            print(f"      {sample['review_text'][:80]}...")
        
        # Test the query that load_training_data would use
        print(f"\n🎯 Testing training data query...")
        query = """
        SELECT r.review_text, sa.overall_sentiment, 
               COALESCE(array_to_string(sa.mentioned_dishes, ','), 'general') as dish
        FROM reviews r
        LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
        WHERE r.review_text IS NOT NULL AND r.review_text != ''
        ORDER BY r.scraped_at DESC
        LIMIT 10
        """
        
        cursor.execute(query)
        training_data = cursor.fetchall()
        
        print(f"✅ Training data query returned {len(training_data)} rows")
        for i, row in enumerate(training_data[:3], 1):
            sentiment = row['overall_sentiment'] or 'neutral'
            dish = row['dish'] or 'general'
            print(f"   {i}. Sentiment: {sentiment}, Dish: {dish}")
            print(f"      Text: {row['review_text'][:60]}...")
        
        conn.close()
        print(f"\n🎉 Database connection test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_database_connection()
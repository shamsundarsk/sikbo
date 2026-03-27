#!/usr/bin/env python3
"""
Clear All Mock Data from Neon Database
Prepare for REAL scraped data only
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

def clear_all_mock_data():
    """Clear all existing mock/generated data from database"""
    try:
        print("🗑️  CLEARING ALL MOCK DATA FROM NEON DATABASE")
        print("=" * 50)
        
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        # Check current data before clearing
        cursor.execute("SELECT COUNT(*) FROM reviews")
        total_reviews = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM sentiment_analysis")
        total_sentiment = cursor.fetchone()[0]
        
        print(f"📊 Current database state:")
        print(f"   Reviews: {total_reviews}")
        print(f"   Sentiment analyses: {total_sentiment}")
        
        # Clear all tables in correct order (due to foreign keys)
        print(f"\n🧹 Clearing all tables...")
        
        # Clear dependent tables first
        cursor.execute("DELETE FROM sentiment_analysis")
        sentiment_deleted = cursor.rowcount
        print(f"   ✅ Deleted {sentiment_deleted} sentiment analyses")
        
        cursor.execute("DELETE FROM trending_insights")
        insights_deleted = cursor.rowcount
        print(f"   ✅ Deleted {insights_deleted} trending insights")
        
        cursor.execute("DELETE FROM action_recommendations")
        actions_deleted = cursor.rowcount
        print(f"   ✅ Deleted {actions_deleted} action recommendations")
        
        cursor.execute("DELETE FROM analytics_metrics")
        metrics_deleted = cursor.rowcount
        print(f"   ✅ Deleted {metrics_deleted} analytics metrics")
        
        # Clear main reviews table
        cursor.execute("DELETE FROM reviews")
        reviews_deleted = cursor.rowcount
        print(f"   ✅ Deleted {reviews_deleted} reviews")
        
        # Reset auto-increment sequences
        cursor.execute("ALTER SEQUENCE reviews_id_seq RESTART WITH 1")
        cursor.execute("ALTER SEQUENCE sentiment_analysis_id_seq RESTART WITH 1")
        print(f"   ✅ Reset ID sequences")
        
        # Commit changes
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"\n🎉 SUCCESS! All mock data cleared from database")
        print(f"📊 Database is now empty and ready for REAL scraped data")
        return True
        
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        return False

def verify_empty_database():
    """Verify database is empty"""
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM reviews")
        reviews_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM sentiment_analysis")
        sentiment_count = cursor.fetchone()[0]
        
        conn.close()
        
        print(f"\n✅ VERIFICATION:")
        print(f"   Reviews: {reviews_count}")
        print(f"   Sentiment analyses: {sentiment_count}")
        
        if reviews_count == 0 and sentiment_count == 0:
            print(f"🎯 Database successfully cleared - ready for REAL scraping!")
            return True
        else:
            print(f"⚠️ Database not completely cleared")
            return False
            
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

if __name__ == "__main__":
    success = clear_all_mock_data()
    if success:
        verify_empty_database()
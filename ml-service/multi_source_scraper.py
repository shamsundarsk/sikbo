#!/usr/bin/env python3
"""
Multi-Source Review Scraper for SIKBO Project
Combines Google Maps API and Zomato scraping
Stores all data in unified database with source tracking
"""

import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv
import json

# Import our existing scrapers
from google_maps_scraper import GoogleMapsScraper
from aggressive_zomato_scraper import AggressiveZomatoScraper

# Load environment variables
load_dotenv()

class MultiSourceScraper:
    def __init__(self):
        self.db_url = os.getenv('NEON_DB_URL')
        
        # Initialize scrapers
        self.google_scraper = GoogleMapsScraper()
        self.zomato_scraper = AggressiveZomatoScraper()
        
        # Restaurant info
        self.restaurant_name = "The French Door"
        self.zomato_url = "https://www.zomato.com/coimbatore/the-french-door-cafe-restaurant-rs-puram/reviews"
    
    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(self.db_url)
    
    def get_all_reviews_by_source(self):
        """Get review counts by source from database"""
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            # Get counts by source
            cur.execute("""
                SELECT source, COUNT(*) as count, AVG(rating) as avg_rating
                FROM reviews 
                GROUP BY source
                ORDER BY count DESC
            """)
            
            sources = {}
            for row in cur.fetchall():
                sources[row[0]] = {
                    'count': row[1],
                    'avg_rating': round(float(row[2]), 2) if row[2] else 0
                }
            
            # Get total count
            cur.execute("SELECT COUNT(*) FROM reviews")
            total_count = cur.fetchone()[0]
            
            cur.close()
            conn.close()
            
            return {
                'total_reviews': total_count,
                'sources': sources
            }
            
        except Exception as e:
            print(f"❌ Error getting review stats: {e}")
            return {'total_reviews': 0, 'sources': {}}
    
    def scrape_google_maps(self):
        """Scrape Google Maps reviews"""
        print("🔍 Starting Google Maps scraping...")
        
        try:
            result = self.google_scraper.run_full_scraping()
            
            if result['success']:
                print(f"✅ Google Maps: {result['reviews_saved']} new reviews saved")
                return result
            else:
                print(f"❌ Google Maps scraping failed: {result['message']}")
                return result
                
        except Exception as e:
            print(f"❌ Google Maps scraper error: {e}")
            return {
                'success': False,
                'message': f'Google Maps scraper error: {str(e)}',
                'reviews_saved': 0,
                'source': 'google_maps_api'
            }
    
    def scrape_zomato(self):
        """Scrape Zomato reviews"""
        print("🔍 Starting Zomato scraping...")
        
        try:
            # Use existing Zomato scraper
            result = self.zomato_scraper.run_aggressive_scraping(
                self.zomato_url, 
                target_reviews=25
            )
            
            if result and result.get('success'):
                print(f"✅ Zomato: {result.get('reviews_saved', 0)} reviews processed")
                return {
                    'success': True,
                    'message': f"Zomato scraping completed",
                    'reviews_saved': result.get('reviews_saved', 0),
                    'source': 'zomato_real_pure'
                }
            else:
                print("❌ Zomato scraping failed")
                return {
                    'success': False,
                    'message': 'Zomato scraping failed',
                    'reviews_saved': 0,
                    'source': 'zomato_real_pure'
                }
                
        except Exception as e:
            print(f"❌ Zomato scraper error: {e}")
            return {
                'success': False,
                'message': f'Zomato scraper error: {str(e)}',
                'reviews_saved': 0,
                'source': 'zomato_real_pure'
            }
    
    def run_multi_source_scraping(self, sources=['google_maps', 'zomato']):
        """
        Run scraping from multiple sources
        
        Args:
            sources: List of sources to scrape ['google_maps', 'zomato']
        """
        print("🚀 Starting Multi-Source Review Scraping...")
        print(f"📊 Target sources: {', '.join(sources)}")
        
        results = {
            'timestamp': datetime.now().isoformat(),
            'restaurant_name': self.restaurant_name,
            'sources_scraped': [],
            'total_new_reviews': 0,
            'scraping_results': {}
        }
        
        # Get initial stats
        initial_stats = self.get_all_reviews_by_source()
        print(f"📈 Initial database state: {initial_stats['total_reviews']} total reviews")
        
        # Scrape Google Maps
        if 'google_maps' in sources:
            google_result = self.scrape_google_maps()
            results['scraping_results']['google_maps'] = google_result
            results['sources_scraped'].append('google_maps')
            results['total_new_reviews'] += google_result.get('reviews_saved', 0)
        
        # Scrape Zomato
        if 'zomato' in sources:
            zomato_result = self.scrape_zomato()
            results['scraping_results']['zomato'] = zomato_result
            results['sources_scraped'].append('zomato')
            results['total_new_reviews'] += zomato_result.get('reviews_saved', 0)
        
        # Get final stats
        final_stats = self.get_all_reviews_by_source()
        results['final_stats'] = final_stats
        
        # Calculate success
        results['success'] = results['total_new_reviews'] > 0
        results['message'] = f"Multi-source scraping completed. {results['total_new_reviews']} new reviews added."
        
        return results
    
    def get_unified_reviews(self, limit=50):
        """
        Get unified reviews from all sources with source identification
        """
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            cur.execute("""
                SELECT reviewer_name, review_text, rating, review_date, source, scraped_at
                FROM reviews 
                ORDER BY scraped_at DESC
                LIMIT %s
            """, (limit,))
            
            reviews = []
            for row in cur.fetchall():
                reviews.append({
                    'reviewer_name': row[0],
                    'text': row[1],
                    'rating': row[2],
                    'review_date': row[3].isoformat() if row[3] else None,
                    'source': row[4],
                    'scraped_at': row[5].isoformat() if row[5] else None,
                    'analysis': {
                        'overall_sentiment': 'positive' if row[2] >= 4 else 'negative' if row[2] <= 2 else 'neutral'
                    }
                })
            
            cur.close()
            conn.close()
            
            return reviews
            
        except Exception as e:
            print(f"❌ Error fetching unified reviews: {e}")
            return []
    
    def generate_multi_source_report(self):
        """Generate comprehensive report from all sources"""
        print("📊 Generating Multi-Source Analysis Report...")
        
        stats = self.get_all_reviews_by_source()
        reviews = self.get_unified_reviews(100)
        
        # Analyze by source
        source_analysis = {}
        for source, data in stats['sources'].items():
            source_reviews = [r for r in reviews if r['source'] == source]
            
            if source_reviews:
                ratings = [r['rating'] for r in source_reviews]
                sentiments = [r['analysis']['overall_sentiment'] for r in source_reviews]
                
                source_analysis[source] = {
                    'total_reviews': data['count'],
                    'avg_rating': data['avg_rating'],
                    'sentiment_breakdown': {
                        'positive': len([s for s in sentiments if s == 'positive']),
                        'negative': len([s for s in sentiments if s == 'negative']),
                        'neutral': len([s for s in sentiments if s == 'neutral'])
                    },
                    'sample_reviews': source_reviews[:5]
                }
        
        return {
            'restaurant_name': self.restaurant_name,
            'total_reviews': stats['total_reviews'],
            'sources_analyzed': len(stats['sources']),
            'source_breakdown': source_analysis,
            'overall_stats': stats,
            'timestamp': datetime.now().isoformat()
        }

def main():
    """Test the multi-source scraper"""
    scraper = MultiSourceScraper()
    
    print("🎯 SIKBO Multi-Source Review Scraper")
    print("="*50)
    
    # Run multi-source scraping
    results = scraper.run_multi_source_scraping(['google_maps', 'zomato'])
    
    print("\n📊 SCRAPING RESULTS:")
    print(f"Success: {results['success']}")
    print(f"Message: {results['message']}")
    print(f"Total New Reviews: {results['total_new_reviews']}")
    print(f"Sources Scraped: {', '.join(results['sources_scraped'])}")
    
    # Show results by source
    for source, result in results['scraping_results'].items():
        print(f"\n{source.upper()}:")
        print(f"  ✅ Success: {result['success']}")
        print(f"  📝 New Reviews: {result['reviews_saved']}")
        print(f"  💬 Message: {result['message']}")
    
    # Generate comprehensive report
    print("\n" + "="*50)
    print("MULTI-SOURCE ANALYSIS REPORT")
    print("="*50)
    
    report = scraper.generate_multi_source_report()
    
    print(f"Restaurant: {report['restaurant_name']}")
    print(f"Total Reviews: {report['total_reviews']}")
    print(f"Sources: {report['sources_analyzed']}")
    
    for source, analysis in report['source_breakdown'].items():
        print(f"\n{source.upper()}:")
        print(f"  📊 Reviews: {analysis['total_reviews']}")
        print(f"  ⭐ Avg Rating: {analysis['avg_rating']}")
        print(f"  😊 Positive: {analysis['sentiment_breakdown']['positive']}")
        print(f"  😐 Neutral: {analysis['sentiment_breakdown']['neutral']}")
        print(f"  😞 Negative: {analysis['sentiment_breakdown']['negative']}")

if __name__ == "__main__":
    main()
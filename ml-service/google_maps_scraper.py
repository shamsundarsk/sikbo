#!/usr/bin/env python3
"""
Google Maps Review Scraper for SIKBO Project
Integrates with existing PostgreSQL database and scraping system
"""

import requests
import psycopg2
from datetime import datetime
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

class GoogleMapsScraper:
    def __init__(self):
        # Google Places API Configuration
        self.api_key = 'AIzaSyC6cVc-f9ZFugq2W3JOgCW6N6SyesQo44I'
        self.restaurant_place_id = 'ChIJ3yQ4HeJYqDsR0Ky_wwSgVaY'  # The French Door
        self.restaurant_name = 'The French Door'
        
        # Database connection
        self.db_url = os.getenv('NEON_DB_URL')
        
    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(self.db_url)
    
    def scrape_google_reviews(self, max_per_rating=5):
        """
        Scrape reviews from Google Maps using Places API
        Returns organized reviews by rating
        """
        try:
            print(f"🔍 Starting Google Maps scraping for {self.restaurant_name}...")
            
            # Call Google Places API (New API)
            url = f"https://places.googleapis.com/v1/places/{self.restaurant_place_id}"
            
            headers = {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': self.api_key,
                'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews'
            }
            
            response = requests.get(url, headers=headers)
            
            if response.status_code != 200:
                print(f"❌ Google API Error: {response.status_code}")
                print(f"Response: {response.text}")
                return None
            
            data = response.json()
            
            if 'reviews' not in data:
                print("❌ No reviews found from Google API")
                return None
            
            print(f"✅ Found {len(data['reviews'])} reviews from Google API")
            
            # Organize by rating (5 from each: 5★, 4★, 3★, 2★, 1★)
            reviews_by_rating = {5: [], 4: [], 3: [], 2: [], 1: []}
            
            for review in data['reviews']:
                rating = review.get('rating', 0)
                if rating in reviews_by_rating:
                    processed_review = {
                        'restaurant_name': self.restaurant_name,
                        'restaurant_place_id': self.restaurant_place_id,
                        'reviewer_name': review.get('authorAttribution', {}).get('displayName', 'Anonymous Google User'),
                        'rating': rating,
                        'review_text': review.get('text', {}).get('text', ''),
                        'review_date': datetime.now(),
                        'source': 'google_maps_api',
                        'helpful_count': 0
                    }
                    reviews_by_rating[rating].append(processed_review)
            
            # Take max_per_rating from each rating level
            all_reviews = []
            for rating in range(5, 0, -1):  # 5★ to 1★
                selected = reviews_by_rating[rating][:max_per_rating]
                all_reviews.extend(selected)
                if selected:
                    print(f"📊 Selected {len(selected)} reviews with {rating}★ rating")
            
            print(f"🎯 Total reviews selected: {len(all_reviews)}")
            return {
                'restaurant_name': data.get('displayName', {}).get('text', self.restaurant_name),
                'total_available': len(data['reviews']),
                'reviews_scraped': len(all_reviews),
                'reviews': all_reviews,
                'api_response': data
            }
            
        except Exception as e:
            print(f"❌ Google Maps scraping error: {e}")
            return None
    
    def save_reviews_to_db(self, reviews_data):
        """
        Save scraped reviews to PostgreSQL database
        Skips duplicates based on reviewer name and review text
        """
        if not reviews_data or not reviews_data['reviews']:
            print("❌ No reviews to save")
            return 0
        
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            saved_count = 0
            
            for review in reviews_data['reviews']:
                try:
                    # Check for duplicates
                    cur.execute("""
                        SELECT id FROM reviews 
                        WHERE reviewer_name = %s AND review_text = %s AND source = %s
                    """, (review['reviewer_name'], review['review_text'], review['source']))
                    
                    existing = cur.fetchone()
                    
                    if not existing:
                        # Insert new review
                        cur.execute("""
                            INSERT INTO reviews 
                            (restaurant_name, reviewer_name, review_text, rating, review_date, source, scraped_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """, (
                            self.restaurant_name,  # Add restaurant name
                            review['reviewer_name'],
                            review['review_text'],
                            review['rating'],
                            review['review_date'],
                            review['source'],
                            datetime.now()
                        ))
                        saved_count += 1
                        print(f"✅ Saved: {review['reviewer_name']} - {review['rating']}★")
                    else:
                        print(f"⚠️ Duplicate skipped: {review['reviewer_name']}")
                        
                except Exception as e:
                    print(f"❌ Error saving individual review: {e}")
                    continue
            
            conn.commit()
            cur.close()
            conn.close()
            
            print(f"🎉 Successfully saved {saved_count} new Google Maps reviews to database")
            return saved_count
            
        except Exception as e:
            print(f"❌ Database error: {e}")
            return 0
    
    def get_saved_reviews(self):
        """Get all saved Google Maps reviews from database"""
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            cur.execute("""
                SELECT restaurant_name, reviewer_name, review_text, rating, review_date, source, scraped_at
                FROM reviews 
                WHERE source = %s 
                ORDER BY scraped_at DESC
            """, ('google_maps_api',))
            
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
            
        except Exception as e:
            print(f"❌ Error fetching saved reviews: {e}")
            return []
    
    def run_full_scraping(self):
        """
        Complete scraping workflow:
        1. Scrape from Google Maps API
        2. Save to database
        3. Return results
        """
        print("🚀 Starting Google Maps scraping workflow...")
        
        # Step 1: Scrape reviews
        scraped_data = self.scrape_google_reviews()
        
        if not scraped_data:
            return {
                'success': False,
                'message': 'Failed to scrape Google Maps reviews',
                'reviews_saved': 0,
                'total_reviews': 0
            }
        
        # Step 2: Save to database
        saved_count = self.save_reviews_to_db(scraped_data)
        
        # Step 3: Get all saved reviews
        all_reviews = self.get_saved_reviews()
        
        return {
            'success': True,
            'message': f'Successfully scraped and saved {saved_count} new Google Maps reviews',
            'reviews_scraped': scraped_data['reviews_scraped'],
            'reviews_saved': saved_count,
            'total_reviews': len(all_reviews),
            'sample_reviews': all_reviews[:10],  # First 10 for preview
            'source': 'google_maps_api',
            'timestamp': datetime.now().isoformat()
        }

def main():
    """Test the Google Maps scraper"""
    scraper = GoogleMapsScraper()
    result = scraper.run_full_scraping()
    
    print("\n" + "="*50)
    print("GOOGLE MAPS SCRAPING RESULTS")
    print("="*50)
    print(f"Success: {result['success']}")
    print(f"Message: {result['message']}")
    print(f"Reviews Scraped: {result.get('reviews_scraped', 0)}")
    print(f"Reviews Saved: {result.get('reviews_saved', 0)}")
    print(f"Total in DB: {result.get('total_reviews', 0)}")
    
    if result.get('sample_reviews'):
        print(f"\nSample Reviews:")
        for i, review in enumerate(result['sample_reviews'][:3], 1):
            print(f"{i}. {review['reviewer_name']} - {review['rating']}★")
            print(f"   \"{review['text'][:100]}...\"")

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Cleanup Malformed Zomato Reviews
Removes reviews that contain JSON/HTML fragments instead of actual review text
"""

import psycopg2
from dotenv import load_dotenv
import os
import re

# Load environment variables
load_dotenv()

class ReviewCleaner:
    def __init__(self):
        self.db_url = os.getenv('NEON_DB_URL')
    
    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(self.db_url)
    
    def identify_malformed_reviews(self):
        """Identify reviews that contain JSON/HTML fragments"""
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            # Get all zomato_aggressive_scraped reviews
            cur.execute("""
                SELECT id, reviewer_name, review_text, rating, source
                FROM reviews 
                WHERE source = 'zomato_aggressive_scraped'
                ORDER BY id
            """)
            
            all_reviews = cur.fetchall()
            malformed_reviews = []
            good_reviews = []
            
            # Patterns that indicate malformed reviews
            malformed_patterns = [
                r'"resId"',
                r'"pageUrl"',
                r'"ogUrl"',
                r'"canonicalUrl"',
                r'"displayName"',
                r'"timestamp"',
                r'"likeCount"',
                r'"isLiked"',
                r'"hash"',
                r'"entity_type"',
                r'"entity_ids"',
                r'src\s*"',
                r'loading\s*"lazy"',
                r'class\s*=',
                r'div\s+',
                r'span\s+',
                r'href\s*=',
                r'www\.',
                r'http',
                r'coimbatore.*french-door',
                r'zomato\.com',
                r'sessionSampleRate',
                r'trackUserInteractions',
                r'geometricPrecision',
                r'COOKIE_BANNER',
                r'Terms of Service',
                r'Privacy Policy',
                r'By continuing past this page',
                r'Order food online',
                r'restaurants\s*"',
                r'Agriculture Univeristy',
                r'Weather Union',
                r'Zomaverse',
                r'FOR_RESTAURANTS',
                r'LEARN_MORE',
                r'Social links',
                r'See all events',
                r'Opening Hours',
                r'Happy Hours',
                r'CHEF DETAILS',
                r'View Gallery',
                r'Similar restaurants',
                r'Trustworthy Reviews',
                r'genuine reviews',
                r'Calculate cost',
                r'Create account',
                r'Already have an account',
                r'Resend Now',
                r'TERMINATE_VERIFICATION',
                r'important.*animation',
                r'border-color.*rgb',
                r'box-shadow.*none',
                r'shape-rendering',
                r'text-rendering',
                r'image-rendering',
                r'clip-rule',
                r'viewBox',
                r'path\s+d\s*=',
                r'svg.*xmlns',
                r'meta.*property',
                r'link.*rel',
                r'script.*type',
                r'Datadog',
                r'sessionReplaySampleRate',
                r'defaultPrivacyLevel',
                r'trackResources',
                r'trackLongTasks',
                # Additional patterns for JSON fragments
                r'","description"',
                r'"description"\s*"',
                r'to\s+[a-zA-Z0-9]{6,}","',
                r'yiI"\s*',
                r'DEST_FIRST',
                r'SORT_HIGHEST_RATED',
                r'SORT_LOWEST_RATED',
                r'POSITIVE_TAGS',
                r'NEGATIVE_TAGS',
                r'DAILY_MENU_TITLE',
                r'DELETE_REVIEW_TEXT',
                r'GEO_LOCATION_POSITION_UNAVAILABLE',
                r'has_fake_reviews',
                r'aggregate_rating',
                r'cuisine_string',
                r'Continental.*North Indian.*French',
                r'kEgyiI"',
                r'7bklc-8',
                r'eGARypG',
                r'berPyBY'
            ]
            
            print(f"🔍 Analyzing {len(all_reviews)} zomato_aggressive_scraped reviews...")
            
            for review in all_reviews:
                review_id, reviewer_name, review_text, rating, source = review
                
                # Check if review text contains malformed patterns
                is_malformed = False
                
                if not review_text or len(review_text.strip()) < 10:
                    is_malformed = True
                else:
                    for pattern in malformed_patterns:
                        if re.search(pattern, review_text, re.IGNORECASE):
                            is_malformed = True
                            break
                
                # Additional checks for obvious non-review content
                if not is_malformed:
                    # Check for excessive special characters
                    special_char_ratio = len(re.findall(r'[{}"\[\]<>]', review_text)) / len(review_text)
                    if special_char_ratio > 0.1:  # More than 10% special chars
                        is_malformed = True
                    
                    # Check for URL-like patterns
                    if re.search(r'[a-zA-Z0-9]{20,}', review_text):  # Long alphanumeric strings
                        is_malformed = True
                    
                    # Check for obvious metadata
                    if any(word in review_text.lower() for word in ['json', 'api', 'config', 'debug', 'console']):
                        is_malformed = True
                
                if is_malformed:
                    malformed_reviews.append(review)
                else:
                    good_reviews.append(review)
            
            cur.close()
            conn.close()
            
            print(f"📊 Analysis Results:")
            print(f"   ❌ Malformed reviews: {len(malformed_reviews)}")
            print(f"   ✅ Good reviews: {len(good_reviews)}")
            
            return malformed_reviews, good_reviews
            
        except Exception as e:
            print(f"❌ Error analyzing reviews: {e}")
            return [], []
    
    def show_sample_malformed_reviews(self, malformed_reviews):
        """Show sample malformed reviews for verification"""
        print(f"\n📝 Sample Malformed Reviews (showing first 5):")
        
        for i, review in enumerate(malformed_reviews[:5]):
            review_id, reviewer_name, review_text, rating, source = review
            print(f"\n{i+1}. ID: {review_id} | Reviewer: {reviewer_name}")
            print(f"   Text: \"{review_text[:150]}...\"")
    
    def show_sample_good_reviews(self, good_reviews):
        """Show sample good reviews for verification"""
        print(f"\n✅ Sample Good Reviews (showing first 5):")
        
        for i, review in enumerate(good_reviews[:5]):
            review_id, reviewer_name, review_text, rating, source = review
            print(f"\n{i+1}. ID: {review_id} | Reviewer: {reviewer_name} | Rating: {rating}★")
            print(f"   Text: \"{review_text[:150]}...\"")
    
    def remove_malformed_reviews(self, malformed_reviews):
        """Remove malformed reviews from database"""
        if not malformed_reviews:
            print("✅ No malformed reviews to remove!")
            return 0
        
        try:
            conn = self.get_db_connection()
            cur = conn.cursor()
            
            # Get IDs of malformed reviews
            malformed_ids = [review[0] for review in malformed_reviews]
            
            print(f"🗑️ Removing {len(malformed_ids)} malformed reviews...")
            
            # Delete malformed reviews
            cur.execute("""
                DELETE FROM reviews 
                WHERE id = ANY(%s)
            """, (malformed_ids,))
            
            deleted_count = cur.rowcount
            conn.commit()
            
            cur.close()
            conn.close()
            
            print(f"✅ Successfully removed {deleted_count} malformed reviews")
            return deleted_count
            
        except Exception as e:
            print(f"❌ Error removing malformed reviews: {e}")
            return 0
    
    def get_final_stats(self):
        """Get final statistics after cleanup"""
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
            
            print(f"\n📊 Final Database Statistics:")
            total_reviews = 0
            
            for row in cur.fetchall():
                source, count, avg_rating = row
                total_reviews += count
                print(f"   📝 {source}: {count} reviews (avg: {avg_rating:.2f}★)")
            
            print(f"\n🎯 Total Reviews: {total_reviews}")
            
            cur.close()
            conn.close()
            
            return total_reviews
            
        except Exception as e:
            print(f"❌ Error getting final stats: {e}")
            return 0

def main():
    """Main cleanup process"""
    print("🧹 ZOMATO REVIEW CLEANUP PROCESS")
    print("="*50)
    print("Removing malformed reviews that contain JSON/HTML fragments")
    print()
    
    cleaner = ReviewCleaner()
    
    # Step 1: Identify malformed reviews
    malformed_reviews, good_reviews = cleaner.identify_malformed_reviews()
    
    if not malformed_reviews:
        print("✅ No malformed reviews found! Database is clean.")
        cleaner.get_final_stats()
        return
    
    # Step 2: Show samples for verification
    cleaner.show_sample_malformed_reviews(malformed_reviews)
    cleaner.show_sample_good_reviews(good_reviews)
    
    # Step 3: Confirm removal
    print(f"\n⚠️  CONFIRMATION REQUIRED:")
    print(f"   This will remove {len(malformed_reviews)} malformed reviews")
    print(f"   and keep {len(good_reviews)} good reviews")
    
    confirm = input(f"\n🤔 Proceed with cleanup? (y/N): ").strip().lower()
    
    if confirm == 'y' or confirm == 'yes':
        # Step 4: Remove malformed reviews
        deleted_count = cleaner.remove_malformed_reviews(malformed_reviews)
        
        # Step 5: Show final statistics
        if deleted_count > 0:
            print(f"\n🎉 Cleanup completed successfully!")
            cleaner.get_final_stats()
        else:
            print(f"\n❌ Cleanup failed!")
    else:
        print(f"\n❌ Cleanup cancelled by user")

if __name__ == "__main__":
    main()
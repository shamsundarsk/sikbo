from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import nltk
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
try:
    import spacy
except ImportError:
    spacy = None
import re
import json
from datetime import datetime, timedelta
import asyncio
import aiohttp
from playwright.async_api import async_playwright
import time
import random
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
    import torch
except ImportError:
    print("Transformers not available. Using basic sentiment analysis.")
    pipeline = None
    torch = None
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings('ignore')

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Add CORS headers to allow frontend access
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Handle preflight requests
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = app.make_default_options_response()
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Initialize advanced sentiment analysis models
print("Loading advanced ML models...")
try:
    # Download required NLTK data (skip if fails)
    try:
        nltk.download('punkt', quiet=True)
        nltk.download('stopwords', quiet=True)
        nltk.download('vader_lexicon', quiet=True)
    except:
        print("NLTK download skipped - using cached data")
    
    # Load spaCy model for NER
    try:
        if spacy:
            nlp = spacy.load("en_core_web_sm")
        else:
            nlp = None
    except (OSError, ImportError):
        print("spaCy model not found. NLP features will be limited.")
        nlp = None
    
    # Initialize VADER sentiment analyzer
    vader_analyzer = SentimentIntensityAnalyzer()
    
    # Skip transformer model for faster startup
    sentiment_pipeline = None
    print("Transformer models skipped for faster startup")
    
    # Initialize ML models for sentiment and category prediction
    sentiment_model = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
        ('classifier', LogisticRegression())
    ])
    
    category_model = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
        ('classifier', LogisticRegression())
    ])
    
    print("✅ Advanced ML models loaded successfully")
except Exception as e:
    print(f"⚠️ Error loading ML models: {e}")
    vader_analyzer = None
    sentiment_pipeline = None
    nlp = None
    # Fallback models
    sentiment_model = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
        ('classifier', LogisticRegression())
    ])
    category_model = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
        ('classifier', LogisticRegression())
    ])

# Enhanced keyword mappings for comprehensive analysis
DISH_KEYWORDS = {
    'coffee': ['coffee', 'cappuccino', 'latte', 'espresso', 'americano', 'mocha', 'macchiato', 'cold brew'],
    'tea': ['tea', 'chai', 'green tea', 'black tea', 'herbal tea', 'masala chai', 'earl grey'],
    'burger': ['burger', 'sandwich', 'club sandwich', 'grilled sandwich', 'chicken burger', 'veggie burger'],
    'pizza': ['pizza', 'margherita', 'pepperoni', 'cheese pizza', 'wood fired'],
    'pasta': ['pasta', 'spaghetti', 'noodles', 'penne', 'fettuccine', 'lasagna', 'carbonara'],
    'dessert': ['cake', 'ice cream', 'dessert', 'sweet', 'pastry', 'brownie', 'cheesecake', 'tiramisu'],
    'salad': ['salad', 'healthy', 'green', 'caesar salad', 'fruit salad', 'greek salad'],
    'juice': ['juice', 'smoothie', 'fresh juice', 'shake', 'milkshake', 'cold pressed'],
    'bread': ['bread', 'croissant', 'baguette', 'toast', 'garlic bread'],
    'soup': ['soup', 'broth', 'bisque', 'chowder'],
    'chicken': ['chicken', 'grilled chicken', 'fried chicken', 'chicken curry'],
    'fish': ['fish', 'salmon', 'tuna', 'seafood'],
    'rice': ['rice', 'biryani', 'fried rice', 'pulao'],
    'indian': ['curry', 'dal', 'paneer', 'tandoori', 'masala', 'biriyani'],
    'breakfast': ['pancake', 'waffle', 'omelette', 'eggs', 'french toast'],
    'snacks': ['fries', 'nachos', 'chips', 'appetizer', 'starter']
}

SERVICE_KEYWORDS = [
    'service', 'staff', 'waiter', 'waitress', 'server', 'delay', 'slow', 'fast', 'quick',
    'friendly', 'rude', 'polite', 'attentive', 'helpful', 'unprofessional', 'professional',
    'wait time', 'waiting', 'prompt', 'efficient', 'courteous', 'attitude'
]

STAFF_KEYWORDS = [
    'waiter', 'waitress', 'server', 'staff', 'manager', 'chef', 'bartender', 'host',
    'employee', 'team', 'crew', 'personnel', 'worker'
]

# Raw materials database
RAW_MATERIALS_DB = {
    'coffee': {
        'ingredients': ['coffee beans', 'milk', 'sugar', 'water'],
        'quantities': [20, 150, 5, 200],  # grams/ml
        'costs': [15, 8, 2, 0.5],  # cost per unit
        'unit': ['g', 'ml', 'g', 'ml']
    },
    'burger': {
        'ingredients': ['bun', 'patty', 'lettuce', 'tomato', 'cheese', 'sauce'],
        'quantities': [1, 150, 20, 30, 20, 15],
        'costs': [12, 45, 5, 8, 15, 3],
        'unit': ['piece', 'g', 'g', 'g', 'g', 'ml']
    },
    'pizza': {
        'ingredients': ['dough', 'tomato sauce', 'cheese', 'toppings', 'herbs'],
        'quantities': [200, 50, 100, 80, 5],
        'costs': [20, 8, 35, 25, 3],
        'unit': ['g', 'ml', 'g', 'g', 'g']
    },
    'pasta': {
        'ingredients': ['pasta', 'sauce', 'cheese', 'vegetables', 'herbs'],
        'quantities': [100, 80, 30, 50, 3],
        'costs': [15, 12, 20, 15, 2],
        'unit': ['g', 'ml', 'g', 'g', 'g']
    },
    'salad': {
        'ingredients': ['lettuce', 'vegetables', 'dressing', 'protein', 'nuts'],
        'quantities': [100, 80, 20, 50, 15],
        'costs': [8, 20, 5, 25, 12],
        'unit': ['g', 'g', 'ml', 'g', 'g']
    }
}

def load_training_data():
    """Load and prepare training data from Neon database"""
    try:
        conn = get_db_connection()
        if not conn:
            raise Exception("Could not connect to database")
        
        # Load reviews from database
        query = """
        SELECT r.review_text, sa.overall_sentiment, 
               COALESCE(array_to_string(sa.mentioned_dishes, ','), 'general') as dish
        FROM reviews r
        LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
        WHERE r.review_text IS NOT NULL AND r.review_text != ''
        ORDER BY r.scraped_at DESC
        """
        
        cursor = conn.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
        
        if not results:
            print("⚠️ No reviews found in database, checking reviews table...")
            # Try simpler query if sentiment_analysis is empty
            cursor.execute("SELECT review_text, 'neutral' as sentiment, 'general' as dish FROM reviews WHERE review_text IS NOT NULL LIMIT 100")
            results = cursor.fetchall()
        
        conn.close()
        
        if results:
            reviews = [row[0] for row in results]
            sentiments = [row[1] if row[1] else 'neutral' for row in results]
            
            # Create category training data based on keywords
            categories = []
            for review in reviews:
                if any(keyword in review.lower() for keyword in SERVICE_KEYWORDS):
                    categories.append('service')
                elif any(keyword in review.lower() for keyword in STAFF_KEYWORDS):
                    categories.append('staff')
                else:
                    categories.append('food')
            
            print(f"✅ Loaded {len(reviews)} reviews from Neon database")
            return reviews, sentiments, categories
        else:
            raise Exception("No reviews found in database")
            
    except Exception as e:
        print(f"❌ Error loading from database: {e}")
        print("🔄 Using minimal fallback data...")
        
        # Minimal fallback - will be replaced with real data
        sample_data = [
            ("Great coffee and excellent service", "positive", "food"),
            ("Food was cold and service was slow", "negative", "service"),
            ("Average meal, nothing special", "neutral", "food")
        ]
        
        reviews = [item[0] for item in sample_data]
        sentiments = [item[1] for item in sample_data]
        categories = [item[2] for item in sample_data]
        return reviews, sentiments, categories

# Train the models after all functions are defined
# This will be moved to after get_db_connection is defined

def analyze_review_comprehensive(text):
    """Comprehensive review analysis for food, service, and staff"""
    try:
        sentiment = sentiment_model.predict([text])[0]
        category = category_model.predict([text])[0]
        
        # Extract specific insights
        text_lower = text.lower()
        
        # Service-specific analysis
        service_score = 0
        if category == 'service':
            positive_service = ['fast', 'quick', 'friendly', 'helpful', 'professional', 'efficient']
            negative_service = ['slow', 'rude', 'delay', 'unprofessional', 'waiting']
            
            for word in positive_service:
                if word in text_lower:
                    service_score += 1
            for word in negative_service:
                if word in text_lower:
                    service_score -= 1
        
        # Staff-specific analysis
        staff_mentions = []
        for keyword in STAFF_KEYWORDS:
            if keyword in text_lower:
                staff_mentions.append(keyword)
        
        # Food item extraction
        food_items = []
        for dish, keywords in DISH_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    food_items.append(dish)
                    break
        
        return {
            'sentiment': sentiment,
            'category': category,
            'service_score': service_score,
            'staff_mentions': staff_mentions,
            'food_items': food_items,
            'confidence': 0.85  # Mock confidence score
        }
    except Exception as e:
        return {
            'sentiment': 'neutral',
            'category': 'food',
            'service_score': 0,
            'staff_mentions': [],
            'food_items': [],
            'confidence': 0.5
        }

def get_raw_material_cost(dish_name):
    """Calculate raw material cost for a dish"""
    dish_key = dish_name.lower()
    
    # Find matching dish in database
    for key in RAW_MATERIALS_DB:
        if key in dish_key or dish_key in key:
            materials = RAW_MATERIALS_DB[key]
            total_cost = sum(
                qty * cost for qty, cost in zip(materials['quantities'], materials['costs'])
            )
            return {
                'dish': dish_name,
                'ingredients': materials['ingredients'],
                'quantities': materials['quantities'],
                'costs': materials['costs'],
                'units': materials['unit'],
                'total_cost': round(total_cost / 100, 2),  # Convert to currency units
                'breakdown': [
                    {
                        'ingredient': ing,
                        'quantity': qty,
                        'unit': unit,
                        'cost': cost,
                        'total': round((qty * cost) / 100, 2)
                    }
                    for ing, qty, unit, cost in zip(
                        materials['ingredients'], 
                        materials['quantities'], 
                        materials['unit'], 
                        materials['costs']
                    )
                ]
            }
    
    # Default cost if dish not found
    return {
        'dish': dish_name,
        'ingredients': ['unknown'],
        'quantities': [1],
        'costs': [50],
        'units': ['unit'],
        'total_cost': 0.50,
        'breakdown': [{'ingredient': 'unknown', 'quantity': 1, 'unit': 'unit', 'cost': 50, 'total': 0.50}]
    }

def generate_trending_dishes():
    """Generate trending dishes with time-based patterns"""
    current_month = datetime.now().month
    
    # Seasonal trending patterns
    seasonal_trends = {
        'winter': ['hot coffee', 'soup', 'hot chocolate', 'warm desserts'],
        'summer': ['cold coffee', 'ice cream', 'fresh juice', 'salads'],
        'monsoon': ['tea', 'hot snacks', 'comfort food'],
        'spring': ['fresh salads', 'smoothies', 'light meals']
    }
    
    # Determine season
    if current_month in [12, 1, 2]:
        season = 'winter'
    elif current_month in [3, 4, 5]:
        season = 'spring'
    elif current_month in [6, 7, 8, 9]:
        season = 'monsoon'
    else:
        season = 'summer'
    
    base_trends = [
        {'dish': 'Coffee', 'count': random.randint(40, 60), 'source': 'instagram'},
        {'dish': 'Burger', 'count': random.randint(30, 50), 'source': 'instagram'},
        {'dish': 'Pizza', 'count': random.randint(25, 45), 'source': 'instagram'},
        {'dish': 'Dessert', 'count': random.randint(20, 40), 'source': 'instagram'},
        {'dish': 'Pasta', 'count': random.randint(18, 35), 'source': 'instagram'},
    ]
    
    # Add seasonal trends
    seasonal_items = seasonal_trends.get(season, [])
    for item in seasonal_items[:3]:
        base_trends.append({
            'dish': item.title(),
            'count': random.randint(15, 30),
            'source': 'seasonal',
            'season': season
        })
    
    return sorted(base_trends, key=lambda x: x['count'], reverse=True)

def scrape_google_reviews_enhanced(place_url):
    """Enhanced Google Maps scraper with better error handling"""
    reviews = []
    menu_items = []
    
    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        print(f"Scraping reviews from: {place_url}")
        driver.get(place_url)
        time.sleep(5)
        
        # Try multiple strategies to find reviews
        review_selectors = [
            "[data-review-id]",
            ".jftiEf",
            ".MyEned", 
            ".wiI7pd",
            "[jsaction*='review']",
            ".fontBodyMedium"
        ]
        
        review_elements = []
        for selector in review_selectors:
            elements = driver.find_elements(By.CSS_SELECTOR, selector)
            if elements:
                review_elements = elements
                break
        
        # Scroll to load more reviews
        for i in range(3):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Try to find more reviews after scrolling
            new_elements = driver.find_elements(By.CSS_SELECTOR, review_selectors[0])
            if len(new_elements) > len(review_elements):
                review_elements = new_elements
        
        print(f"Found {len(review_elements)} review elements")
        
        processed_reviews = set()  # Avoid duplicates
        
        for element in review_elements[:30]:  # Process up to 30 reviews
            try:
                review_text = element.text.strip()
                
                # Skip if too short or already processed
                if len(review_text) < 20 or review_text in processed_reviews:
                    continue
                
                processed_reviews.add(review_text)
                
                # Comprehensive analysis
                analysis = analyze_review_comprehensive(review_text)
                
                # Extract menu items
                extracted_items = extract_menu_items_from_text(review_text)
                menu_items.extend(extracted_items)
                
                reviews.append({
                    'text': review_text,
                    'sentiment': analysis['sentiment'],
                    'category': analysis['category'],
                    'service_score': analysis['service_score'],
                    'staff_mentions': analysis['staff_mentions'],
                    'food_items': analysis['food_items'],
                    'source': 'google_maps',
                    'confidence': analysis['confidence'],
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"Error processing review: {e}")
                continue
        
        driver.quit()
        
        # Remove duplicate menu items
        unique_menu_items = []
        seen_items = set()
        for item in menu_items:
            item_key = item['item'].lower()
            if item_key not in seen_items and len(item_key) > 3:
                seen_items.add(item_key)
                unique_menu_items.append(item)
        
        print(f"Successfully scraped {len(reviews)} reviews and found {len(unique_menu_items)} menu items")
        
    except Exception as e:
        print(f"Error in enhanced scraping: {e}")
        return generate_fallback_data()
    
    return reviews, unique_menu_items

def generate_fallback_data():
    """Enhanced fallback data for demo purposes"""
    fallback_reviews = [
        {
            'text': 'Amazing coffee and croissants! The French Door has the best breakfast in town. Service was quick and staff very friendly.',
            'sentiment': 'positive',
            'category': 'food',
            'service_score': 2,
            'staff_mentions': ['staff'],
            'food_items': ['coffee', 'bread'],
            'source': 'google_maps',
            'confidence': 0.9,
            'timestamp': datetime.now().isoformat()
        },
        {
            'text': 'Great ambiance but the pasta was overcooked. Waiter took too long to take our order.',
            'sentiment': 'negative',
            'category': 'service',
            'service_score': -1,
            'staff_mentions': ['waiter'],
            'food_items': ['pasta'],
            'source': 'google_maps',
            'confidence': 0.8,
            'timestamp': datetime.now().isoformat()
        },
        {
            'text': 'Excellent pizza and the staff was very attentive. Manager personally came to check on us.',
            'sentiment': 'positive',
            'category': 'staff',
            'service_score': 1,
            'staff_mentions': ['staff', 'manager'],
            'food_items': ['pizza'],
            'source': 'google_maps',
            'confidence': 0.85,
            'timestamp': datetime.now().isoformat()
        }
    ]
    
    fallback_menu_items = [
        {'item': 'French Coffee', 'category': 'Beverages', 'confidence': 0.8},
        {'item': 'Croissant', 'category': 'Bread', 'confidence': 0.9},
        {'item': 'Pasta Carbonara', 'category': 'Pasta', 'confidence': 0.7},
        {'item': 'Margherita Pizza', 'category': 'Pizza', 'confidence': 0.85}
    ]
    
    return fallback_reviews, fallback_menu_items

def clean_review_text(text):
    """Clean and preprocess review text"""
    if not text:
        return ""
    
    # Remove extra whitespace and newlines
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    # Remove very short reviews (less than 10 characters)
    if len(text) < 10:
        return ""
    
    return text

def extract_menu_items_from_text(text):
    """Extract potential menu items from review text"""
    if not text:
        return []
    
    text_lower = text.lower()
    found_items = []
    
    for category, keywords in DISH_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                # Try to extract the full dish name context
                pattern = rf'\b[\w\s]*{re.escape(keyword)}[\w\s]*\b'
                matches = re.findall(pattern, text_lower)
                for match in matches:
                    clean_match = match.strip()
                    if len(clean_match) > 3 and len(clean_match) < 50:
                        found_items.append({
                            'item': clean_match.title(),
                            'category': category.title(),
                            'confidence': len(keyword) / len(clean_match)
                        })
    
    return found_items

def map_text_to_dish(text):
    """Map review text to dish names"""
    text_lower = text.lower()
    for dish, keywords in DISH_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return dish.title()
    return "Unknown"

def analyze_sentiment(text):
    """Analyze sentiment of review text"""
    try:
        prediction = sentiment_model.predict([text])[0]
        return prediction
    except:
        return "neutral"

# API Routes
@app.route('/scrape', methods=['POST'])
def scrape_data():
    """Enhanced scraping endpoint with comprehensive analysis"""
    data = request.json
    google_url = data.get('google_url', '')
    
    result = {
        'reviews': [],
        'trends': [],
        'menu_items': [],
        'analytics': {
            'total_reviews': 0,
            'sentiment_breakdown': {'positive': 0, 'negative': 0, 'neutral': 0},
            'category_breakdown': {'food': 0, 'service': 0, 'staff': 0},
            'service_score': 0
        },
        'status': 'success'
    }
    
    try:
        # Use enhanced scraping for Google reviews
        if google_url and 'google.com/maps' in google_url:
            print(f"Starting enhanced scraping for: {google_url}")
            reviews, menu_items = scrape_google_reviews_enhanced(google_url)
        else:
            reviews, menu_items = generate_fallback_data()
        
        result['reviews'] = reviews
        result['menu_items'] = menu_items
        
        # Generate analytics
        if reviews:
            result['analytics']['total_reviews'] = len(reviews)
            
            # Sentiment breakdown
            for review in reviews:
                sentiment = review.get('sentiment', 'neutral')
                result['analytics']['sentiment_breakdown'][sentiment] += 1
                
                category = review.get('category', 'food')
                result['analytics']['category_breakdown'][category] += 1
                
                result['analytics']['service_score'] += review.get('service_score', 0)
        
        # Generate trending data
        trends = generate_trending_dishes()
        result['trends'] = trends
        
        print(f"Enhanced scraping completed: {len(reviews)} reviews, {len(menu_items)} menu items")
        
    except Exception as e:
        result['status'] = 'error'
        result['message'] = str(e)
        print(f"Scraping error: {e}")
    
    return jsonify(result)

@app.route('/analyze-service', methods=['POST'])
def analyze_service():
    """Analyze service-specific sentiment from reviews"""
    data = request.json
    reviews = data.get('reviews', [])
    
    service_analysis = {
        'total_service_reviews': 0,
        'service_rating': 0,
        'positive_count': 0,
        'negative_count': 0,
        'neutral_count': 0,
        'key_issues': [],
        'key_positives': []
    }
    
    service_reviews = [r for r in reviews if r.get('category') == 'service' or r.get('service_score', 0) != 0]
    service_analysis['total_service_reviews'] = len(service_reviews)
    
    if service_reviews:
        total_score = sum(r.get('service_score', 0) for r in service_reviews)
        service_analysis['service_rating'] = round((total_score / len(service_reviews)) * 2 + 3, 1)  # Scale to 1-5
        
        for review in service_reviews:
            sentiment = review.get('sentiment', 'neutral')
            service_analysis[f'{sentiment}_count'] += 1
            
            # Extract key issues and positives
            text_lower = review.get('text', '').lower()
            if sentiment == 'negative':
                if 'slow' in text_lower or 'delay' in text_lower:
                    service_analysis['key_issues'].append('Slow service')
                if 'rude' in text_lower:
                    service_analysis['key_issues'].append('Rude staff')
            elif sentiment == 'positive':
                if 'fast' in text_lower or 'quick' in text_lower:
                    service_analysis['key_positives'].append('Quick service')
                if 'friendly' in text_lower:
                    service_analysis['key_positives'].append('Friendly staff')
    
    return jsonify(service_analysis)

@app.route('/analyze-staff', methods=['POST'])
def analyze_staff():
    """Analyze staff performance from reviews"""
    data = request.json
    reviews = data.get('reviews', [])
    
    staff_analysis = {
        'staff_mentions': {},
        'overall_staff_rating': 0,
        'positive_mentions': 0,
        'negative_mentions': 0,
        'staff_feedback': []
    }
    
    staff_reviews = [r for r in reviews if r.get('staff_mentions')]
    
    for review in staff_reviews:
        sentiment = review.get('sentiment', 'neutral')
        staff_mentions = review.get('staff_mentions', [])
        
        for mention in staff_mentions:
            if mention not in staff_analysis['staff_mentions']:
                staff_analysis['staff_mentions'][mention] = {'positive': 0, 'negative': 0, 'neutral': 0}
            
            staff_analysis['staff_mentions'][mention][sentiment] += 1
            
            if sentiment == 'positive':
                staff_analysis['positive_mentions'] += 1
            elif sentiment == 'negative':
                staff_analysis['negative_mentions'] += 1
        
        staff_analysis['staff_feedback'].append({
            'text': review.get('text', '')[:100] + '...',
            'sentiment': sentiment,
            'mentions': staff_mentions
        })
    
    # Calculate overall rating
    total_mentions = staff_analysis['positive_mentions'] + staff_analysis['negative_mentions']
    if total_mentions > 0:
        staff_analysis['overall_staff_rating'] = round(
            (staff_analysis['positive_mentions'] / total_mentions) * 5, 1
        )
    
    return jsonify(staff_analysis)

@app.route('/raw-materials/<dish_name>', methods=['GET'])
def get_raw_materials(dish_name):
    """Get raw material breakdown for a specific dish"""
    return jsonify(get_raw_material_cost(dish_name))

@app.route('/menu-analysis', methods=['POST'])
def analyze_menu_performance():
    """Comprehensive menu analysis with recommendations"""
    data = request.json
    sales_data = data.get('sales', {})
    reviews = data.get('reviews', [])
    
    menu_analysis = {}
    
    for dish_name, sales_info in sales_data.items():
        # Get raw material costs
        raw_materials = get_raw_material_cost(dish_name)
        
        # Calculate profit margin
        revenue = sales_info.get('revenue', 0)
        orders = sales_info.get('orders', 0)
        raw_cost = raw_materials['total_cost'] * orders
        profit = revenue - raw_cost
        profit_margin = (profit / revenue * 100) if revenue > 0 else 0
        
        # Get sentiment for this dish
        dish_reviews = [r for r in reviews if dish_name.lower() in r.get('text', '').lower()]
        sentiment_score = 0
        if dish_reviews:
            positive_count = sum(1 for r in dish_reviews if r.get('sentiment') == 'positive')
            negative_count = sum(1 for r in dish_reviews if r.get('sentiment') == 'negative')
            sentiment_score = (positive_count - negative_count) / len(dish_reviews)
        
        # Decision logic
        decision = 'maintain'
        reason = 'Stable performance'
        
        if profit_margin < 20 and sentiment_score < -0.3:
            decision = 'remove'
            reason = 'Low profit and poor customer sentiment'
        elif profit_margin < 20:
            decision = 'optimize'
            reason = 'Low profit margin - consider cost reduction'
        elif sentiment_score < -0.5:
            decision = 'fix'
            reason = 'Poor customer feedback - quality issues'
        elif profit_margin > 40 and sentiment_score > 0.3:
            decision = 'promote'
            reason = 'High profit and positive feedback'
        
        menu_analysis[dish_name] = {
            'sales': sales_info,
            'raw_materials': raw_materials,
            'profit': round(profit, 2),
            'profit_margin': round(profit_margin, 1),
            'sentiment_score': round(sentiment_score, 2),
            'review_count': len(dish_reviews),
            'decision': decision,
            'reason': reason
        }
    
    return jsonify(menu_analysis)

@app.route('/customer-flow', methods=['POST'])
def analyze_customer_flow():
    """Generate customer flow analysis (simulated data)"""
    data = request.json
    
    # Generate realistic customer flow data
    current_date = datetime.now()
    flow_data = []
    
    for i in range(7):  # Last 7 days
        date = current_date - timedelta(days=i)
        
        # Simulate hourly data
        hourly_data = []
        for hour in range(24):
            # Peak hours: 12-14 (lunch), 19-21 (dinner)
            if 12 <= hour <= 14:
                customers = random.randint(15, 30)
            elif 19 <= hour <= 21:
                customers = random.randint(20, 35)
            elif 8 <= hour <= 10:  # Breakfast
                customers = random.randint(8, 15)
            else:
                customers = random.randint(2, 8)
            
            hourly_data.append({
                'hour': hour,
                'customers': customers
            })
        
        flow_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'day': date.strftime('%A'),
            'total_customers': sum(h['customers'] for h in hourly_data),
            'hourly_data': hourly_data,
            'peak_hour': max(hourly_data, key=lambda x: x['customers'])['hour']
        })
    
    # Calculate analytics
    total_week_customers = sum(d['total_customers'] for d in flow_data)
    avg_daily_customers = round(total_week_customers / 7, 1)
    busiest_day = max(flow_data, key=lambda x: x['total_customers'])
    
    return jsonify({
        'daily_data': flow_data,
        'analytics': {
            'total_week_customers': total_week_customers,
            'avg_daily_customers': avg_daily_customers,
            'busiest_day': busiest_day['day'],
            'busiest_day_count': busiest_day['total_customers']
        }
    })

@app.route('/review-actions', methods=['POST'])
def generate_review_actions():
    """Generate action items for negative reviews"""
    data = request.json
    reviews = data.get('reviews', [])
    
    negative_reviews = [r for r in reviews if r.get('sentiment') == 'negative']
    
    actions = []
    for review in negative_reviews:
        text = review.get('text', '')
        category = review.get('category', 'food')
        
        # Generate specific actions based on review content
        action_type = 'respond'
        priority = 'medium'
        suggested_action = 'Send personalized apology'
        
        text_lower = text.lower()
        
        if 'food' in text_lower and ('cold' in text_lower or 'bad' in text_lower):
            action_type = 'fix_quality'
            priority = 'high'
            suggested_action = 'Review food preparation process and quality control'
        elif 'service' in text_lower or 'slow' in text_lower:
            action_type = 'improve_service'
            priority = 'high'
            suggested_action = 'Provide additional staff training on service speed'
        elif 'staff' in text_lower and 'rude' in text_lower:
            action_type = 'staff_training'
            priority = 'high'
            suggested_action = 'Conduct customer service training for staff'
        
        actions.append({
            'review_text': text[:100] + '...',
            'category': category,
            'action_type': action_type,
            'priority': priority,
            'suggested_action': suggested_action,
            'estimated_time': '2-3 days',
            'status': 'pending'
        })
    
    return jsonify({
        'total_actions': len(actions),
        'high_priority': len([a for a in actions if a['priority'] == 'high']),
        'actions': actions
    })

# First health route removed to avoid duplicate

# Database connection
def get_db_connection():
    """Get connection to Neon PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            os.getenv('NEON_DB_URL'),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# Train the models now that get_db_connection is defined
print("🎯 Training ML models with database data...")
X_train, y_sentiment, y_category = load_training_data()
sentiment_model.fit(X_train, y_sentiment)
category_model.fit(X_train, y_category)
print(f"✅ Models trained on {len(X_train)} reviews from Neon database")

# Advanced keyword mappings for comprehensive analysis
FOOD_KEYWORDS = {
    'coffee': ['coffee', 'cappuccino', 'latte', 'espresso', 'americano', 'mocha', 'macchiato', 'cold brew', 'frappuccino'],
    'tea': ['tea', 'chai', 'green tea', 'black tea', 'herbal tea', 'masala chai', 'earl grey', 'iced tea'],
    'burger': ['burger', 'sandwich', 'club sandwich', 'grilled sandwich', 'chicken burger', 'veggie burger', 'cheeseburger'],
    'pizza': ['pizza', 'margherita', 'pepperoni', 'cheese pizza', 'wood fired', 'thin crust', 'deep dish'],
    'pasta': ['pasta', 'spaghetti', 'noodles', 'penne', 'fettuccine', 'lasagna', 'carbonara', 'alfredo', 'bolognese'],
    'dessert': ['cake', 'ice cream', 'dessert', 'sweet', 'pastry', 'brownie', 'cheesecake', 'tiramisu', 'mousse'],
    'salad': ['salad', 'healthy', 'green', 'caesar salad', 'fruit salad', 'greek salad', 'quinoa salad'],
    'juice': ['juice', 'smoothie', 'fresh juice', 'shake', 'milkshake', 'cold pressed', 'detox juice'],
    'bread': ['bread', 'croissant', 'baguette', 'toast', 'garlic bread', 'sourdough', 'focaccia'],
    'soup': ['soup', 'broth', 'bisque', 'chowder', 'minestrone', 'tomato soup'],
    'chicken': ['chicken', 'grilled chicken', 'fried chicken', 'chicken curry', 'roast chicken', 'chicken wings'],
    'fish': ['fish', 'salmon', 'tuna', 'seafood', 'grilled fish', 'fish curry', 'sushi'],
    'rice': ['rice', 'biryani', 'fried rice', 'pulao', 'risotto', 'rice bowl'],
    'indian': ['curry', 'dal', 'paneer', 'tandoori', 'masala', 'biriyani', 'naan', 'roti'],
    'breakfast': ['pancake', 'waffle', 'omelette', 'eggs', 'french toast', 'benedict', 'avocado toast'],
    'snacks': ['fries', 'nachos', 'chips', 'appetizer', 'starter', 'wings', 'onion rings']
}

SERVICE_KEYWORDS = {
    'speed': ['fast', 'quick', 'slow', 'delay', 'wait', 'prompt', 'efficient', 'rushed'],
    'quality': ['professional', 'unprofessional', 'courteous', 'rude', 'polite', 'friendly', 'helpful'],
    'attention': ['attentive', 'inattentive', 'caring', 'neglectful', 'responsive', 'ignored'],
    'accuracy': ['correct', 'wrong', 'mistake', 'accurate', 'error', 'mixed up']
}

AMBIANCE_KEYWORDS = {
    'atmosphere': ['cozy', 'comfortable', 'cramped', 'spacious', 'intimate', 'loud', 'quiet', 'peaceful'],
    'cleanliness': ['clean', 'dirty', 'hygienic', 'messy', 'spotless', 'filthy', 'sanitized'],
    'decor': ['beautiful', 'ugly', 'modern', 'outdated', 'stylish', 'tacky', 'elegant', 'shabby'],
    'lighting': ['bright', 'dim', 'romantic', 'harsh', 'ambient', 'dark']
}

VALUE_KEYWORDS = {
    'price': ['expensive', 'cheap', 'affordable', 'overpriced', 'reasonable', 'costly', 'budget', 'value'],
    'portion': ['large', 'small', 'huge', 'tiny', 'generous', 'skimpy', 'adequate', 'insufficient'],
    'quality_price': ['worth it', 'not worth', 'good value', 'poor value', 'bang for buck']
}

EMOTION_KEYWORDS = {
    'joy': ['happy', 'delighted', 'thrilled', 'excited', 'pleased', 'satisfied', 'amazing', 'wonderful'],
    'anger': ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'frustrated', 'outraged'],
    'sadness': ['sad', 'disappointed', 'upset', 'depressed', 'heartbroken', 'let down'],
    'surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow'],
    'disgust': ['disgusting', 'gross', 'revolting', 'nasty', 'awful', 'terrible', 'horrible'],
    'fear': ['worried', 'concerned', 'anxious', 'nervous', 'scared', 'afraid']
}

class AdvancedSentimentAnalyzer:
    """Advanced multi-model sentiment analysis system"""
    
    def __init__(self):
        self.vader = vader_analyzer
        self.transformer = sentiment_pipeline
        self.nlp = nlp
    
    def analyze_comprehensive(self, text):
        """Comprehensive sentiment analysis using multiple models"""
        if not text or len(text.strip()) < 3:
            return self._default_analysis()
        
        # Clean text
        cleaned_text = self._clean_text(text)
        
        # Multi-model analysis
        results = {
            'overall_sentiment': 'neutral',
            'overall_confidence': 0.5,
            'food_sentiment': 'neutral',
            'food_confidence': 0.5,
            'service_sentiment': 'neutral', 
            'service_confidence': 0.5,
            'ambiance_sentiment': 'neutral',
            'ambiance_confidence': 0.5,
            'value_sentiment': 'neutral',
            'value_confidence': 0.5,
            'emotion_detected': 'neutral',
            'urgency_level': 'low',
            'food_keywords': [],
            'service_keywords': [],
            'ambiance_keywords': [],
            'value_keywords': [],
            'mentioned_dishes': [],
            'mentioned_staff': [],
            'mentioned_issues': [],
            'mentioned_positives': []
        }
        
        # VADER analysis
        if self.vader:
            vader_scores = self.vader.polarity_scores(cleaned_text)
            results['overall_sentiment'] = self._vader_to_sentiment(vader_scores['compound'])
            results['overall_confidence'] = abs(vader_scores['compound'])
        
        # Transformer analysis (if available)
        if self.transformer:
            try:
                transformer_result = self.transformer(cleaned_text[:512])  # Limit text length
                if transformer_result:
                    tf_sentiment = transformer_result[0]['label'].lower()
                    tf_confidence = transformer_result[0]['score']
                    
                    # Map transformer labels to our format
                    if 'positive' in tf_sentiment or tf_sentiment == 'label_2':
                        results['overall_sentiment'] = 'positive'
                    elif 'negative' in tf_sentiment or tf_sentiment == 'label_0':
                        results['overall_sentiment'] = 'negative'
                    else:
                        results['overall_sentiment'] = 'neutral'
                    
                    results['overall_confidence'] = max(results['overall_confidence'], tf_confidence)
            except Exception as e:
                print(f"Transformer analysis error: {e}")
        
        # Category-specific analysis
        results.update(self._analyze_categories(cleaned_text))
        
        # Extract entities and keywords
        results.update(self._extract_entities(cleaned_text))
        
        # Detect emotions
        results['emotion_detected'] = self._detect_emotion(cleaned_text)
        
        # Determine urgency
        results['urgency_level'] = self._determine_urgency(cleaned_text, results['overall_sentiment'])
        
        return results
    
    def _clean_text(self, text):
        """Clean and preprocess text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?-]', '', text)
        return text
    
    def _vader_to_sentiment(self, compound_score):
        """Convert VADER compound score to sentiment label"""
        if compound_score >= 0.05:
            return 'positive'
        elif compound_score <= -0.05:
            return 'negative'
        else:
            return 'neutral'
    
    def _analyze_categories(self, text):
        """Analyze sentiment for specific categories"""
        text_lower = text.lower()
        results = {}
        
        # Food sentiment
        food_context = self._extract_context_around_keywords(text_lower, FOOD_KEYWORDS)
        if food_context:
            food_sentiment = self._analyze_context_sentiment(food_context)
            results['food_sentiment'] = food_sentiment['sentiment']
            results['food_confidence'] = food_sentiment['confidence']
            results['food_keywords'] = food_sentiment['keywords']
        
        # Service sentiment
        service_context = self._extract_context_around_keywords(text_lower, SERVICE_KEYWORDS)
        if service_context:
            service_sentiment = self._analyze_context_sentiment(service_context)
            results['service_sentiment'] = service_sentiment['sentiment']
            results['service_confidence'] = service_sentiment['confidence']
            results['service_keywords'] = service_sentiment['keywords']
        
        # Ambiance sentiment
        ambiance_context = self._extract_context_around_keywords(text_lower, AMBIANCE_KEYWORDS)
        if ambiance_context:
            ambiance_sentiment = self._analyze_context_sentiment(ambiance_context)
            results['ambiance_sentiment'] = ambiance_sentiment['sentiment']
            results['ambiance_confidence'] = ambiance_sentiment['confidence']
            results['ambiance_keywords'] = ambiance_sentiment['keywords']
        
        # Value sentiment
        value_context = self._extract_context_around_keywords(text_lower, VALUE_KEYWORDS)
        if value_context:
            value_sentiment = self._analyze_context_sentiment(value_context)
            results['value_sentiment'] = value_sentiment['sentiment']
            results['value_confidence'] = value_sentiment['confidence']
            results['value_keywords'] = value_sentiment['keywords']
        
        return results
    
    def _extract_context_around_keywords(self, text, keyword_dict):
        """Extract context around specific keywords"""
        contexts = []
        for category, keywords in keyword_dict.items():
            for keyword in keywords:
                if keyword in text:
                    # Find the keyword position and extract surrounding context
                    start = max(0, text.find(keyword) - 50)
                    end = min(len(text), text.find(keyword) + len(keyword) + 50)
                    context = text[start:end]
                    contexts.append({'context': context, 'keyword': keyword, 'category': category})
        return contexts
    
    def _analyze_context_sentiment(self, contexts):
        """Analyze sentiment of extracted contexts"""
        if not contexts:
            return {'sentiment': 'neutral', 'confidence': 0.5, 'keywords': []}
        
        sentiments = []
        keywords = []
        
        for ctx in contexts:
            if self.vader:
                scores = self.vader.polarity_scores(ctx['context'])
                sentiment = self._vader_to_sentiment(scores['compound'])
                confidence = abs(scores['compound'])
                sentiments.append({'sentiment': sentiment, 'confidence': confidence})
                keywords.append(ctx['keyword'])
        
        if not sentiments:
            return {'sentiment': 'neutral', 'confidence': 0.5, 'keywords': keywords}
        
        # Aggregate sentiments
        positive_count = sum(1 for s in sentiments if s['sentiment'] == 'positive')
        negative_count = sum(1 for s in sentiments if s['sentiment'] == 'negative')
        avg_confidence = sum(s['confidence'] for s in sentiments) / len(sentiments)
        
        if positive_count > negative_count:
            final_sentiment = 'positive'
        elif negative_count > positive_count:
            final_sentiment = 'negative'
        else:
            final_sentiment = 'neutral'
        
        return {
            'sentiment': final_sentiment,
            'confidence': min(avg_confidence, 0.95),
            'keywords': list(set(keywords))
        }
    
    def _extract_entities(self, text):
        """Extract mentioned entities using NLP"""
        results = {
            'mentioned_dishes': [],
            'mentioned_staff': [],
            'mentioned_issues': [],
            'mentioned_positives': []
        }
        
        text_lower = text.lower()
        
        # Extract dishes
        for category, dishes in FOOD_KEYWORDS.items():
            for dish in dishes:
                if dish in text_lower:
                    results['mentioned_dishes'].append(dish)
        
        # Extract staff mentions
        staff_terms = ['waiter', 'waitress', 'server', 'staff', 'manager', 'chef', 'bartender', 'host']
        for term in staff_terms:
            if term in text_lower:
                results['mentioned_staff'].append(term)
        
        # Extract issues (negative keywords)
        issue_terms = ['slow', 'rude', 'cold', 'dirty', 'expensive', 'bad', 'terrible', 'awful', 'horrible']
        for term in issue_terms:
            if term in text_lower:
                results['mentioned_issues'].append(term)
        
        # Extract positives
        positive_terms = ['excellent', 'amazing', 'great', 'wonderful', 'fantastic', 'delicious', 'perfect', 'outstanding']
        for term in positive_terms:
            if term in text_lower:
                results['mentioned_positives'].append(term)
        
        # Remove duplicates
        for key in results:
            results[key] = list(set(results[key]))
        
        return results
    
    def _detect_emotion(self, text):
        """Detect primary emotion in text"""
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in EMOTION_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        if emotion_scores:
            return max(emotion_scores, key=emotion_scores.get)
        return 'neutral'
    
    def _determine_urgency(self, text, sentiment):
        """Determine urgency level based on content and sentiment"""
        text_lower = text.lower()
        
        # High urgency indicators
        high_urgency_terms = ['terrible', 'horrible', 'disgusting', 'never again', 'worst', 'awful', 'unacceptable']
        medium_urgency_terms = ['disappointed', 'bad', 'poor', 'not good', 'unsatisfied']
        
        if sentiment == 'negative':
            if any(term in text_lower for term in high_urgency_terms):
                return 'critical'
            elif any(term in text_lower for term in medium_urgency_terms):
                return 'high'
            else:
                return 'medium'
        
        return 'low'
    
    def _default_analysis(self):
        """Return default analysis for empty/invalid text"""
        return {
            'overall_sentiment': 'neutral',
            'overall_confidence': 0.5,
            'food_sentiment': 'neutral',
            'food_confidence': 0.5,
            'service_sentiment': 'neutral',
            'service_confidence': 0.5,
            'ambiance_sentiment': 'neutral',
            'ambiance_confidence': 0.5,
            'value_sentiment': 'neutral',
            'value_confidence': 0.5,
            'emotion_detected': 'neutral',
            'urgency_level': 'low',
            'food_keywords': [],
            'service_keywords': [],
            'ambiance_keywords': [],
            'value_keywords': [],
            'mentioned_dishes': [],
            'mentioned_staff': [],
            'mentioned_issues': [],
            'mentioned_positives': []
        }

# Initialize the advanced analyzer
analyzer = AdvancedSentimentAnalyzer()
print("✅ Advanced Sentiment Analyzer initialized")
class GoogleMapsReviewScraper:
    """Advanced Google Maps review scraper using Playwright"""
    
    def __init__(self):
        self.max_reviews = 50
        self.delay_between_requests = 2
    
    async def scrape_reviews(self, google_maps_url):
        """Scrape reviews from Google Maps URL"""
        reviews = []
        
        try:
            print(f"🔍 Navigating to: {google_maps_url}")
            print("📊 Scraping Progress:")
            print("   ├── Loading page...")
            
            async with async_playwright() as p:
                # Launch browser
                browser = await p.chromium.launch(
                    headless=True,
                    args=['--no-sandbox', '--disable-dev-shm-usage']
                )
                
                context = await browser.new_context(
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                )
                
                page = await context.new_page()
                
                print("   ├── Page loaded, waiting for content...")
                await page.goto(google_maps_url, wait_until='networkidle')
                await page.wait_for_timeout(3000)
                
                # Try to find and click reviews tab
                try:
                    reviews_button = page.locator('button:has-text("Reviews")')
                    if await reviews_button.count() > 0:
                        print("   ├── Found reviews button, clicking...")
                        await reviews_button.first.click()
                        await page.wait_for_timeout(2000)
                    else:
                        print("   ├── No reviews button found, proceeding...")
                except:
                    print("   ├── Reviews button interaction failed, continuing...")
                
                # Scroll to load more reviews
                print("   ├── Scrolling to load more reviews...")
                for i in range(5):
                    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                    await page.wait_for_timeout(2000)
                    print(f"   │   └── Scroll {i+1}/5 completed")
                
                # Extract reviews using multiple selectors
                print("   ├── Extracting review elements...")
                review_selectors = [
                    '[data-review-id]',
                    '.jftiEf',
                    '.MyEned',
                    '.wiI7pd',
                    '.fontBodyMedium'
                ]
                
                review_elements = []
                for selector in review_selectors:
                    elements = await page.locator(selector).all()
                    if elements:
                        review_elements = elements
                        print(f"   │   └── Found {len(elements)} elements with selector: {selector}")
                        break
                
                print(f"   ├── Processing {len(review_elements)} review elements...")
                
                # Extract review data
                processed_texts = set()
                
                for i, element in enumerate(review_elements[:self.max_reviews]):
                    try:
                        # Get review text
                        review_text = await element.text_content()
                        if not review_text or len(review_text.strip()) < 20:
                            continue
                        
                        # Clean and validate text
                        cleaned_text = self._clean_review_text(review_text)
                        if not cleaned_text or cleaned_text in processed_texts:
                            continue
                        
                        processed_texts.add(cleaned_text)
                        
                        # Try to extract rating
                        rating = await self._extract_rating(element)
                        
                        # Try to extract reviewer name
                        reviewer_name = await self._extract_reviewer_name(element)
                        
                        # Try to extract date
                        review_date = await self._extract_review_date(element)
                        
                        # Perform comprehensive sentiment analysis
                        print(f"   │   ├── Analyzing review {i+1}: {cleaned_text[:50]}...")
                        analysis = analyzer.analyze_comprehensive(cleaned_text)
                        
                        review_data = {
                            'text': cleaned_text,
                            'rating': rating,
                            'reviewer_name': reviewer_name,
                            'review_date': review_date,
                            'source': 'google_maps',
                            'scraped_at': datetime.now().isoformat(),
                            'analysis': analysis
                        }
                        
                        reviews.append(review_data)
                        
                        # Log analysis results
                        print(f"   │   │   └── Sentiment: {analysis.get('overall_sentiment')} ({analysis.get('overall_confidence', 0):.2f})")
                        if analysis.get('mentioned_dishes'):
                            print(f"   │   │       Dishes: {', '.join(analysis.get('mentioned_dishes', [])[:3])}")
                        
                    except Exception as e:
                        print(f"   │   ├── Error processing review {i+1}: {e}")
                        continue
                
                await browser.close()
                print(f"   └── ✅ Scraping completed: {len(reviews)} reviews processed")
                
        except Exception as e:
            print(f"❌ Scraping error: {e}")
            return self._generate_fallback_reviews()
        
        print(f"✅ Successfully scraped {len(reviews)} reviews")
        return reviews
    
    def _clean_review_text(self, text):
        """Clean review text"""
        if not text:
            return ""
        
        # Remove extra whitespace and newlines
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Remove very short texts
        if len(text) < 20:
            return ""
        
        # Remove common UI elements
        ui_elements = ['More', 'Less', 'Helpful', 'Share', 'Flag', 'Report']
        for element in ui_elements:
            text = text.replace(element, '')
        
        return text.strip()
    
    async def _extract_rating(self, element):
        """Extract rating from review element"""
        try:
            # Try different rating selectors
            rating_selectors = [
                '[aria-label*="star"]',
                '.kvMYJc',
                '[role="img"][aria-label*="star"]'
            ]
            
            for selector in rating_selectors:
                rating_element = element.locator(selector).first
                if await rating_element.count() > 0:
                    aria_label = await rating_element.get_attribute('aria-label')
                    if aria_label:
                        # Extract number from aria-label like "5 stars" or "Rated 4 out of 5 stars"
                        rating_match = re.search(r'(\d+)', aria_label)
                        if rating_match:
                            return int(rating_match.group(1))
            
            return None
        except:
            return None
    
    async def _extract_reviewer_name(self, element):
        """Extract reviewer name"""
        try:
            name_selectors = [
                '.d4r55',
                '.YBMVLf',
                '[data-value="Local Guide"]'
            ]
            
            for selector in name_selectors:
                name_element = element.locator(selector).first
                if await name_element.count() > 0:
                    name = await name_element.text_content()
                    if name and len(name.strip()) > 0:
                        return name.strip()
            
            return "Anonymous"
        except:
            return "Anonymous"
    
    async def _extract_review_date(self, element):
        """Extract review date"""
        try:
            date_selectors = [
                '.rsqaWe',
                '.DU9Pgb',
                'span:has-text("ago")'
            ]
            
            for selector in date_selectors:
                date_element = element.locator(selector).first
                if await date_element.count() > 0:
                    date_text = await date_element.text_content()
                    if date_text:
                        # Parse relative dates like "2 weeks ago", "1 month ago"
                        return self._parse_relative_date(date_text)
            
            return datetime.now().isoformat()
        except:
            return datetime.now().isoformat()
    
    def _parse_relative_date(self, date_text):
        """Parse relative date strings"""
        try:
            now = datetime.now()
            date_text = date_text.lower()
            
            if 'day' in date_text:
                days = int(re.search(r'(\d+)', date_text).group(1))
                return (now - timedelta(days=days)).isoformat()
            elif 'week' in date_text:
                weeks = int(re.search(r'(\d+)', date_text).group(1))
                return (now - timedelta(weeks=weeks)).isoformat()
            elif 'month' in date_text:
                months = int(re.search(r'(\d+)', date_text).group(1))
                return (now - timedelta(days=months*30)).isoformat()
            elif 'year' in date_text:
                years = int(re.search(r'(\d+)', date_text).group(1))
                return (now - timedelta(days=years*365)).isoformat()
            
            return now.isoformat()
        except:
            return datetime.now().isoformat()
    
    def _generate_fallback_reviews(self):
        """Generate fallback reviews for testing"""
        fallback_reviews = [
            {
                'text': 'Amazing coffee and croissants at The French Door! The barista was very skilled and the atmosphere is perfect for work. Highly recommend their signature latte.',
                'rating': 5,
                'reviewer_name': 'Sarah M.',
                'review_date': (datetime.now() - timedelta(days=2)).isoformat(),
                'source': 'google_maps',
                'scraped_at': datetime.now().isoformat(),
                'analysis': analyzer.analyze_comprehensive('Amazing coffee and croissants at The French Door! The barista was very skilled and the atmosphere is perfect for work. Highly recommend their signature latte.')
            },
            {
                'text': 'Food was decent but service was extremely slow. Waited 45 minutes for a simple sandwich. Staff seemed overwhelmed and not well organized.',
                'rating': 2,
                'reviewer_name': 'John D.',
                'review_date': (datetime.now() - timedelta(days=5)).isoformat(),
                'source': 'google_maps',
                'scraped_at': datetime.now().isoformat(),
                'analysis': analyzer.analyze_comprehensive('Food was decent but service was extremely slow. Waited 45 minutes for a simple sandwich. Staff seemed overwhelmed and not well organized.')
            },
            {
                'text': 'Great ambiance and the pasta was delicious. Prices are reasonable for the quality. Will definitely come back with friends.',
                'rating': 4,
                'reviewer_name': 'Emily R.',
                'review_date': (datetime.now() - timedelta(days=1)).isoformat(),
                'source': 'google_maps',
                'scraped_at': datetime.now().isoformat(),
                'analysis': analyzer.analyze_comprehensive('Great ambiance and the pasta was delicious. Prices are reasonable for the quality. Will definitely come back with friends.')
            }
        ]
        
        return fallback_reviews

# Initialize scraper
scraper = GoogleMapsReviewScraper()
print("✅ Google Maps scraper initialized")

def save_reviews_to_db(reviews, restaurant_name, place_id=None):
    """Save scraped reviews to Neon database"""
    print(f"\n💾 Saving {len(reviews)} reviews to database...")
    print(f"   Restaurant: {restaurant_name}")
    
    conn = get_db_connection()
    if not conn:
        print("❌ Could not connect to database")
        return False
    
    try:
        cursor = conn.cursor()
        saved_count = 0
        
        for i, review in enumerate(reviews):
            analysis = review.get('analysis', {})
            
            print(f"   ├── Saving review {i+1}/{len(reviews)}: {review.get('text', '')[:30]}...")
            
            # Insert review
            cursor.execute("""
                INSERT INTO reviews (
                    restaurant_name, restaurant_place_id, reviewer_name, 
                    rating, review_text, review_date, scraped_at, source
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                restaurant_name,
                place_id,
                review.get('reviewer_name', 'Anonymous'),
                review.get('rating'),
                review.get('text'),
                review.get('review_date'),
                review.get('scraped_at'),
                review.get('source', 'google_maps')
            ))
            
            review_id = cursor.fetchone()['id']
            
            # Insert sentiment analysis
            cursor.execute("""
                INSERT INTO sentiment_analysis (
                    review_id, overall_sentiment, overall_confidence,
                    food_sentiment, food_confidence, food_keywords,
                    service_sentiment, service_confidence, service_keywords,
                    ambiance_sentiment, ambiance_confidence, ambiance_keywords,
                    value_sentiment, value_confidence, value_keywords,
                    emotion_detected, urgency_level,
                    mentioned_dishes, mentioned_staff, mentioned_issues, mentioned_positives,
                    model_version
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                review_id,
                analysis.get('overall_sentiment', 'neutral'),
                analysis.get('overall_confidence', 0.5),
                analysis.get('food_sentiment', 'neutral'),
                analysis.get('food_confidence', 0.5),
                analysis.get('food_keywords', []),
                analysis.get('service_sentiment', 'neutral'),
                analysis.get('service_confidence', 0.5),
                analysis.get('service_keywords', []),
                analysis.get('ambiance_sentiment', 'neutral'),
                analysis.get('ambiance_confidence', 0.5),
                analysis.get('ambiance_keywords', []),
                analysis.get('value_sentiment', 'neutral'),
                analysis.get('value_confidence', 0.5),
                analysis.get('value_keywords', []),
                analysis.get('emotion_detected', 'neutral'),
                analysis.get('urgency_level', 'low'),
                analysis.get('mentioned_dishes', []),
                analysis.get('mentioned_staff', []),
                analysis.get('mentioned_issues', []),
                analysis.get('mentioned_positives', []),
                os.getenv('ML_MODEL_VERSION', 'v2.0')
            ))
            
            saved_count += 1
            print(f"   │   └── ✅ Saved with ID: {review_id}")
        
        conn.commit()
        print(f"   └── ✅ Successfully saved {saved_count} reviews to database")
        return True
        
    except Exception as e:
        print(f"   └── ❌ Database save error: {e}")
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()

def get_reviews_from_db(restaurant_name, limit=100):
    """Get reviews from database"""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.*, sa.* FROM reviews r
            LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
            WHERE r.restaurant_name = %s
            ORDER BY r.scraped_at DESC
            LIMIT %s
        """, (restaurant_name, limit))
        
        results = cursor.fetchall()
        return [dict(row) for row in results]
        
    except Exception as e:
        print(f"❌ Database read error: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

def generate_insights_and_recommendations(reviews):
    """Generate actionable insights and recommendations"""
    if not reviews:
        return {}
    
    insights = {
        'summary': {},
        'trending_dishes': [],
        'service_issues': [],
        'staff_performance': {},
        'recommendations': []
    }
    
    # Summary statistics
    total_reviews = len(reviews)
    positive_reviews = len([r for r in reviews if r.get('overall_sentiment') == 'positive'])
    negative_reviews = len([r for r in reviews if r.get('overall_sentiment') == 'negative'])
    
    insights['summary'] = {
        'total_reviews': total_reviews,
        'positive_percentage': round((positive_reviews / total_reviews) * 100, 1),
        'negative_percentage': round((negative_reviews / total_reviews) * 100, 1),
        'average_rating': round(sum(r.get('rating', 3) for r in reviews if r.get('rating')) / len([r for r in reviews if r.get('rating')]), 1)
    }
    
    # Trending dishes analysis
    dish_mentions = {}
    for review in reviews:
        dishes = review.get('mentioned_dishes', [])
        for dish in dishes:
            if dish not in dish_mentions:
                dish_mentions[dish] = {'count': 0, 'positive': 0, 'negative': 0}
            dish_mentions[dish]['count'] += 1
            if review.get('food_sentiment') == 'positive':
                dish_mentions[dish]['positive'] += 1
            elif review.get('food_sentiment') == 'negative':
                dish_mentions[dish]['negative'] += 1
    
    # Sort by popularity and sentiment
    trending_dishes = []
    for dish, data in dish_mentions.items():
        if data['count'] >= 2:  # Only include dishes mentioned multiple times
            sentiment_score = (data['positive'] - data['negative']) / data['count']
            trending_dishes.append({
                'dish': dish,
                'mentions': data['count'],
                'sentiment_score': round(sentiment_score, 2),
                'recommendation': 'promote' if sentiment_score > 0.3 else 'improve' if sentiment_score < -0.3 else 'maintain'
            })
    
    insights['trending_dishes'] = sorted(trending_dishes, key=lambda x: x['mentions'], reverse=True)[:10]
    
    # Service issues analysis
    service_issues = []
    for review in reviews:
        if review.get('service_sentiment') == 'negative' and review.get('urgency_level') in ['high', 'critical']:
            issues = review.get('mentioned_issues', [])
            service_issues.extend(issues)
    
    # Count and prioritize issues
    issue_counts = {}
    for issue in service_issues:
        issue_counts[issue] = issue_counts.get(issue, 0) + 1
    
    insights['service_issues'] = [
        {'issue': issue, 'frequency': count, 'priority': 'high' if count >= 3 else 'medium'}
        for issue, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]
    
    # Generate recommendations
    recommendations = []
    
    # Menu recommendations
    for dish in insights['trending_dishes'][:3]:
        if dish['recommendation'] == 'promote':
            recommendations.append({
                'type': 'menu_promotion',
                'priority': 'medium',
                'title': f"Promote {dish['dish']}",
                'description': f"This dish has {dish['mentions']} positive mentions. Consider featuring it prominently.",
                'expected_impact': 'Increased sales and customer satisfaction'
            })
        elif dish['recommendation'] == 'improve':
            recommendations.append({
                'type': 'menu_improvement',
                'priority': 'high',
                'title': f"Improve {dish['dish']}",
                'description': f"This dish has negative feedback. Review recipe and preparation.",
                'expected_impact': 'Reduced complaints and improved ratings'
            })
    
    # Service recommendations
    for issue in insights['service_issues'][:2]:
        recommendations.append({
            'type': 'service_improvement',
            'priority': issue['priority'],
            'title': f"Address {issue['issue']} Issues",
            'description': f"This issue was mentioned {issue['frequency']} times. Implement staff training.",
            'expected_impact': 'Improved service ratings and customer experience'
        })
    
    insights['recommendations'] = recommendations
    
    return insights
# API Routes
@app.route('/scrape-reviews', methods=['POST'])
async def scrape_reviews_endpoint():
    """Enhanced review scraping endpoint"""
    data = request.json
    google_url = data.get('google_url', '')
    restaurant_name = data.get('restaurant_name', 'Unknown Restaurant')
    
    if not google_url:
        return jsonify({'error': 'Google Maps URL is required'}), 400
    
    try:
        print(f"🚀 Starting enhanced scraping for: {restaurant_name}")
        
        # Scrape reviews
        reviews = await scraper.scrape_reviews(google_url)
        
        if not reviews:
            return jsonify({'error': 'No reviews found'}), 404
        
        # Save to database
        place_id = data.get('place_id')
        save_success = save_reviews_to_db(reviews, restaurant_name, place_id)
        
        # Generate insights
        insights = generate_insights_and_recommendations(reviews)
        
        # Prepare response
        response = {
            'status': 'success',
            'restaurant_name': restaurant_name,
            'reviews_scraped': len(reviews),
            'database_saved': save_success,
            'reviews': reviews,
            'insights': insights,
            'timestamp': datetime.now().isoformat()
        }
        
        print(f"✅ Scraping completed: {len(reviews)} reviews processed")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Scraping error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment_endpoint():
    """Advanced sentiment analysis endpoint"""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'Text is required'}), 400
    
    try:
        analysis = analyzer.analyze_comprehensive(text)
        return jsonify({
            'status': 'success',
            'text': text,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/restaurant-analytics/<restaurant_name>', methods=['GET'])
def get_restaurant_analytics(restaurant_name):
    """Get comprehensive analytics for a restaurant"""
    try:
        # Get reviews from database
        reviews = get_reviews_from_db(restaurant_name)
        
        if not reviews:
            return jsonify({'error': 'No reviews found for this restaurant'}), 404
        
        # Generate comprehensive analytics
        analytics = {
            'restaurant_name': restaurant_name,
            'total_reviews': len(reviews),
            'date_range': {
                'from': min(r.get('review_date', '') for r in reviews if r.get('review_date')),
                'to': max(r.get('review_date', '') for r in reviews if r.get('review_date'))
            }
        }
        
        # Sentiment breakdown
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        category_sentiments = {
            'food': {'positive': 0, 'negative': 0, 'neutral': 0},
            'service': {'positive': 0, 'negative': 0, 'neutral': 0},
            'ambiance': {'positive': 0, 'negative': 0, 'neutral': 0},
            'value': {'positive': 0, 'negative': 0, 'neutral': 0}
        }
        
        for review in reviews:
            # Overall sentiment
            overall_sentiment = review.get('overall_sentiment', 'neutral')
            sentiment_counts[overall_sentiment] += 1
            
            # Category sentiments
            for category in category_sentiments:
                cat_sentiment = review.get(f'{category}_sentiment', 'neutral')
                category_sentiments[category][cat_sentiment] += 1
        
        analytics['sentiment_breakdown'] = sentiment_counts
        analytics['category_analysis'] = category_sentiments
        
        # Generate insights and recommendations
        insights = generate_insights_and_recommendations(reviews)
        analytics['insights'] = insights
        
        return jsonify(analytics)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/trending-analysis', methods=['GET'])
def get_trending_analysis():
    """Get trending dishes and insights across all restaurants"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Get trending dishes from last 30 days
        cursor.execute("""
            SELECT 
                unnest(mentioned_dishes) as dish,
                COUNT(*) as mentions,
                AVG(CASE WHEN food_sentiment = 'positive' THEN 1 
                         WHEN food_sentiment = 'negative' THEN -1 
                         ELSE 0 END) as sentiment_score
            FROM sentiment_analysis sa
            JOIN reviews r ON sa.review_id = r.id
            WHERE r.review_date >= NOW() - INTERVAL '30 days'
            AND array_length(mentioned_dishes, 1) > 0
            GROUP BY dish
            HAVING COUNT(*) >= 2
            ORDER BY mentions DESC, sentiment_score DESC
            LIMIT 20
        """)
        
        trending_dishes = []
        for row in cursor.fetchall():
            trending_dishes.append({
                'dish': row['dish'],
                'mentions': row['mentions'],
                'sentiment_score': float(row['sentiment_score']) if row['sentiment_score'] else 0,
                'trend_status': 'rising' if row['sentiment_score'] > 0.3 else 'declining' if row['sentiment_score'] < -0.3 else 'stable'
            })
        
        # Get common issues
        cursor.execute("""
            SELECT 
                unnest(mentioned_issues) as issue,
                COUNT(*) as frequency,
                AVG(CASE WHEN urgency_level = 'critical' THEN 4
                         WHEN urgency_level = 'high' THEN 3
                         WHEN urgency_level = 'medium' THEN 2
                         ELSE 1 END) as avg_urgency
            FROM sentiment_analysis sa
            JOIN reviews r ON sa.review_id = r.id
            WHERE r.review_date >= NOW() - INTERVAL '30 days'
            AND array_length(mentioned_issues, 1) > 0
            GROUP BY issue
            ORDER BY frequency DESC, avg_urgency DESC
            LIMIT 10
        """)
        
        common_issues = []
        for row in cursor.fetchall():
            common_issues.append({
                'issue': row['issue'],
                'frequency': row['frequency'],
                'avg_urgency': float(row['avg_urgency']) if row['avg_urgency'] else 1,
                'priority': 'high' if row['frequency'] >= 5 else 'medium'
            })
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'trending_dishes': trending_dishes,
            'common_issues': common_issues,
            'analysis_date': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-recommendations/<restaurant_name>', methods=['GET'])
def generate_recommendations_endpoint(restaurant_name):
    """Generate AI-powered recommendations for a restaurant"""
    try:
        reviews = get_reviews_from_db(restaurant_name)
        
        if not reviews:
            return jsonify({'error': 'No reviews found for recommendations'}), 404
        
        insights = generate_insights_and_recommendations(reviews)
        
        # Enhanced recommendations with more detail
        enhanced_recommendations = []
        
        for rec in insights.get('recommendations', []):
            enhanced_rec = rec.copy()
            enhanced_rec['implementation_steps'] = []
            enhanced_rec['estimated_cost'] = 'Low'
            enhanced_rec['timeline'] = '1-2 weeks'
            
            if rec['type'] == 'menu_promotion':
                enhanced_rec['implementation_steps'] = [
                    'Update menu design to highlight the dish',
                    'Train staff on dish recommendations',
                    'Create social media content featuring the dish',
                    'Consider offering limited-time promotions'
                ]
                enhanced_rec['estimated_cost'] = 'Low'
                
            elif rec['type'] == 'menu_improvement':
                enhanced_rec['implementation_steps'] = [
                    'Review current recipe and preparation methods',
                    'Gather feedback from kitchen staff',
                    'Test recipe modifications',
                    'Retrain kitchen staff on new preparation',
                    'Monitor customer feedback after changes'
                ]
                enhanced_rec['estimated_cost'] = 'Medium'
                enhanced_rec['timeline'] = '2-4 weeks'
                
            elif rec['type'] == 'service_improvement':
                enhanced_rec['implementation_steps'] = [
                    'Identify specific service pain points',
                    'Develop targeted training materials',
                    'Conduct staff training sessions',
                    'Implement service monitoring system',
                    'Regular follow-up and feedback collection'
                ]
                enhanced_rec['estimated_cost'] = 'Medium'
                enhanced_rec['timeline'] = '3-6 weeks'
            
            enhanced_recommendations.append(enhanced_rec)
        
        return jsonify({
            'restaurant_name': restaurant_name,
            'recommendations': enhanced_recommendations,
            'insights_summary': insights['summary'],
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check endpoint"""
    try:
        # Test database connection
        conn = get_db_connection()
        db_status = 'connected' if conn else 'disconnected'
        if conn:
            conn.close()
        
        # Test ML models
        ml_status = {
            'vader_analyzer': 'loaded' if vader_analyzer else 'not_loaded',
            'transformer_model': 'loaded' if sentiment_pipeline else 'not_loaded',
            'spacy_nlp': 'loaded' if nlp else 'not_loaded'
        }
        
        return jsonify({
            'status': 'healthy',
            'service': 'SIKBO Advanced ML Service',
            'version': '2.0',
            'database': db_status,
            'ml_models': ml_status,
            'features': [
                'Advanced multi-model sentiment analysis',
                'Google Maps review scraping with Playwright',
                'Multi-category sentiment classification (Food/Service/Ambiance/Value)',
                'Emotion detection and urgency assessment',
                'Entity extraction (dishes, staff, issues)',
                'PostgreSQL/Neon database integration',
                'AI-powered insights and recommendations',
                'Real-time analytics and trending analysis'
            ],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Test endpoint for the specific Google Maps URL
@app.route('/test-french-door', methods=['POST'])
async def test_french_door_scraping():
    """Test endpoint for The French Door restaurant"""
    try:
        google_url = "https://www.google.com/maps/place/the+french+door/data=!4m2!3m1!1s0x3ba858e21d3824df:0xa655a004c3bfacd0?sa=X&ved=1t:242&ictx=111"
        restaurant_name = "The French Door"
        
        print(f"🧪 Testing scraping for: {restaurant_name}")
        
        # Scrape reviews
        reviews = await scraper.scrape_reviews(google_url)
        
        # Save to database
        save_success = save_reviews_to_db(reviews, restaurant_name)
        
        # Generate insights
        insights = generate_insights_and_recommendations(reviews)
        
        return jsonify({
            'status': 'success',
            'restaurant_name': restaurant_name,
            'reviews_found': len(reviews),
            'database_saved': save_success,
            'sample_reviews': reviews[:3],  # Show first 3 reviews
            'insights': insights,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 SIKBO Advanced ML Service Starting...")
    print("🔧 Features:")
    print("   • Advanced Multi-Model Sentiment Analysis")
    print("   • Google Maps Review Scraping")
    print("   • Multi-Category Analysis (Food/Service/Ambiance/Value)")
    print("   • Emotion Detection & Urgency Assessment")
    print("   • PostgreSQL/Neon Database Integration")
    print("   • AI-Powered Insights & Recommendations")
    print("   • Real-time Analytics")
    print("")
    print("🌐 Endpoints:")
    print("   • POST /scrape-reviews - Scrape and analyze reviews")
    print("   • POST /analyze-sentiment - Analyze text sentiment")
    print("   • GET /restaurant-analytics/<name> - Get restaurant analytics")
    print("   • GET /trending-analysis - Get trending insights")
    print("   • GET /generate-recommendations/<name> - Get AI recommendations")
    print("   • POST /test-french-door - Test French Door scraping")
    print("   • GET /health - Health check")
    print("")

if __name__ == '__main__':
    print("🚀 SIKBO Advanced ML Service Starting...")
    print("🔧 Features:")
    print("   • Multi-category sentiment analysis")
    print("   • Service quality analysis")
    print("   • Staff performance tracking")
    print("   • Raw material cost calculation")
    print("   • Menu optimization recommendations")
    print("   • Customer flow analysis")
    print("   • Review action generation")
    print("")
    print("📡 Available Endpoints:")
    print("   • POST /scrape-reviews - Scrape and analyze reviews")
    print("   • POST /analyze-sentiment - Analyze text sentiment")
    print("   • GET /restaurant-analytics/<name> - Get restaurant analytics")
    print("   • GET /trending-analysis - Get trending insights")
    print("   • GET /generate-recommendations/<name> - Get AI recommendations")
    print("   • POST /test-french-door - Test French Door scraping")
    print("   • GET /health - Health check")
    print("")
    
    app.run(host='0.0.0.0', port=8001, debug=True)

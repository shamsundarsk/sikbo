from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import re
import asyncio
import os

app = Flask(__name__)

# Initialize ML models
sentiment_model = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=1000, stop_words='english')),
    ('classifier', LogisticRegression())
])

# Load training data from CSV
def load_training_data():
    try:
        df = pd.read_csv('data/restaurant_reviews.csv')
        return df['review'].tolist(), df['sentiment'].tolist()
    except FileNotFoundError:
        # Fallback to sample data if CSV not found
        sample_reviews = [
            ("Amazing food, loved it!", "positive"),
            ("Terrible service, bad taste", "negative"),
            ("Average food, nothing special", "neutral"),
            ("Excellent coffee, great ambiance", "positive"),
            ("Cold food, disappointing", "negative"),
            ("Good value for money", "positive"),
            ("Not worth the price", "negative"),
            ("Decent place to eat", "neutral")
        ]
        return [review[0] for review in sample_reviews], [review[1] for review in sample_reviews]

# Train the model
X_train, y_train = load_training_data()
sentiment_model.fit(X_train, y_train)
print(f"Model trained on {len(X_train)} reviews")

# Dish mapping dictionary
DISH_KEYWORDS = {
    'coffee': ['coffee', 'cappuccino', 'latte', 'espresso'],
    'burger': ['burger', 'sandwich'],
    'pizza': ['pizza', 'margherita'],
    'pasta': ['pasta', 'spaghetti', 'noodles'],
    'dessert': ['cake', 'ice cream', 'dessert', 'sweet'],
    'salad': ['salad', 'healthy', 'green'],
    'tea': ['tea', 'chai'],
    'juice': ['juice', 'smoothie', 'fresh']
}

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

async def scrape_google_reviews(place_url):
    """Mock Google Maps reviews for demo"""
    # Mock review data since Playwright has compatibility issues
    mock_reviews = [
        {
            'text': 'Amazing cold coffee! Best in the city. Great ambiance and friendly staff.',
            'sentiment': 'positive',
            'dish': 'Coffee',
            'source': 'google'
        },
        {
            'text': 'The burger was terrible, cold and tasteless. Very disappointed.',
            'sentiment': 'negative', 
            'dish': 'Burger',
            'source': 'google'
        },
        {
            'text': 'Pizza was okay, nothing special but decent for the price.',
            'sentiment': 'neutral',
            'dish': 'Pizza', 
            'source': 'google'
        },
        {
            'text': 'Excellent pasta! The sauce was perfect and portion was good.',
            'sentiment': 'positive',
            'dish': 'Pasta',
            'source': 'google'
        },
        {
            'text': 'Dessert was too sweet, not worth the money.',
            'sentiment': 'negative',
            'dish': 'Dessert',
            'source': 'google'
        }
    ]
    
    # Analyze sentiment for each mock review
    for review in mock_reviews:
        review['sentiment'] = analyze_sentiment(review['text'])
    
    return mock_reviews

def scrape_instagram_trends(hashtags=['cafefood', 'dessert', 'trending']):
    """Scrape Instagram for trending dishes - Mock data for demo"""
    # Mock trending data since snscrape can be unreliable
    mock_trends = [
        {'dish': 'Coffee', 'count': 45, 'source': 'instagram'},
        {'dish': 'Burger', 'count': 38, 'source': 'instagram'},
        {'dish': 'Pizza', 'count': 32, 'source': 'instagram'},
        {'dish': 'Dessert', 'count': 28, 'source': 'instagram'},
        {'dish': 'Pasta', 'count': 25, 'source': 'instagram'},
        {'dish': 'Salad', 'count': 22, 'source': 'instagram'},
        {'dish': 'Tea', 'count': 18, 'source': 'instagram'},
        {'dish': 'Juice', 'count': 15, 'source': 'instagram'}
    ]
    
    return mock_trends

@app.route('/scrape', methods=['POST'])
def scrape_data():
    """Main scraping endpoint"""
    data = request.json
    google_url = data.get('google_url', '')
    
    result = {
        'reviews': [],
        'trends': [],
        'status': 'success'
    }
    
    try:
        # Scrape Google reviews if URL provided
        if google_url:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            reviews = loop.run_until_complete(scrape_google_reviews(google_url))
            result['reviews'] = reviews
            loop.close()
        
        # Scrape Instagram trends
        trends = scrape_instagram_trends()
        result['trends'] = trends
        
    except Exception as e:
        result['status'] = 'error'
        result['message'] = str(e)
    
    return jsonify(result)

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """Analyze sentiment of provided text"""
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    sentiment = analyze_sentiment(text)
    dish = map_text_to_dish(text)
    
    return jsonify({
        'text': text,
        'sentiment': sentiment,
        'dish': dish
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'SIKBO ML Service'})

if __name__ == '__main__':
    print("SIKBO ML Service starting...")
    app.run(host='0.0.0.0', port=8001, debug=True)
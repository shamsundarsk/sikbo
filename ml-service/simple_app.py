#!/usr/bin/env python3
"""
Simple ML Service for SIKBO - Works with Real Review Data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import nltk
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re
import json
from datetime import datetime, timedelta
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Initialize sentiment analyzer
print("🚀 Loading SIKBO ML Service with REAL review data...")
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('vader_lexicon', quiet=True)
except:
    print("NLTK download skipped - using cached data")

vader_analyzer = SentimentIntensityAnalyzer()

# Initialize ML models
sentiment_model = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
    ('classifier', LogisticRegression())
])

category_model = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=5000, stop_words='english')),
    ('classifier', LogisticRegression())
])

print("✅ ML models initialized")

def load_real_review_data():
    """Load the real review data from CSV"""
    try:
        csv_path = "data/restaurant_reviews.csv"
        df = pd.read_csv(csv_path)
        
        print(f"📊 Loaded {len(df)} REAL reviews from {csv_path}")
        
        reviews = df['review'].tolist()
        sentiments = df['sentiment'].tolist()
        dishes = df['dish'].tolist()
        
        return reviews, sentiments, dishes
    except Exception as e:
        print(f"❌ Error loading real review data: {e}")
        return [], [], []

# Load and train models with real data
print("🎯 Training models with REAL review data...")
X_train, y_sentiment, y_category = load_real_review_data()

if X_train:
    sentiment_model.fit(X_train, y_sentiment)
    category_model.fit(X_train, y_category)
    print(f"✅ Models trained on {len(X_train)} REAL reviews")
else:
    print("❌ No training data available")

def analyze_sentiment_advanced(text):
    """Advanced sentiment analysis"""
    try:
        # Use trained model
        ml_sentiment = sentiment_model.predict([text])[0]
        
        # Use VADER for confidence
        vader_scores = vader_analyzer.polarity_scores(text)
        confidence = abs(vader_scores['compound'])
        
        return {
            'sentiment': ml_sentiment,
            'confidence': confidence,
            'vader_scores': vader_scores
        }
    except Exception as e:
        # Fallback to VADER only
        vader_scores = vader_analyzer.polarity_scores(text)
        compound = vader_scores['compound']
        
        if compound >= 0.05:
            sentiment = 'positive'
        elif compound <= -0.05:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        return {
            'sentiment': sentiment,
            'confidence': abs(compound),
            'vader_scores': vader_scores
        }

def analyze_dish_category(text):
    """Analyze dish category from review text"""
    try:
        category = category_model.predict([text])[0]
        return category
    except:
        # Fallback to keyword matching
        text_lower = text.lower()
        
        dish_keywords = {
            'coffee': ['coffee', 'cappuccino', 'latte', 'espresso'],
            'tea': ['tea', 'chai'],
            'burger': ['burger', 'sandwich'],
            'pizza': ['pizza', 'margherita'],
            'pasta': ['pasta', 'penne', 'carbonara'],
            'salad': ['salad', 'quinoa'],
            'dessert': ['cake', 'pudding', 'tiramisu', 'mousse'],
            'juice': ['smoothie', 'juice'],
            'bread': ['toast', 'croissant'],
            'soup': ['soup']
        }
        
        for category, keywords in dish_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return 'general'

def extract_insights_from_reviews(reviews_data):
    """Extract insights from review data"""
    if not reviews_data:
        return {
            'total_reviews': 0,
            'sentiment_distribution': {},
            'average_rating': 0,
            'top_dishes': [],
            'common_complaints': [],
            'recommendations': []
        }
    
    sentiments = [r.get('sentiment', 'neutral') for r in reviews_data]
    dishes = [r.get('dish', 'general') for r in reviews_data]
    
    # Sentiment distribution
    sentiment_counts = {}
    for sentiment in sentiments:
        sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
    
    # Dish popularity
    dish_counts = {}
    for dish in dishes:
        dish_counts[dish] = dish_counts.get(dish, 0) + 1
    
    top_dishes = sorted(dish_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        'total_reviews': len(reviews_data),
        'sentiment_distribution': sentiment_counts,
        'top_dishes': top_dishes,
        'dish_analysis': dish_counts
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'SIKBO ML Service',
        'data_source': 'REAL Google Maps Reviews',
        'models_trained': len(X_train) > 0,
        'review_count': len(X_train)
    })

@app.route('/analyze', methods=['POST'])
def analyze_review():
    """Analyze a single review"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Analyze sentiment
        sentiment_analysis = analyze_sentiment_advanced(text)
        
        # Analyze dish category
        dish_category = analyze_dish_category(text)
        
        result = {
            'text': text,
            'sentiment': sentiment_analysis['sentiment'],
            'confidence': sentiment_analysis['confidence'],
            'dish_category': dish_category,
            'vader_scores': sentiment_analysis['vader_scores'],
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get analytics from the real review data"""
    try:
        # Load current review data
        reviews, sentiments, dishes = load_real_review_data()
        
        if not reviews:
            return jsonify({'error': 'No review data available'}), 404
        
        # Create review objects for analysis
        reviews_data = []
        for i in range(len(reviews)):
            reviews_data.append({
                'text': reviews[i],
                'sentiment': sentiments[i] if i < len(sentiments) else 'neutral',
                'dish': dishes[i] if i < len(dishes) else 'general'
            })
        
        # Extract insights
        insights = extract_insights_from_reviews(reviews_data)
        
        # Add some additional analytics
        insights['data_source'] = 'REAL Google Maps Reviews'
        insights['last_updated'] = datetime.now().isoformat()
        
        return jsonify(insights)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sentiment-trends', methods=['GET'])
def get_sentiment_trends():
    """Get sentiment trends from real data"""
    try:
        reviews, sentiments, dishes = load_real_review_data()
        
        if not reviews:
            return jsonify({'error': 'No review data available'}), 404
        
        # Calculate sentiment percentages
        total = len(sentiments)
        positive_count = sentiments.count('positive')
        negative_count = sentiments.count('negative')
        neutral_count = sentiments.count('neutral')
        
        trends = {
            'positive_percentage': (positive_count / total) * 100,
            'negative_percentage': (negative_count / total) * 100,
            'neutral_percentage': (neutral_count / total) * 100,
            'total_reviews': total,
            'data_source': 'REAL Google Maps Reviews'
        }
        
        return jsonify(trends)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/dish-analysis', methods=['GET'])
def get_dish_analysis():
    """Get dish-specific analysis from real data"""
    try:
        reviews, sentiments, dishes = load_real_review_data()
        
        if not reviews:
            return jsonify({'error': 'No review data available'}), 404
        
        # Analyze by dish
        dish_analysis = {}
        
        for i in range(len(reviews)):
            dish = dishes[i] if i < len(dishes) else 'general'
            sentiment = sentiments[i] if i < len(sentiments) else 'neutral'
            
            if dish not in dish_analysis:
                dish_analysis[dish] = {
                    'total': 0,
                    'positive': 0,
                    'negative': 0,
                    'neutral': 0
                }
            
            dish_analysis[dish]['total'] += 1
            dish_analysis[dish][sentiment] += 1
        
        # Calculate percentages
        for dish, stats in dish_analysis.items():
            total = stats['total']
            stats['positive_percentage'] = (stats['positive'] / total) * 100
            stats['negative_percentage'] = (stats['negative'] / total) * 100
            stats['neutral_percentage'] = (stats['neutral'] / total) * 100
        
        return jsonify({
            'dish_analysis': dish_analysis,
            'data_source': 'REAL Google Maps Reviews'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/sample-reviews', methods=['GET'])
def get_sample_reviews():
    """Get sample reviews to verify real data"""
    try:
        reviews, sentiments, dishes = load_real_review_data()
        
        if not reviews:
            return jsonify({'error': 'No review data available'}), 404
        
        # Get first 10 reviews as samples
        samples = []
        for i in range(min(10, len(reviews))):
            samples.append({
                'text': reviews[i],
                'sentiment': sentiments[i] if i < len(sentiments) else 'neutral',
                'dish': dishes[i] if i < len(dishes) else 'general'
            })
        
        return jsonify({
            'sample_reviews': samples,
            'total_reviews': len(reviews),
            'data_source': 'REAL Google Maps Reviews'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"\n🎉 SIKBO ML Service Ready!")
    print(f"📊 Trained on {len(X_train)} REAL Google Maps reviews")
    print(f"🚫 NO MORE SYNTHETIC DATA!")
    print(f"🌐 Starting server on http://localhost:8001")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=8001, debug=True)
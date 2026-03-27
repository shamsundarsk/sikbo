-- SIKBO Restaurant Intelligence Database Schema for Neon DB
-- Execute these commands in your Neon DB console

-- Drop existing reviews table if it exists with wrong structure
DROP TABLE IF EXISTS reviews CASCADE;

-- Reviews table to store scraped Google Maps reviews
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    restaurant_place_id VARCHAR(255),
    reviewer_name VARCHAR(255),
    reviewer_avatar_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'google_maps',
    review_url TEXT,
    helpful_count INTEGER DEFAULT 0
);

CREATE INDEX idx_restaurant_name ON reviews(restaurant_name);
CREATE INDEX idx_rating ON reviews(rating);
CREATE INDEX idx_review_date ON reviews(review_date);

-- Sentiment analysis results table
CREATE TABLE sentiment_analysis (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    overall_sentiment VARCHAR(20) NOT NULL,
    overall_confidence DECIMAL(5,4) NOT NULL,
    
    food_sentiment VARCHAR(20),
    food_confidence DECIMAL(5,4),
    food_keywords TEXT[],
    
    service_sentiment VARCHAR(20),
    service_confidence DECIMAL(5,4),
    service_keywords TEXT[],
    
    ambiance_sentiment VARCHAR(20),
    ambiance_confidence DECIMAL(5,4),
    ambiance_keywords TEXT[],
    
    value_sentiment VARCHAR(20),
    value_confidence DECIMAL(5,4),
    value_keywords TEXT[],
    
    emotion_detected VARCHAR(50),
    urgency_level VARCHAR(20),
    complaint_category VARCHAR(100),
    compliment_category VARCHAR(100),
    
    mentioned_dishes TEXT[],
    mentioned_staff TEXT[],
    mentioned_issues TEXT[],
    mentioned_positives TEXT[],
    
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50) DEFAULT 'v1.0'
);

CREATE INDEX idx_overall_sentiment ON sentiment_analysis(overall_sentiment);
CREATE INDEX idx_food_sentiment ON sentiment_analysis(food_sentiment);
CREATE INDEX idx_service_sentiment ON sentiment_analysis(service_sentiment);
CREATE INDEX idx_processed_at ON sentiment_analysis(processed_at);

-- Trending dishes and insights
CREATE TABLE trending_insights (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    insight_data JSONB NOT NULL,
    confidence_score DECIMAL(5,4) NOT NULL,
    time_period VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurant_insight ON trending_insights(restaurant_name, insight_type);
CREATE INDEX idx_generated_at ON trending_insights(generated_at);

-- Action recommendations based on sentiment analysis
CREATE TABLE action_recommendations (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    expected_impact TEXT,
    estimated_cost VARCHAR(50),
    implementation_difficulty VARCHAR(20),
    based_on_reviews INTEGER[],
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurant_recommendations ON action_recommendations(restaurant_name);
CREATE INDEX idx_priority ON action_recommendations(priority);
CREATE INDEX idx_status ON action_recommendations(status);

-- Performance metrics and analytics
CREATE TABLE analytics_metrics (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    metric_date DATE NOT NULL,
    
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    positive_reviews INTEGER DEFAULT 0,
    negative_reviews INTEGER DEFAULT 0,
    neutral_reviews INTEGER DEFAULT 0,
    
    food_positive_pct DECIMAL(5,2),
    service_positive_pct DECIMAL(5,2),
    ambiance_positive_pct DECIMAL(5,2),
    value_positive_pct DECIMAL(5,2),
    
    trending_dishes JSONB,
    common_complaints JSONB,
    staff_mentions JSONB,
    
    customer_satisfaction_score DECIMAL(5,2),
    service_quality_score DECIMAL(5,2),
    food_quality_score DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE analytics_metrics ADD CONSTRAINT unique_restaurant_date UNIQUE(restaurant_name, metric_date);
CREATE INDEX idx_restaurant_metrics ON analytics_metrics(restaurant_name, metric_date);

-- Scraping jobs and status tracking
CREATE TABLE scraping_jobs (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    google_maps_url TEXT NOT NULL,
    place_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    reviews_scraped INTEGER DEFAULT 0,
    last_scraped_at TIMESTAMP,
    next_scrape_at TIMESTAMP,
    error_message TEXT,
    scraping_frequency VARCHAR(20) DEFAULT 'daily',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurant_scraping ON scraping_jobs(restaurant_name);
CREATE INDEX idx_status_scraping ON scraping_jobs(status);
CREATE INDEX idx_next_scrape ON scraping_jobs(next_scrape_at);
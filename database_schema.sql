-- SIKBO Restaurant Intelligence Database Schema for Neon DB
-- Execute these commands in your Neon DB console

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
    helpful_count INTEGER DEFAULT 0,
    INDEX idx_restaurant_name (restaurant_name),
    INDEX idx_rating (rating),
    INDEX idx_review_date (review_date)
);

-- Sentiment analysis results table
CREATE TABLE sentiment_analysis (
    id SERIAL PRIMARY KEY,
    review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    overall_sentiment VARCHAR(20) NOT NULL, -- positive, negative, neutral
    overall_confidence DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    
    -- Multi-category sentiment analysis
    food_sentiment VARCHAR(20),
    food_confidence DECIMAL(5,4),
    food_keywords TEXT[], -- Array of food-related keywords found
    
    service_sentiment VARCHAR(20),
    service_confidence DECIMAL(5,4),
    service_keywords TEXT[], -- Array of service-related keywords found
    
    ambiance_sentiment VARCHAR(20),
    ambiance_confidence DECIMAL(5,4),
    ambiance_keywords TEXT[], -- Array of ambiance-related keywords found
    
    value_sentiment VARCHAR(20),
    value_confidence DECIMAL(5,4),
    value_keywords TEXT[], -- Array of value/price-related keywords found
    
    -- Advanced analysis
    emotion_detected VARCHAR(50), -- joy, anger, sadness, surprise, etc.
    urgency_level VARCHAR(20), -- low, medium, high, critical
    complaint_category VARCHAR(100), -- specific complaint type if negative
    compliment_category VARCHAR(100), -- specific compliment type if positive
    
    -- Extracted entities
    mentioned_dishes TEXT[], -- Specific dishes mentioned
    mentioned_staff TEXT[], -- Staff members mentioned
    mentioned_issues TEXT[], -- Specific issues mentioned
    mentioned_positives TEXT[], -- Specific positive aspects mentioned
    
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model_version VARCHAR(50) DEFAULT 'v1.0',
    
    INDEX idx_overall_sentiment (overall_sentiment),
    INDEX idx_food_sentiment (food_sentiment),
    INDEX idx_service_sentiment (service_sentiment),
    INDEX idx_processed_at (processed_at)
);

-- Trending dishes and insights
CREATE TABLE trending_insights (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    insight_type VARCHAR(50) NOT NULL, -- trending_dish, complaint_pattern, staff_performance, etc.
    insight_data JSONB NOT NULL, -- Flexible JSON data for different insight types
    confidence_score DECIMAL(5,4) NOT NULL,
    time_period VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_restaurant_insight (restaurant_name, insight_type),
    INDEX idx_generated_at (generated_at)
);

-- Action recommendations based on sentiment analysis
CREATE TABLE action_recommendations (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL, -- menu_change, staff_training, service_improvement, etc.
    priority VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    expected_impact TEXT,
    estimated_cost VARCHAR(50),
    implementation_difficulty VARCHAR(20), -- easy, medium, hard
    based_on_reviews INTEGER[], -- Array of review IDs this recommendation is based on
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, dismissed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_restaurant_recommendations (restaurant_name),
    INDEX idx_priority (priority),
    INDEX idx_status (status)
);

-- Performance metrics and analytics
CREATE TABLE analytics_metrics (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    metric_date DATE NOT NULL,
    
    -- Review metrics
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    positive_reviews INTEGER DEFAULT 0,
    negative_reviews INTEGER DEFAULT 0,
    neutral_reviews INTEGER DEFAULT 0,
    
    -- Sentiment breakdown
    food_positive_pct DECIMAL(5,2),
    service_positive_pct DECIMAL(5,2),
    ambiance_positive_pct DECIMAL(5,2),
    value_positive_pct DECIMAL(5,2),
    
    -- Trending data
    trending_dishes JSONB,
    common_complaints JSONB,
    staff_mentions JSONB,
    
    -- Calculated scores
    customer_satisfaction_score DECIMAL(5,2),
    service_quality_score DECIMAL(5,2),
    food_quality_score DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(restaurant_name, metric_date),
    INDEX idx_restaurant_metrics (restaurant_name, metric_date)
);

-- Scraping jobs and status tracking
CREATE TABLE scraping_jobs (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    google_maps_url TEXT NOT NULL,
    place_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
    reviews_scraped INTEGER DEFAULT 0,
    last_scraped_at TIMESTAMP,
    next_scrape_at TIMESTAMP,
    error_message TEXT,
    scraping_frequency VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_restaurant_scraping (restaurant_name),
    INDEX idx_status (status),
    INDEX idx_next_scrape (next_scrape_at)
);
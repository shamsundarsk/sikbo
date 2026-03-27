/**
 * Google Maps Review Scraper Endpoint
 * Add this to your existing backend
 */

const express = require('express');
const router = express.Router();

// Google Places API Configuration
const GOOGLE_API_KEY = 'AIzaSyC6cVc-f9ZFugq2W3JOgCW6N6SyesQo44I';
const RESTAURANT_PLACE_ID = 'ChIJ3yQ4HeJYqDsR0Ky_wwSgVaY'; // The French Door
const RESTAURANT_NAME = 'The French Door';

/**
 * POST /scrape-google-reviews
 * Scrapes reviews from Google Maps and stores in database
 */
router.post('/scrape-google-reviews', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Call Google Places API (New)
    const url = `https://places.googleapis.com/v1/places/${RESTAURANT_PLACE_ID}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews'
      }
    });
    
    const data = await response.json();
    
    if (!data.reviews) {
      return res.status(404).json({
        status: 'error',
        message: 'No reviews found from Google API'
      });
    }
    
    // Organize by rating (5 from each: 5★, 4★, 3★, 2★, 1★)
    const reviewsByRating = { 5: [], 4: [], 3: [], 2: [], 1: [] };
    
    data.reviews.forEach(review => {
      const rating = review.rating || 0;
      if (reviewsByRating[rating]) {
        reviewsByRating[rating].push({
          restaurant_name: RESTAURANT_NAME,
          restaurant_place_id: RESTAURANT_PLACE_ID,
          reviewer_name: review.authorAttribution?.displayName || 'Anonymous',
          rating: rating,
          review_text: review.text?.text || '',
          review_date: new Date(),
          source: 'google_maps_api',
          helpful_count: 0
        });
      }
    });
    
    // Take 5 from each rating
    const allReviews = [];
    for (let rating = 5; rating >= 1; rating--) {
      allReviews.push(...reviewsByRating[rating].slice(0, 5));
    }
    
    // Save to database (use their existing pool)
    const pool = req.app.locals.pool || req.db; // Adjust based on their setup
    let savedCount = 0;
    
    for (const review of allReviews) {
      try {
        // Check for duplicates
        const existing = await pool.query(
          'SELECT id FROM reviews WHERE reviewer_name = $1 AND review_text = $2',
          [review.reviewer_name, review.review_text]
        );
        
        if (existing.rows.length === 0) {
          await pool.query(
            `INSERT INTO reviews 
             (restaurant_name, restaurant_place_id, reviewer_name, rating, review_text, review_date, scraped_at, source, helpful_count)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [review.restaurant_name, review.restaurant_place_id, review.reviewer_name,
             review.rating, review.review_text, review.review_date, new Date(),
             review.source, review.helpful_count]
          );
          savedCount++;
        }
      } catch (err) {
        console.error('Error saving review:', err);
      }
    }
    
    res.json({
      status: 'success',
      restaurant_name: data.displayName?.text || RESTAURANT_NAME,
      total_reviews_available: data.reviews.length,
      reviews_scraped: allReviews.length,
      reviews_saved: savedCount,
      reviews: allReviews
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /google-reviews
 * Get scraped reviews from database
 */
router.get('/google-reviews', async (req, res) => {
  try {
    const pool = req.app.locals.pool || req.db;
    
    const result = await pool.query(
      'SELECT * FROM reviews WHERE source = $1 ORDER BY scraped_at DESC',
      ['google_maps_api']
    );
    
    res.json({
      status: 'success',
      count: result.rows.length,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;

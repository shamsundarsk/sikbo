const { Client } = require('pg');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from backend .env file
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Also try ml-service .env
if (!process.env.NEON_DB_URL) {
  require('dotenv').config({ path: path.join(__dirname, 'ml-service', '.env') });
}

console.log('🔧 Environment check:');
console.log(`   NEON_DB_URL: ${process.env.NEON_DB_URL ? 'Set' : 'Not set'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/sikbo'}`);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sikbo');

// MongoDB Models
const Review = mongoose.model('Review', {
  text: String,
  sentiment: String,
  category: { type: String, enum: ['food', 'service', 'staff'], default: 'food' },
  dish: String,
  source: String,
  serviceScore: { type: Number, default: 0 },
  staffMentions: [String],
  foodItems: [String],
  confidence: { type: Number, default: 0.5 },
  rating: { type: Number, min: 1, max: 5 },
  reviewer_name: String,
  review_date: Date,
  date: { type: Date, default: Date.now }
});

async function syncNeonToMongo() {
  console.log('🔄 Syncing REAL reviews from Neon DB to MongoDB...');
  
  let neonClient;
  
  try {
    // Connect to Neon PostgreSQL
    neonClient = new Client({
      connectionString: process.env.NEON_DB_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    await neonClient.connect();
    console.log('✅ Connected to Neon DB');
    
    // Clear existing MongoDB reviews
    await Review.deleteMany({});
    console.log('🗑️  Cleared existing MongoDB reviews');
    
    // Fetch real reviews from Neon
    const neonQuery = `
      SELECT 
        r.id,
        r.restaurant_name,
        r.reviewer_name,
        r.rating,
        r.review_text,
        r.review_date,
        r.source,
        sa.overall_sentiment,
        sa.food_sentiment,
        sa.service_sentiment,
        sa.mentioned_dishes,
        sa.mentioned_staff,
        sa.overall_confidence
      FROM reviews r
      LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
      WHERE r.restaurant_name ILIKE '%french door%'
      ORDER BY r.review_date DESC
      LIMIT 1000;
    `;
    
    const result = await neonClient.query(neonQuery);
    const neonReviews = result.rows;
    
    console.log(`📊 Found ${neonReviews.length} REAL reviews in Neon DB`);
    
    if (neonReviews.length === 0) {
      console.log('⚠️  No reviews found in Neon DB. Checking all restaurants...');
      
      // Try to get any reviews
      const allReviewsQuery = `
        SELECT 
          r.id,
          r.restaurant_name,
          r.reviewer_name,
          r.rating,
          r.review_text,
          r.review_date,
          r.source,
          sa.overall_sentiment,
          sa.food_sentiment,
          sa.service_sentiment,
          sa.mentioned_dishes,
          sa.mentioned_staff,
          sa.overall_confidence
        FROM reviews r
        LEFT JOIN sentiment_analysis sa ON r.id = sa.review_id
        ORDER BY r.review_date DESC
        LIMIT 500;
      `;
      
      const allResult = await neonClient.query(allReviewsQuery);
      const allReviews = allResult.rows;
      
      console.log(`📊 Found ${allReviews.length} total reviews in Neon DB`);
      
      if (allReviews.length > 0) {
        console.log('🏪 Available restaurants:');
        const restaurants = [...new Set(allReviews.map(r => r.restaurant_name))];
        restaurants.forEach(name => console.log(`   • ${name}`));
      }
    }
    
    // Convert and save to MongoDB
    let savedCount = 0;
    
    for (const neonReview of neonReviews) {
      try {
        // Determine sentiment from rating if not available
        let sentiment = neonReview.overall_sentiment || neonReview.food_sentiment;
        if (!sentiment) {
          if (neonReview.rating >= 4) sentiment = 'positive';
          else if (neonReview.rating <= 2) sentiment = 'negative';
          else sentiment = 'neutral';
        }
        
        // Extract dish from mentioned_dishes or review text
        let dish = 'general';
        if (neonReview.mentioned_dishes && neonReview.mentioned_dishes.length > 0) {
          dish = neonReview.mentioned_dishes[0];
        } else {
          // Try to extract from review text
          const dishKeywords = ['coffee', 'tea', 'burger', 'pizza', 'pasta', 'salad', 'dessert', 'cake', 'sandwich'];
          const reviewText = (neonReview.review_text || '').toLowerCase();
          for (const keyword of dishKeywords) {
            if (reviewText.includes(keyword)) {
              dish = keyword;
              break;
            }
          }
        }
        
        // Determine category
        let category = 'food';
        if (neonReview.service_sentiment || (neonReview.review_text && neonReview.review_text.toLowerCase().includes('service'))) {
          category = 'service';
        } else if (neonReview.mentioned_staff && neonReview.mentioned_staff.length > 0) {
          category = 'staff';
        }
        
        const mongoReview = new Review({
          text: neonReview.review_text || 'No review text available',
          sentiment: sentiment.toLowerCase(),
          category: category,
          dish: dish,
          source: neonReview.source || 'google_maps_real',
          serviceScore: neonReview.rating || 3,
          staffMentions: neonReview.mentioned_staff || [],
          foodItems: neonReview.mentioned_dishes || [],
          confidence: neonReview.overall_confidence || 0.8,
          rating: neonReview.rating || 3,
          reviewer_name: neonReview.reviewer_name || 'Anonymous',
          review_date: neonReview.review_date || new Date(),
          date: neonReview.review_date || new Date()
        });
        
        await mongoReview.save();
        savedCount++;
        
        if (savedCount % 50 === 0) {
          console.log(`   💾 Saved ${savedCount} reviews...`);
        }
        
      } catch (saveError) {
        console.error(`❌ Error saving review ${neonReview.id}:`, saveError.message);
      }
    }
    
    console.log(`✅ Successfully synced ${savedCount} REAL reviews to MongoDB`);
    
    // Show sample of synced data
    const sampleReviews = await Review.find().limit(5);
    console.log('\n📝 Sample synced reviews:');
    sampleReviews.forEach((review, index) => {
      console.log(`\n   Review ${index + 1}:`);
      console.log(`     Reviewer: ${review.reviewer_name}`);
      console.log(`     Rating: ${review.rating}⭐`);
      console.log(`     Sentiment: ${review.sentiment}`);
      console.log(`     Category: ${review.category}`);
      console.log(`     Dish: ${review.dish}`);
      console.log(`     Text: ${review.text.substring(0, 100)}...`);
    });
    
    // Generate summary statistics
    const totalReviews = await Review.countDocuments();
    const positiveReviews = await Review.countDocuments({ sentiment: 'positive' });
    const negativeReviews = await Review.countDocuments({ sentiment: 'negative' });
    const neutralReviews = await Review.countDocuments({ sentiment: 'neutral' });
    
    console.log('\n📊 Sync Summary:');
    console.log(`   Total Reviews: ${totalReviews}`);
    console.log(`   Positive: ${positiveReviews} (${((positiveReviews/totalReviews)*100).toFixed(1)}%)`);
    console.log(`   Negative: ${negativeReviews} (${((negativeReviews/totalReviews)*100).toFixed(1)}%)`);
    console.log(`   Neutral: ${neutralReviews} (${((neutralReviews/totalReviews)*100).toFixed(1)}%)`);
    
    console.log('\n🎉 Real review data is now available in the dashboard!');
    console.log('🌐 Refresh http://localhost:3000 to see the real data');
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    
    if (error.code === 'ENOTFOUND' || error.message.includes('connection')) {
      console.log('\n🔧 Connection troubleshooting:');
      console.log('   1. Check if NEON_DB_URL is set in .env file');
      console.log('   2. Verify Neon database is accessible');
      console.log('   3. Check network connection');
    }
  } finally {
    if (neonClient) {
      await neonClient.end();
    }
    await mongoose.disconnect();
  }
}

// Run the sync
syncNeonToMongo();
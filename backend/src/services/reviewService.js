const Review = require('../models/Review');
const { callML } = require('../config/mlService');

const getReviews = async ({ limit = 50, page = 1, sentiment, category } = {}) => {
  const filter = {};
  if (sentiment) filter.sentiment = sentiment;
  if (category) filter.category = category;

  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter)
  ]);

  return {
    reviews,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) }
  };
};

const scrapeReviews = async ({ google_url }) => {
  const ml = await callML('post', '/scrape', { google_url });
  if (!ml.success) throw new Error('ML scraping service unavailable');

  const scraped = ml.data.reviews || [];
  const saved = [];

  for (const r of scraped) {
    const review = new Review({
      text: r.text,
      sentiment: r.sentiment,
      category: r.category || 'food',
      dish: r.food_items?.[0] || null,
      source: r.source || 'google_maps',
      serviceScore: r.service_score || 0,
      staffMentions: r.staff_mentions || [],
      foodItems: r.food_items || [],
      confidence: r.confidence || 0.5
    });
    await review.save();
    saved.push(review);
  }

  return {
    scraped: scraped.length,
    saved: saved.length,
    trends: ml.data.trends || [],
    analytics: ml.data.analytics || {}
  };
};

const getReviewActions = async () => {
  const negativeReviews = await Review.find({ sentiment: 'negative' }).sort({ date: -1 }).limit(50);

  const actions = negativeReviews.map(r => {
    const text = (r.text || '').toLowerCase();
    let actionType = 'investigate';
    let priority = 'medium';
    let suggestedAction = 'Review and respond to customer feedback';

    if (text.includes('food') || text.includes('taste') || text.includes('cold')) {
      actionType = 'food_quality';
      priority = 'high';
      suggestedAction = 'Conduct kitchen quality audit. Review preparation standards and temperature checks.';
    } else if (text.includes('slow') || text.includes('wait') || text.includes('delay')) {
      actionType = 'service_speed';
      priority = 'high';
      suggestedAction = 'Analyze service flow. Consider adding staff during peak hours.';
    } else if (text.includes('rude') || text.includes('staff') || text.includes('attitude')) {
      actionType = 'staff_behavior';
      priority = 'high';
      suggestedAction = 'Schedule staff training session. Review customer interaction protocols.';
    } else if (text.includes('price') || text.includes('expensive') || text.includes('value')) {
      actionType = 'pricing';
      priority = 'medium';
      suggestedAction = 'Review pricing strategy. Consider value meal options or loyalty discounts.';
    }

    return {
      reviewId: r._id,
      reviewText: r.text,
      category: r.category,
      actionType,
      priority,
      suggestedAction,
      status: 'pending',
      createdDate: r.date
    };
  });

  return actions;
};

module.exports = { getReviews, scrapeReviews, getReviewActions };

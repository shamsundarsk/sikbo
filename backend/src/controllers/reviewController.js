const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const reviewService = require('../services/reviewService');

const getReviews = asyncHandler(async (req, res) => {
  const { limit = 50, page = 1, sentiment, category } = req.query;
  const data = await reviewService.getReviews({
    limit: parseInt(limit),
    page: parseInt(page),
    sentiment,
    category
  });
  res.json({ success: true, ...data });
});

const scrapeReviews = asyncHandler(async (req, res) => {
  const { google_url } = req.body;
  if (!google_url) throw new ApiError('google_url is required', 400);
  const result = await reviewService.scrapeReviews({ google_url });
  res.json({ success: true, data: result, message: `Scraped ${result.scraped} reviews` });
});

const getReviewActions = asyncHandler(async (req, res) => {
  const data = await reviewService.getReviewActions();
  res.json({ success: true, data });
});

module.exports = { getReviews, scrapeReviews, getReviewActions };

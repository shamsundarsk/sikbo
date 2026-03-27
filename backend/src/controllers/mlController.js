const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const mlService = require('../services/mlService');

const analyzeSentiment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new ApiError('text is required', 400);
  const data = await mlService.analyzeSentiment(text);
  res.json({ success: true, data });
});

const getTrends = asyncHandler(async (req, res) => {
  const data = await mlService.getTrends();
  res.json({ success: true, data });
});

const scrape = asyncHandler(async (req, res) => {
  const { google_url } = req.body;
  if (!google_url) throw new ApiError('google_url is required', 400);
  const data = await mlService.scrapeReviews(google_url);
  res.json({ success: true, data });
});

module.exports = { analyzeSentiment, getTrends, scrape };

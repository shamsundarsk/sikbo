const { asyncHandler } = require('../middleware/errorHandler');
const trendsService = require('../services/trendsService');

const getTrends = asyncHandler(async (req, res) => {
  const data = await trendsService.getTrends();
  res.json({ success: true, data });
});

const fetchTrends = asyncHandler(async (req, res) => {
  const result = await trendsService.fetchAndStoreTrends();
  res.json({ success: true, data: result, message: `Trends fetched from ${result.source}` });
});

module.exports = { getTrends, fetchTrends };

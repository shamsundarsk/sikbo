const { asyncHandler } = require('../middleware/errorHandler');
const serviceAnalyticsService = require('../services/serviceAnalyticsService');

const getServiceAnalytics = asyncHandler(async (req, res) => {
  const data = await serviceAnalyticsService.getServiceAnalytics();
  res.json({ success: true, data });
});

module.exports = { getServiceAnalytics };

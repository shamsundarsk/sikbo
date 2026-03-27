const { asyncHandler } = require('../middleware/errorHandler');
const dashboardService = require('../services/dashboardService');

const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary();
  res.json({ success: true, data });
});

module.exports = { getSummary };

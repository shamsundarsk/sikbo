// Legacy /api/analytics endpoint — kept for frontend compatibility
const { asyncHandler } = require('../middleware/errorHandler');
const Sales = require('../models/Sales');
const Review = require('../models/Review');

const getAnalytics = asyncHandler(async (req, res) => {
  const [sales, reviews] = await Promise.all([
    Sales.find().sort({ date: -1 }).limit(200),
    Review.find().sort({ date: -1 }).limit(200)
  ]);

  const dishPerformance = {};
  sales.forEach(s => {
    if (!dishPerformance[s.dish]) {
      dishPerformance[s.dish] = { orders: 0, revenue: 0, totalCost: 0, profit: 0, profitMargin: 0 };
    }
    dishPerformance[s.dish].orders += s.orders;
    dishPerformance[s.dish].revenue += s.revenue;
    dishPerformance[s.dish].totalCost += s.totalCost || 0;
    dishPerformance[s.dish].profit += s.profit || 0;
  });

  Object.keys(dishPerformance).forEach(dish => {
    const d = dishPerformance[dish];
    d.profitMargin = d.revenue > 0 ? parseFloat(((d.profit / d.revenue) * 100).toFixed(1)) : 0;
  });

  const sentimentBreakdown = {
    food: { positive: 0, negative: 0, neutral: 0 },
    service: { positive: 0, negative: 0, neutral: 0 },
    staff: { positive: 0, negative: 0, neutral: 0 }
  };
  reviews.forEach(r => {
    const cat = r.category || 'food';
    const sent = r.sentiment || 'neutral';
    if (sentimentBreakdown[cat]) sentimentBreakdown[cat][sent]++;
  });

  // Calculate total orders and customers from sales
  const totalOrders = Object.values(dishPerformance).reduce((sum, d) => sum + d.orders, 0);
  const avgCustomersPerOrder = 2.5; // Estimate
  const totalCustomers = Math.round(totalOrders * avgCustomersPerOrder);

  // Get menu items count from MenuItem model
  const MenuItem = require('../models/MenuItem');
  const totalMenuItems = await MenuItem.countDocuments({});

  // Create decision summary based on performance
  const decisionSummary = {
    remove: [],
    fix: [],
    promote: [],
    add: []
  };

  Object.keys(dishPerformance).forEach(dish => {
    const d = dishPerformance[dish];
    if (d.profitMargin < 20) {
      decisionSummary.remove.push({ dish, reason: 'Low profit margin' });
    } else if (d.orders > 50) {
      decisionSummary.promote.push({ dish, reason: 'High performer' });
    }
    if (d.sentiment && d.sentiment < 0.3) {
      decisionSummary.fix.push({ dish, reason: 'Negative reviews' });
    }
  });

  res.json({
    success: true,
    sales: dishPerformance,
    reviews,
    sentimentBreakdown,
    totalDishes: Object.keys(dishPerformance).length,
    totalRevenue: Object.values(dishPerformance).reduce((s, d) => s + d.revenue, 0),
    totalProfit: Object.values(dishPerformance).reduce((s, d) => s + d.profit, 0),
    totalReviews: reviews.length,
    totalOrders,
    totalCustomers,
    totalMenuItems,
    decisionSummary
  });
});

module.exports = { getAnalytics };

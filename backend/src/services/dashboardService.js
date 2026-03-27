const Sales = require('../models/Sales');
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');

const getSummary = async () => {
  const [sales, reviews, menuItems, customers] = await Promise.all([
    Sales.find().sort({ date: -1 }).limit(200),
    Review.find().sort({ date: -1 }).limit(200),
    MenuItem.find({ isActive: true }),
    Customer.find().sort({ date: -1 }).limit(30)
  ]);

  // Revenue & orders
  const totalRevenue = sales.reduce((s, x) => s + (x.revenue || 0), 0);
  const totalOrders = sales.reduce((s, x) => s + (x.orders || 0), 0);
  const totalProfit = sales.reduce((s, x) => s + (x.profit || 0), 0);

  // Customers
  const totalCustomers = customers.reduce((s, x) => s + (x.count || 0), 0);

  // Sentiment breakdown
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

  // Decision summary per dish
  const dishMap = {};
  sales.forEach(s => {
    if (!dishMap[s.dish]) dishMap[s.dish] = { orders: 0, revenue: 0, profit: 0 };
    dishMap[s.dish].orders += s.orders;
    dishMap[s.dish].revenue += s.revenue;
    dishMap[s.dish].profit += s.profit || 0;
  });

  const decisionSummary = { remove: [], fix: [], promote: [], add: [] };
  Object.entries(dishMap).forEach(([dish, data]) => {
    const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    const dishReviews = reviews.filter(r => r.dish === dish || (r.foodItems || []).includes(dish.toLowerCase()));
    const sentScore = dishReviews.length
      ? dishReviews.reduce((s, r) => s + (r.sentiment === 'positive' ? 1 : r.sentiment === 'negative' ? -1 : 0), 0) / dishReviews.length
      : 0;

    if (margin < 15 && sentScore < -0.3) decisionSummary.remove.push(dish);
    else if (sentScore < -0.4) decisionSummary.fix.push(dish);
    else if (margin > 40 && sentScore > 0.2) decisionSummary.promote.push(dish);
  });

  return {
    totalRevenue: Math.round(totalRevenue),
    totalOrders,
    totalProfit: Math.round(totalProfit),
    totalCustomers,
    totalMenuItems: menuItems.length,
    totalReviews: reviews.length,
    sentimentBreakdown,
    decisionSummary,
    recentSales: sales.slice(0, 10)
  };
};

module.exports = { getSummary };

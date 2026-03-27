const Sales = require('../models/Sales');
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');

const getAllFood = async () => {
  return MenuItem.find({ isActive: true }).sort({ category: 1, name: 1 });
};

const getFoodById = async (id) => {
  return MenuItem.findById(id);
};

const addFood = async (data) => {
  const item = new MenuItem(data);
  return item.save();
};

const getFoodPerformance = async () => {
  const [sales, reviews] = await Promise.all([
    Sales.find().sort({ date: -1 }).limit(500),
    Review.find().sort({ date: -1 }).limit(500)
  ]);

  const dishMap = {};
  sales.forEach(s => {
    if (!dishMap[s.dish]) {
      dishMap[s.dish] = { orders: 0, revenue: 0, profit: 0, totalCost: 0 };
    }
    dishMap[s.dish].orders += s.orders;
    dishMap[s.dish].revenue += s.revenue;
    dishMap[s.dish].profit += s.profit || 0;
    dishMap[s.dish].totalCost += s.totalCost || 0;
  });

  return Object.entries(dishMap).map(([dish, data]) => {
    const dishReviews = reviews.filter(r =>
      r.dish === dish || (r.foodItems || []).map(f => f.toLowerCase()).includes(dish.toLowerCase())
    );
    const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
    dishReviews.forEach(r => { sentimentCounts[r.sentiment || 'neutral']++; });

    const margin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0;
    let status = 'maintain';
    if (parseFloat(margin) < 15) status = 'review';
    else if (parseFloat(margin) > 45) status = 'promote';

    return {
      dish,
      orders: data.orders,
      revenue: Math.round(data.revenue),
      profit: Math.round(data.profit),
      profitMargin: parseFloat(margin),
      sentiment: sentimentCounts,
      reviewCount: dishReviews.length,
      status
    };
  });
};

module.exports = { getAllFood, getFoodById, addFood, getFoodPerformance };

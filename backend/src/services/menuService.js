const MenuItem = require('../models/MenuItem');
const Sales = require('../models/Sales');
const Review = require('../models/Review');

const getMenu = async () => MenuItem.find({ isActive: true }).sort({ category: 1, name: 1 });

const getMenuAnalysis = async () => {
  const [items, sales, reviews] = await Promise.all([
    MenuItem.find({ isActive: true }),
    Sales.find(),
    Review.find()
  ]);

  const salesMap = {};
  sales.forEach(s => {
    if (!salesMap[s.dish]) salesMap[s.dish] = { orders: 0, revenue: 0, profit: 0 };
    salesMap[s.dish].orders += s.orders;
    salesMap[s.dish].revenue += s.revenue;
    salesMap[s.dish].profit += s.profit || 0;
  });

  return items.map(item => {
    const perf = salesMap[item.name] || { orders: 0, revenue: 0, profit: 0 };
    const cost = item.costPrice || 0;
    const sell = item.sellingPrice || 0;
    const profitPerUnit = sell - cost;
    const margin = sell > 0 ? ((profitPerUnit / sell) * 100).toFixed(1) : 0;

    const dishReviews = reviews.filter(r =>
      (r.dish || '').toLowerCase() === item.name.toLowerCase() ||
      (r.foodItems || []).map(f => f.toLowerCase()).includes(item.name.toLowerCase())
    );
    const sentScore = dishReviews.length
      ? dishReviews.reduce((s, r) => s + (r.sentiment === 'positive' ? 1 : r.sentiment === 'negative' ? -1 : 0), 0) / dishReviews.length
      : 0;

    let decision = 'maintain';
    if (parseFloat(margin) < 20 && sentScore < -0.3) decision = 'remove';
    else if (sentScore < -0.4) decision = 'fix';
    else if (parseFloat(margin) > 45 && sentScore > 0.2) decision = 'promote';
    else if (parseFloat(margin) < 20) decision = 'optimize';

    return {
      _id: item._id,
      name: item.name,
      category: item.category,
      sellingPrice: sell,
      costPrice: cost,
      profitPerUnit: Math.round(profitPerUnit),
      profitMargin: parseFloat(margin),
      orders: perf.orders,
      revenue: Math.round(perf.revenue),
      sentiment: parseFloat(sentScore.toFixed(2)),
      reviewCount: dishReviews.length,
      decision
    };
  });
};

const addMenuItem = async (data) => {
  const item = new MenuItem(data);
  return item.save();
};

const updateMenuItem = async (id, data) => {
  return MenuItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteMenuItem = async (id) => {
  return MenuItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

module.exports = { getMenu, getMenuAnalysis, addMenuItem, updateMenuItem, deleteMenuItem };

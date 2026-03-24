const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sikbo');

// Models
const Sales = mongoose.model('Sales', {
  dish: String,
  orders: Number,
  revenue: Number,
  costPerItem: Number,
  totalCost: Number,
  profit: Number,
  date: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', {
  text: String,
  sentiment: String,
  dish: String,
  source: String,
  date: { type: Date, default: Date.now }
});

const Trend = mongoose.model('Trend', {
  dish: String,
  count: Number,
  source: String,
  date: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', {
  name: String,
  category: String,
  sellingPrice: Number,
  costPrice: Number,
  description: String,
  isActive: { type: Boolean, default: true },
  dateAdded: { type: Date, default: Date.now }
});

// Routes
app.post('/api/sales', async (req, res) => {
  try {
    const { dish, orders, revenue, costPerItem } = req.body;
    
    // Calculate profit if cost is provided
    const totalCost = costPerItem ? costPerItem * orders : 0;
    const profit = revenue - totalCost;
    
    const sales = new Sales({
      dish,
      orders,
      revenue,
      costPerItem: costPerItem || 0,
      totalCost,
      profit
    });
    
    await sales.save();
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const sales = await Sales.find().sort({ date: -1 }).limit(100);
    const reviews = await Review.find().sort({ date: -1 }).limit(100);
    
    // Calculate performance metrics with profit
    const dishPerformance = {};
    sales.forEach(sale => {
      if (!dishPerformance[sale.dish]) {
        dishPerformance[sale.dish] = { 
          orders: 0, 
          revenue: 0, 
          totalCost: 0, 
          profit: 0,
          profitMargin: 0
        };
      }
      dishPerformance[sale.dish].orders += sale.orders;
      dishPerformance[sale.dish].revenue += sale.revenue;
      dishPerformance[sale.dish].totalCost += sale.totalCost || 0;
      dishPerformance[sale.dish].profit += sale.profit || 0;
    });

    // Calculate profit margins
    Object.keys(dishPerformance).forEach(dish => {
      const data = dishPerformance[dish];
      data.profitMargin = data.revenue > 0 ? ((data.profit / data.revenue) * 100).toFixed(1) : 0;
    });

    res.json({
      sales: dishPerformance,
      reviews: reviews,
      totalDishes: Object.keys(dishPerformance).length,
      totalRevenue: Object.values(dishPerformance).reduce((sum, dish) => sum + dish.revenue, 0),
      totalProfit: Object.values(dishPerformance).reduce((sum, dish) => sum + dish.profit, 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trends', async (req, res) => {
  try {
    // Get fresh trends from ML service
    const axios = require('axios');
    const mlResponse = await axios.post('http://localhost:8001/scrape', {});
    const freshTrends = mlResponse.data.trends || [];
    
    // Save trends to database
    await Trend.deleteMany({}); // Clear old trends
    for (const trend of freshTrends) {
      await new Trend(trend).save();
    }
    
    // Return fresh trends
    res.json(freshTrends);
  } catch (error) {
    // Fallback to database trends if ML service fails
    const trends = await Trend.find().sort({ count: -1 }).limit(10);
    res.json(trends);
  }
});

app.post('/api/scrape', async (req, res) => {
  try {
    // Trigger ML service scraping
    const axios = require('axios');
    const response = await axios.post('http://localhost:8001/scrape', req.body);
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Scraping service unavailable' });
  }
});

app.get('/api/recommendations', async (req, res) => {
  try {
    // Get data for decision engine
    const sales = await Sales.aggregate([
      { $group: { _id: '$dish', totalOrders: { $sum: '$orders' }, totalRevenue: { $sum: '$revenue' } } }
    ]);
    
    const reviews = await Review.aggregate([
      { $group: { _id: '$dish', avgSentiment: { $avg: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, { $cond: [{ $eq: ['$sentiment', 'negative'] }, -1, 0] }] } } } }
    ]);
    
    // Get trending dishes from ML service
    let trendingDishes = [];
    try {
      const axios = require('axios');
      const trendResponse = await axios.post('http://localhost:8001/scrape', {});
      trendingDishes = trendResponse.data.trends || [];
    } catch (error) {
      console.log('Could not fetch trends:', error.message);
    }
    
    // Simple decision logic
    const recommendations = sales.map(dish => {
      const sentiment = reviews.find(r => r._id === dish._id)?.avgSentiment || 0;
      const trendScore = trendingDishes.find(t => t.dish.toLowerCase().includes(dish._id.toLowerCase()))?.count || 0;
      
      const score = (dish.totalOrders * 0.4) + (sentiment * 30) + (trendScore * 0.2);
      
      let action = 'maintain';
      let reason = 'Stable performance';
      
      if (score < 15) {
        action = 'remove';
        reason = 'Low sales and poor sentiment';
      } else if (score < 25 && sentiment < 0) {
        action = 'fix';
        reason = 'Good sales but negative reviews';
      } else if (score > 50) {
        action = 'promote';
        reason = 'High performance and trending';
      }
      
      return {
        dish: dish._id,
        action,
        score: Math.round(score),
        orders: dish.totalOrders,
        sentiment: sentiment.toFixed(2),
        trending: trendScore,
        reason
      };
    });
    
    // Add trending dishes not in menu as "add" recommendations
    const menuDishes = sales.map(s => s._id.toLowerCase());
    const addRecommendations = trendingDishes
      .filter(trend => !menuDishes.some(dish => trend.dish.toLowerCase().includes(dish)))
      .slice(0, 3)
      .map(trend => ({
        dish: trend.dish,
        action: 'add',
        score: trend.count,
        orders: 0,
        sentiment: '0.00',
        trending: trend.count,
        reason: `Trending with ${trend.count} mentions`
      }));
    
    res.json([...recommendations, ...addRecommendations]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Menu management routes
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ isActive: true }).sort({ category: 1, name: 1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.json({ success: true, data: menuItem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: menuItem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await MenuItem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SIKBO Backend running on port ${PORT}`);
});
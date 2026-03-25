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

// Enhanced Models for Restaurant Intelligence System
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
  category: { type: String, enum: ['food', 'service', 'staff'], default: 'food' },
  dish: String,
  source: String,
  serviceScore: { type: Number, default: 0 },
  staffMentions: [String],
  foodItems: [String],
  confidence: { type: Number, default: 0.5 },
  date: { type: Date, default: Date.now }
});

const Trend = mongoose.model('Trend', {
  dish: String,
  count: Number,
  source: String,
  season: String,
  date: { type: Date, default: Date.now }
});

const MenuItem = mongoose.model('MenuItem', {
  name: String,
  category: { type: String, enum: ['Beverages', 'Food', 'Desserts', 'Appetizers', 'Main Course'], default: 'Food' },
  sellingPrice: Number,
  costPrice: Number,
  description: String,
  ingredients: [String],
  isActive: { type: Boolean, default: true },
  dateAdded: { type: Date, default: Date.now }
});

const Staff = mongoose.model('Staff', {
  name: String,
  role: { type: String, enum: ['Waiter', 'Chef', 'Manager', 'Bartender', 'Host'], default: 'Waiter' },
  rating: { type: Number, default: 3.0, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  positiveReviews: { type: Number, default: 0 },
  negativeReviews: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const Customer = mongoose.model('Customer', {
  date: { type: Date, default: Date.now },
  count: Number,
  hour: Number,
  peakHour: Boolean,
  dayOfWeek: String
});

const RawMaterial = mongoose.model('RawMaterial', {
  dish: String,
  ingredients: [{
    name: String,
    quantity: Number,
    unit: String,
    cost: Number,
    supplier: String
  }],
  totalCost: Number,
  lastUpdated: { type: Date, default: Date.now }
});

const ReviewAction = mongoose.model('ReviewAction', {
  reviewText: String,
  category: String,
  actionType: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  suggestedAction: String,
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  assignedTo: String,
  dueDate: Date,
  createdDate: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', {
  restaurantName: String,
  googleMapsUrl: String,
  instagramHandle: String,
  location: String,
  currency: { type: String, default: 'INR' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  lastUpdated: { type: Date, default: Date.now }
});

// Enhanced Analytics Route
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

    // Enhanced analytics with sentiment breakdown
    const sentimentBreakdown = {
      food: { positive: 0, negative: 0, neutral: 0 },
      service: { positive: 0, negative: 0, neutral: 0 },
      staff: { positive: 0, negative: 0, neutral: 0 }
    };

    reviews.forEach(review => {
      const category = review.category || 'food';
      const sentiment = review.sentiment || 'neutral';
      if (sentimentBreakdown[category]) {
        sentimentBreakdown[category][sentiment]++;
      }
    });

    res.json({
      sales: dishPerformance,
      reviews: reviews,
      sentimentBreakdown,
      totalDishes: Object.keys(dishPerformance).length,
      totalRevenue: Object.values(dishPerformance).reduce((sum, dish) => sum + dish.revenue, 0),
      totalProfit: Object.values(dishPerformance).reduce((sum, dish) => sum + dish.profit, 0),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Service Analytics Route
app.get('/api/service-analytics', async (req, res) => {
  try {
    const axios = require('axios');
    const reviews = await Review.find({ category: 'service' }).sort({ date: -1 });
    
    // Call ML service for detailed service analysis
    try {
      const mlResponse = await axios.post('http://localhost:8001/analyze-service', {
        reviews: reviews
      });
      res.json(mlResponse.data);
    } catch (mlError) {
      // Fallback calculation
      const serviceRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + (r.serviceScore || 0), 0) / reviews.length + 3 : 3;
      
      res.json({
        total_service_reviews: reviews.length,
        service_rating: Math.max(1, Math.min(5, serviceRating)).toFixed(1),
        positive_count: reviews.filter(r => r.sentiment === 'positive').length,
        negative_count: reviews.filter(r => r.sentiment === 'negative').length,
        neutral_count: reviews.filter(r => r.sentiment === 'neutral').length
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Staff Management Routes
app.get('/api/staff', async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true }).sort({ name: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Staff Analytics Route
app.get('/api/staff-analytics', async (req, res) => {
  try {
    const axios = require('axios');
    const reviews = await Review.find({ 
      $or: [
        { category: 'staff' },
        { staffMentions: { $exists: true, $ne: [] } }
      ]
    });
    
    try {
      const mlResponse = await axios.post('http://localhost:8001/analyze-staff', {
        reviews: reviews
      });
      res.json(mlResponse.data);
    } catch (mlError) {
      // Fallback staff analysis
      const staffAnalysis = {
        overall_staff_rating: 3.5,
        positive_mentions: reviews.filter(r => r.sentiment === 'positive').length,
        negative_mentions: reviews.filter(r => r.sentiment === 'negative').length,
        staff_feedback: reviews.slice(0, 5).map(r => ({
          text: r.text.substring(0, 100) + '...',
          sentiment: r.sentiment,
          mentions: r.staffMentions || []
        }))
      };
      res.json(staffAnalysis);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Flow Routes
app.get('/api/customer-flow', async (req, res) => {
  try {
    const axios = require('axios');
    const mlResponse = await axios.post('http://localhost:8001/customer-flow', {});
    res.json(mlResponse.data);
  } catch (error) {
    // Fallback customer flow data
    const mockFlow = {
      daily_data: [
        { date: '2024-03-25', total_customers: 85, peak_hour: 13 },
        { date: '2024-03-24', total_customers: 92, peak_hour: 19 },
        { date: '2024-03-23', total_customers: 78, peak_hour: 12 }
      ],
      analytics: {
        avg_daily_customers: 85,
        busiest_day: 'Monday',
        total_week_customers: 595
      }
    };
    res.json(mockFlow);
  }
});

app.post('/api/customer-flow', async (req, res) => {
  try {
    const { date, count, hour } = req.body;
    const customer = new Customer({
      date: new Date(date),
      count,
      hour,
      dayOfWeek: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      peakHour: hour >= 12 && hour <= 14 || hour >= 19 && hour <= 21
    });
    await customer.save();
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Raw Materials Routes
app.get('/api/raw-materials/:dish', async (req, res) => {
  try {
    const axios = require('axios');
    const mlResponse = await axios.get(`http://localhost:8001/raw-materials/${req.params.dish}`);
    res.json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Raw materials service unavailable' });
  }
});

app.post('/api/raw-materials', async (req, res) => {
  try {
    const rawMaterial = new RawMaterial(req.body);
    await rawMaterial.save();
    res.json({ success: true, data: rawMaterial });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Menu Analysis Route
app.get('/api/menu-analysis', async (req, res) => {
  try {
    const axios = require('axios');
    const sales = await Sales.find();
    const reviews = await Review.find();
    
    // Prepare sales data for ML analysis
    const salesData = {};
    sales.forEach(sale => {
      if (!salesData[sale.dish]) {
        salesData[sale.dish] = { orders: 0, revenue: 0 };
      }
      salesData[sale.dish].orders += sale.orders;
      salesData[sale.dish].revenue += sale.revenue;
    });
    
    const mlResponse = await axios.post('http://localhost:8001/menu-analysis', {
      sales: salesData,
      reviews: reviews
    });
    
    res.json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Menu analysis service unavailable' });
  }
});

// Review Actions Routes
app.get('/api/review-actions', async (req, res) => {
  try {
    const actions = await ReviewAction.find().sort({ createdDate: -1 });
    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/review-actions/generate', async (req, res) => {
  try {
    const axios = require('axios');
    const reviews = await Review.find({ sentiment: 'negative' });
    
    const mlResponse = await axios.post('http://localhost:8001/review-actions', {
      reviews: reviews
    });
    
    // Save generated actions to database
    const actions = mlResponse.data.actions || [];
    for (const action of actions) {
      const reviewAction = new ReviewAction({
        ...action,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      });
      await reviewAction.save();
    }
    
    res.json(mlResponse.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/review-actions/:id', async (req, res) => {
  try {
    const action = await ReviewAction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: action });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sales Routes (keeping existing functionality)
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

// Enhanced Trends Route
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

// Enhanced Scraping Route
app.post('/api/scrape', async (req, res) => {
  try {
    // Trigger ML service scraping
    const axios = require('axios');
    const response = await axios.post('http://localhost:8001/scrape', req.body);
    
    // Save enhanced reviews to database
    if (response.data.reviews) {
      for (const review of response.data.reviews) {
        const newReview = new Review({
          text: review.text,
          sentiment: review.sentiment,
          category: review.category || 'food',
          dish: review.food_items?.[0] || 'Unknown',
          source: review.source,
          serviceScore: review.service_score || 0,
          staffMentions: review.staff_mentions || [],
          foodItems: review.food_items || [],
          confidence: review.confidence || 0.5
        });
        await newReview.save();
      }
    }
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Scraping service unavailable' });
  }
});

// Enhanced Recommendations Route
app.get('/api/recommendations', async (req, res) => {
  try {
    // Get comprehensive menu analysis from ML service
    const axios = require('axios');
    const sales = await Sales.find();
    const reviews = await Review.find();
    
    // Prepare data for ML analysis
    const salesData = {};
    sales.forEach(sale => {
      if (!salesData[sale.dish]) {
        salesData[sale.dish] = { orders: 0, revenue: 0 };
      }
      salesData[sale.dish].orders += sale.orders;
      salesData[sale.dish].revenue += sale.revenue;
    });
    
    try {
      const mlResponse = await axios.post('http://localhost:8001/menu-analysis', {
        sales: salesData,
        reviews: reviews
      });
      
      // Convert ML analysis to recommendation format
      const recommendations = Object.entries(mlResponse.data).map(([dish, analysis]) => ({
        dish,
        action: analysis.decision,
        score: Math.round((analysis.profit_margin + analysis.sentiment_score * 20) / 2),
        orders: analysis.sales.orders,
        sentiment: analysis.sentiment_score.toFixed(2),
        trending: 0,
        reason: analysis.reason,
        profitMargin: analysis.profit_margin,
        rawMaterialCost: analysis.raw_materials.total_cost
      }));
      
      res.json(recommendations);
    } catch (mlError) {
      // Fallback to original recommendation logic
      const sales = await Sales.aggregate([
        { $group: { _id: '$dish', totalOrders: { $sum: '$orders' }, totalRevenue: { $sum: '$revenue' } } }
      ]);
      
      const reviews = await Review.aggregate([
        { $group: { _id: '$dish', avgSentiment: { $avg: { $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, { $cond: [{ $eq: ['$sentiment', 'negative'] }, -1, 0] }] } } } }
      ]);
      
      const recommendations = sales.map(dish => {
        const sentiment = reviews.find(r => r._id === dish._id)?.avgSentiment || 0;
        const score = (dish.totalOrders * 0.4) + (sentiment * 30);
        
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
          reason = 'High performance';
        }
        
        return {
          dish: dish._id,
          action,
          score: Math.round(score),
          orders: dish.totalOrders,
          sentiment: sentiment.toFixed(2),
          trending: 0,
          reason
        };
      });
      
      res.json(recommendations);
    }
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

// Settings routes
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        restaurantName: 'My Restaurant',
        currency: 'INR',
        timezone: 'Asia/Kolkata'
      });
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, req.body);
      settings.lastUpdated = new Date();
    } else {
      settings = new Settings(req.body);
    }
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Auto-extract menu from Google Maps
app.post('/api/extract-menu', async (req, res) => {
  try {
    const { googleUrl } = req.body;
    
    if (!googleUrl) {
      return res.status(400).json({ error: 'Google Maps URL is required' });
    }
    
    // Call ML service to scrape and extract menu
    const axios = require('axios');
    const response = await axios.post('http://localhost:8001/scrape', {
      google_url: googleUrl
    });
    
    if (response.data.status === 'success') {
      const extractedItems = response.data.menu_items || [];
      
      // Auto-add extracted menu items to database
      let addedCount = 0;
      for (const item of extractedItems) {
        // Check if item already exists
        const existing = await MenuItem.findOne({ 
          name: { $regex: new RegExp(item.item, 'i') }
        });
        
        if (!existing && item.confidence > 0.5) {
          const menuItem = new MenuItem({
            name: item.item,
            category: item.category,
            sellingPrice: 0, // To be set manually
            costPrice: 0,
            description: `Auto-extracted from reviews (confidence: ${Math.round(item.confidence * 100)}%)`
          });
          
          await menuItem.save();
          addedCount++;
        }
      }
      
      res.json({
        success: true,
        extracted: extractedItems.length,
        added: addedCount,
        reviews: response.data.reviews.length,
        items: extractedItems
      });
    } else {
      res.status(500).json({ error: 'Failed to extract menu items' });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set default cafe data
app.post('/api/set-default-cafe', async (req, res) => {
  try {
    // Set The French Door as default
    const defaultSettings = {
      restaurantName: 'The French Door (Café & Restaurant)',
      googleMapsUrl: 'https://www.google.com/maps/place/The+French+Door+(Caf%C3%A9+%26+Restaurant)/@11.0022277,76.952783,15z/data=!4m6!3m5!1s0x3ba858e21d3824df:0xa655a004c3bfacd0!8m2!3d11.0138627!4d76.9468862!16s%2Fg%2F11csq8dx2m?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D',
      location: 'Coimbatore, Tamil Nadu, India',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    };
    
    let settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, defaultSettings);
      settings.lastUpdated = new Date();
    } else {
      settings = new Settings(defaultSettings);
    }
    await settings.save();
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SIKBO Backend running on port ${PORT}`);
});
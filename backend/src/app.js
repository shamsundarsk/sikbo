const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const dashboardRoutes = require('./routes/dashboard');
const foodRoutes = require('./routes/food');
const serviceRoutes = require('./routes/service');
const customerRoutes = require('./routes/customers');
const staffRoutes = require('./routes/staff');
const menuRoutes = require('./routes/menu');
const rawMaterialRoutes = require('./routes/rawMaterials');
const trendsRoutes = require('./routes/trends');
const reviewRoutes = require('./routes/reviews');
const mlRoutes = require('./routes/ml');
const analyticsRoutes = require('./routes/analytics'); // legacy
const salesRoutes = require('./routes/sales');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'SIKBO API is running', timestamp: new Date().toISOString() });
});

// API v1 routes
const v1 = '/api/v1';
app.use(`${v1}/dashboard`, dashboardRoutes);
app.use(`${v1}/food`, foodRoutes);
app.use(`${v1}/service`, serviceRoutes);
app.use(`${v1}/customers`, customerRoutes);
app.use(`${v1}/staff`, staffRoutes);
app.use(`${v1}/menu`, menuRoutes);
app.use(`${v1}/raw-materials`, rawMaterialRoutes);
app.use(`${v1}/trends`, trendsRoutes);
app.use(`${v1}/reviews`, reviewRoutes);
app.use(`${v1}/ml`, mlRoutes);
app.use(`${v1}/analytics`, analyticsRoutes); // Add v1 analytics route
app.use(`${v1}/sales`, salesRoutes);

// Legacy /api routes — keeps existing frontend working without changes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/service-analytics', serviceRoutes);
app.use('/api/customer-flow', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;

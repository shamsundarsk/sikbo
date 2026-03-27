const mongoose = require('mongoose');

const trendSchema = new mongoose.Schema({
  dish: { type: String, required: true },
  count: { type: Number, default: 0 },
  source: { type: String, default: 'instagram' },
  season: String,
  growth: String,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Trend', trendSchema);

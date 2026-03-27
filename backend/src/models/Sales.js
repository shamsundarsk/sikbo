const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  dish: { type: String, required: true },
  orders: { type: Number, required: true, min: 0 },
  revenue: { type: Number, required: true, min: 0 },
  costPerItem: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sales', salesSchema);

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Beverages', 'Food', 'Desserts', 'Appetizers', 'Main Course', 'Snacks'],
    default: 'Food'
  },
  sellingPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, default: 0 },
  description: String,
  ingredients: [String],
  isActive: { type: Boolean, default: true },
  dateAdded: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);

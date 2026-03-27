const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema({
  dish: { type: String, required: true },
  ingredients: [{
    name: { type: String, required: true },
    quantity: Number,
    unit: String,
    cost: Number,
    supplier: String
  }],
  totalCost: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);

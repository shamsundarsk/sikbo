const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], default: 'neutral' },
  category: { type: String, enum: ['food', 'service', 'staff'], default: 'food' },
  dish: String,
  source: { type: String, default: 'manual' },
  rating: { type: Number, min: 1, max: 5 },
  reviewerName: String,
  serviceScore: { type: Number, default: 0 },
  staffMentions: [String],
  foodItems: [String],
  confidence: { type: Number, default: 0.5 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

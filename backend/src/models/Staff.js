const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ['Waiter', 'Chef', 'Manager', 'Bartender', 'Host'],
    default: 'Waiter'
  },
  rating: { type: Number, default: 3.0, min: 1, max: 5 },
  reviewCount: { type: Number, default: 0 },
  positiveReviews: { type: Number, default: 0 },
  negativeReviews: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);

const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  count: { type: Number, required: true, min: 0 },
  hour: { type: Number, min: 0, max: 23 },
  peakHour: { type: Boolean, default: false },
  dayOfWeek: String
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);

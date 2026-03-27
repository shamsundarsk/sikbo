const Staff = require('../models/Staff');
const Review = require('../models/Review');
const { callML } = require('../config/mlService');

const getStaff = async () => Staff.find({ isActive: true }).sort({ name: 1 });

const addStaff = async (data) => {
  const staff = new Staff(data);
  return staff.save();
};

const updateStaff = async (id, data) => {
  return Staff.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteStaff = async (id) => {
  return Staff.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

const getStaffAnalytics = async () => {
  const reviews = await Review.find({
    $or: [{ category: 'staff' }, { staffMentions: { $exists: true, $ne: [] } }]
  });

  const ml = await callML('post', '/analyze-staff', { reviews });
  if (ml.success) return ml.data;

  // Fallback
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;
  const total = positive + negative;

  return {
    overall_staff_rating: total > 0 ? parseFloat(((positive / total) * 5).toFixed(1)) : 3.5,
    positive_mentions: positive,
    negative_mentions: negative,
    total_reviews: reviews.length,
    staff_feedback: reviews.slice(0, 5).map(r => ({
      text: (r.text || '').substring(0, 120) + '...',
      sentiment: r.sentiment,
      mentions: r.staffMentions || []
    }))
  };
};

module.exports = { getStaff, addStaff, updateStaff, deleteStaff, getStaffAnalytics };

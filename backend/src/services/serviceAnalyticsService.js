const Review = require('../models/Review');
const { callML } = require('../config/mlService');

const getServiceAnalytics = async () => {
  const reviews = await Review.find({ category: 'service' }).sort({ date: -1 });

  // Try ML service first
  const ml = await callML('post', '/analyze-service', { reviews });
  if (ml.success) return ml.data;

  // Fallback: compute locally
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;
  const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
  const total = reviews.length;

  const avgScore = total > 0
    ? reviews.reduce((s, r) => s + (r.serviceScore || 0), 0) / total
    : 0;
  const serviceRating = Math.max(1, Math.min(5, avgScore * 2 + 3)).toFixed(1);

  const keyIssues = [];
  const keyPositives = [];
  reviews.forEach(r => {
    const t = (r.text || '').toLowerCase();
    if (r.sentiment === 'negative') {
      if (t.includes('slow') || t.includes('delay')) keyIssues.push('Slow service');
      if (t.includes('rude')) keyIssues.push('Rude staff');
      if (t.includes('wait')) keyIssues.push('Long wait times');
    } else if (r.sentiment === 'positive') {
      if (t.includes('fast') || t.includes('quick')) keyPositives.push('Quick service');
      if (t.includes('friendly')) keyPositives.push('Friendly staff');
      if (t.includes('attentive')) keyPositives.push('Attentive service');
    }
  });

  return {
    total_service_reviews: total,
    service_rating: parseFloat(serviceRating),
    positive_count: positive,
    negative_count: negative,
    neutral_count: neutral,
    key_issues: [...new Set(keyIssues)],
    key_positives: [...new Set(keyPositives)],
    sentiment_breakdown: { positive, negative, neutral }
  };
};

module.exports = { getServiceAnalytics };

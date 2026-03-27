const Trend = require('../models/Trend');
const { callML } = require('../config/mlService');

const getTrends = async () => {
  return Trend.find().sort({ count: -1 }).limit(20);
};

const fetchAndStoreTrends = async () => {
  const ml = await callML('post', '/scrape', {});

  if (ml.success && ml.data.trends?.length) {
    await Trend.deleteMany({});
    const docs = ml.data.trends.map(t => new Trend(t));
    await Trend.insertMany(docs);
    return { source: 'ml_service', trends: ml.data.trends };
  }

  // Fallback: return existing DB trends
  const existing = await Trend.find().sort({ count: -1 }).limit(10);
  return { source: 'database', trends: existing };
};

module.exports = { getTrends, fetchAndStoreTrends };

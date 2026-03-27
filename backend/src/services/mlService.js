const { callML } = require('../config/mlService');

const analyzeSentiment = async (text) => {
  const ml = await callML('post', '/analyze-sentiment', { text });
  if (ml.success) return ml.data;
  return { sentiment: 'neutral', confidence: 0.5, source: 'fallback' };
};

const getTrends = async () => {
  const ml = await callML('post', '/scrape', {});
  if (ml.success) return ml.data.trends || [];
  return [];
};

const scrapeReviews = async (googleUrl) => {
  const ml = await callML('post', '/scrape', { google_url: googleUrl });
  if (ml.success) return ml.data;
  throw new Error('ML scraping service unavailable');
};

module.exports = { analyzeSentiment, getTrends, scrapeReviews };

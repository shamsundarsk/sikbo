const RawMaterial = require('../models/RawMaterial');
const { callML } = require('../config/mlService');

const getAll = async () => RawMaterial.find().sort({ dish: 1 });

const getByDish = async (dish) => {
  // Try ML service first for live calculation
  const ml = await callML('get', `/raw-materials/${encodeURIComponent(dish)}`);
  if (ml.success) return ml.data;

  // Fallback to DB
  const record = await RawMaterial.findOne({ dish: new RegExp(dish, 'i') });
  if (record) return record;

  return {
    dish,
    ingredients: [],
    total_cost: 0,
    breakdown: [],
    message: 'No raw material data found for this dish'
  };
};

const addRawMaterial = async (data) => {
  const existing = await RawMaterial.findOne({ dish: new RegExp(data.dish, 'i') });
  if (existing) {
    Object.assign(existing, data);
    existing.lastUpdated = new Date();
    return existing.save();
  }
  const record = new RawMaterial(data);
  return record.save();
};

module.exports = { getAll, getByDish, addRawMaterial };

const Sales = require('../models/Sales');

const addSale = async ({ dish, orders, revenue, costPerItem }) => {
  const totalCost = (costPerItem || 0) * orders;
  const profit = revenue - totalCost;
  const sale = new Sales({ dish, orders, revenue, costPerItem: costPerItem || 0, totalCost, profit });
  return sale.save();
};

const getSales = async ({ limit = 100 } = {}) => {
  return Sales.find().sort({ date: -1 }).limit(limit);
};

module.exports = { addSale, getSales };

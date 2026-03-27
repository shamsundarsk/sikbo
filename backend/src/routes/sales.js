const router = require('express').Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { addSale, getSales } = require('../services/salesService');
const { validateSales } = require('../middleware/validate');

router.get('/', asyncHandler(async (req, res) => {
  const data = await getSales({ limit: parseInt(req.query.limit) || 100 });
  res.json({ success: true, data });
}));

router.post('/', validateSales, asyncHandler(async (req, res) => {
  const sale = await addSale(req.body);
  res.status(201).json({ success: true, data: sale, message: 'Sale recorded' });
}));

module.exports = router;

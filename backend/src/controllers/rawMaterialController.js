const { asyncHandler } = require('../middleware/errorHandler');
const rawMaterialService = require('../services/rawMaterialService');

const getAll = asyncHandler(async (req, res) => {
  const data = await rawMaterialService.getAll();
  res.json({ success: true, data });
});

const getByDish = asyncHandler(async (req, res) => {
  const data = await rawMaterialService.getByDish(req.params.dish);
  res.json({ success: true, data });
});

const addRawMaterial = asyncHandler(async (req, res) => {
  const data = await rawMaterialService.addRawMaterial(req.body);
  res.status(201).json({ success: true, data, message: 'Raw material data saved' });
});

module.exports = { getAll, getByDish, addRawMaterial };

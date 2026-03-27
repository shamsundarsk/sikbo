const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const menuService = require('../services/menuService');

const getMenu = asyncHandler(async (req, res) => {
  const data = await menuService.getMenu();
  res.json({ success: true, data });
});

const getMenuAnalysis = asyncHandler(async (req, res) => {
  const data = await menuService.getMenuAnalysis();
  res.json({ success: true, data });
});

const addMenuItem = asyncHandler(async (req, res) => {
  const item = await menuService.addMenuItem(req.body);
  res.status(201).json({ success: true, data: item, message: 'Menu item added' });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await menuService.updateMenuItem(req.params.id, req.body);
  if (!item) throw new ApiError('Menu item not found', 404);
  res.json({ success: true, data: item, message: 'Menu item updated' });
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await menuService.deleteMenuItem(req.params.id);
  if (!item) throw new ApiError('Menu item not found', 404);
  res.json({ success: true, message: 'Menu item removed' });
});

module.exports = { getMenu, getMenuAnalysis, addMenuItem, updateMenuItem, deleteMenuItem };

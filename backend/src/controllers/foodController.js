const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const foodService = require('../services/foodService');

const getAllFood = asyncHandler(async (req, res) => {
  const data = await foodService.getAllFood();
  res.json({ success: true, data });
});

const getFoodById = asyncHandler(async (req, res) => {
  const item = await foodService.getFoodById(req.params.id);
  if (!item) throw new ApiError('Food item not found', 404);
  res.json({ success: true, data: item });
});

const addFood = asyncHandler(async (req, res) => {
  const item = await foodService.addFood(req.body);
  res.status(201).json({ success: true, data: item, message: 'Food item added' });
});

const getFoodPerformance = asyncHandler(async (req, res) => {
  const data = await foodService.getFoodPerformance();
  res.json({ success: true, data });
});

module.exports = { getAllFood, getFoodById, addFood, getFoodPerformance };

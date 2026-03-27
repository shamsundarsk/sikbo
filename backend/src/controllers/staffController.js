const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const staffService = require('../services/staffService');

const getStaff = asyncHandler(async (req, res) => {
  const data = await staffService.getStaff();
  res.json({ success: true, data });
});

const addStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.addStaff(req.body);
  res.status(201).json({ success: true, data: staff, message: 'Staff member added' });
});

const updateStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.updateStaff(req.params.id, req.body);
  if (!staff) throw new ApiError('Staff member not found', 404);
  res.json({ success: true, data: staff, message: 'Staff member updated' });
});

const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.deleteStaff(req.params.id);
  if (!staff) throw new ApiError('Staff member not found', 404);
  res.json({ success: true, message: 'Staff member deactivated' });
});

const getStaffAnalytics = asyncHandler(async (req, res) => {
  const data = await staffService.getStaffAnalytics();
  res.json({ success: true, data });
});

module.exports = { getStaff, addStaff, updateStaff, deleteStaff, getStaffAnalytics };

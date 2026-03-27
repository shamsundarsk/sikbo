const { asyncHandler } = require('../middleware/errorHandler');
const customerService = require('../services/customerService');

const getCustomers = asyncHandler(async (req, res) => {
  const { limit = 30, page = 1 } = req.query;
  const data = await customerService.getCustomers({ limit: parseInt(limit), page: parseInt(page) });
  res.json({ success: true, data });
});

const addCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.addCustomer(req.body);
  res.status(201).json({ success: true, data: customer, message: 'Customer data recorded' });
});

module.exports = { getCustomers, addCustomer };

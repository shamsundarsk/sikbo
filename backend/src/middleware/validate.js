const { ApiError } = require('./errorHandler');

// Generic field validator
const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter(f => req.body[f] === undefined || req.body[f] === '');
  if (missing.length > 0) {
    return next(new ApiError(`Missing required fields: ${missing.join(', ')}`, 400));
  }
  next();
};

const validateSales = requireFields(['dish', 'orders', 'revenue']);
const validateMenuItem = requireFields(['name', 'sellingPrice']);
const validateStaff = requireFields(['name', 'role']);
const validateCustomer = requireFields(['count']);
const validateReview = requireFields(['text']);

module.exports = {
  validateSales,
  validateMenuItem,
  validateStaff,
  validateCustomer,
  validateReview,
  requireFields
};

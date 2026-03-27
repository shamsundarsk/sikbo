const Customer = require('../models/Customer');

const getCustomers = async ({ limit = 30, page = 1 } = {}) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Customer.find().sort({ date: -1 }).skip(skip).limit(limit),
    Customer.countDocuments()
  ]);

  const totalCustomers = data.reduce((s, c) => s + (c.count || 0), 0);
  const avgDaily = data.length > 0 ? Math.round(totalCustomers / data.length) : 0;

  // Find busiest day
  const dayMap = {};
  data.forEach(c => {
    const day = c.dayOfWeek || 'Unknown';
    dayMap[day] = (dayMap[day] || 0) + (c.count || 0);
  });
  const busiestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return {
    daily_data: data,
    analytics: {
      total_week_customers: totalCustomers,
      avg_daily_customers: avgDaily,
      busiest_day: busiestDay
    },
    pagination: { total, page, limit, pages: Math.ceil(total / limit) }
  };
};

const addCustomer = async ({ date, count, hour }) => {
  const d = new Date(date || Date.now());
  const customer = new Customer({
    date: d,
    count,
    hour,
    dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }),
    peakHour: (hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)
  });
  return customer.save();
};

module.exports = { getCustomers, addCustomer };

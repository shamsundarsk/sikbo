const router = require('express').Router();
const { getServiceAnalytics } = require('../controllers/serviceAnalyticsController');

router.get('/analytics', getServiceAnalytics);

module.exports = router;

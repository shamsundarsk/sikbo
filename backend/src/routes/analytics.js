// Legacy route — kept for frontend compatibility
const router = require('express').Router();
const { getAnalytics } = require('../controllers/analyticsController');

router.get('/', getAnalytics);

module.exports = router;

const router = require('express').Router();
const { getSummary } = require('../controllers/dashboardController');

router.get('/summary', getSummary);

module.exports = router;

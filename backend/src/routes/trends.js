const router = require('express').Router();
const { getTrends, fetchTrends } = require('../controllers/trendsController');

router.get('/', getTrends);
router.post('/fetch', fetchTrends);

module.exports = router;

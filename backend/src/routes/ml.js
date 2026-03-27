const router = require('express').Router();
const { analyzeSentiment, getTrends, scrape } = require('../controllers/mlController');

router.post('/sentiment', analyzeSentiment);
router.post('/trends', getTrends);
router.post('/scrape', scrape);

module.exports = router;

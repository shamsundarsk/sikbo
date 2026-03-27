const router = require('express').Router();
const { getReviews, scrapeReviews, getReviewActions } = require('../controllers/reviewController');

router.get('/', getReviews);
router.get('/actions', getReviewActions);
router.post('/scrape', scrapeReviews);

module.exports = router;

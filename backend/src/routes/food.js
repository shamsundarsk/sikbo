const router = require('express').Router();
const { getAllFood, getFoodById, addFood, getFoodPerformance } = require('../controllers/foodController');
const { validateMenuItem } = require('../middleware/validate');

router.get('/', getAllFood);
router.get('/performance', getFoodPerformance);
router.get('/:id', getFoodById);
router.post('/', validateMenuItem, addFood);

module.exports = router;

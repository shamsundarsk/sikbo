const router = require('express').Router();
const { getAll, getByDish, addRawMaterial } = require('../controllers/rawMaterialController');

router.get('/', getAll);
router.get('/:dish', getByDish);
router.post('/', addRawMaterial);

module.exports = router;

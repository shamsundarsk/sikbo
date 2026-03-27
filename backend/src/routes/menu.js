const router = require('express').Router();
const { getMenu, getMenuAnalysis, addMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { validateMenuItem } = require('../middleware/validate');

router.get('/', getMenu);
router.get('/analysis', getMenuAnalysis);
router.post('/', validateMenuItem, addMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

module.exports = router;

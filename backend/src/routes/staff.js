const router = require('express').Router();
const { getStaff, addStaff, updateStaff, deleteStaff, getStaffAnalytics } = require('../controllers/staffController');
const { validateStaff } = require('../middleware/validate');

router.get('/', getStaff);
router.get('/analytics', getStaffAnalytics);
router.post('/', validateStaff, addStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;

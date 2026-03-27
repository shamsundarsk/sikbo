const router = require('express').Router();
const { getCustomers, addCustomer } = require('../controllers/customerController');
const { validateCustomer } = require('../middleware/validate');

router.get('/', getCustomers);
router.post('/', validateCustomer, addCustomer);

module.exports = router;

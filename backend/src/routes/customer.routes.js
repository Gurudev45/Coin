const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  resetPassword,
} = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  customerCreateValidators,
  customerUpdateValidators,
  resetPasswordValidators,
} = require('../validators/customer.validator');

router.use(authenticate);

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', customerCreateValidators, createCustomer);
router.put('/:id', customerUpdateValidators, updateCustomer);
router.delete('/:id', deleteCustomer);
router.post('/:id/reset-password', resetPasswordValidators, resetPassword);

module.exports = router;

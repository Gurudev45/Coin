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
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const {
  customerCreateValidators,
  customerUpdateValidators,
  resetPasswordValidators,
} = require('../validators/customer.validator');

router.use(authenticate);

// Listing all customers requires Admin
router.get('/', requireAdmin, getCustomers);

// Single customer lookup (Admin can view any; Customers can only view their own)
router.get('/:id', getCustomer);

// Management actions require Admin
router.post('/', requireAdmin, customerCreateValidators, createCustomer);
router.put('/:id', requireAdmin, customerUpdateValidators, updateCustomer);
router.delete('/:id', requireAdmin, deleteCustomer);
router.post('/:id/reset-password', requireAdmin, resetPasswordValidators, resetPassword);

module.exports = router;

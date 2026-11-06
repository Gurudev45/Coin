const { body, query, param } = require('express-validator');

const FIXED_VALUES = [3, 5];
const REGULAR_VALUES = [60, 55, 50, 45, 40];
const COMBO_VALUES = [5, 3];

const customerCreateValidators = [
  body('id_name')
    .trim()
    .notEmpty().withMessage('ID Name is required')
    .isLength({ max: 100 }).withMessage('ID Name must be at most 100 characters'),

  body('date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('Date must be a valid date'),

  body('mail_id')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Mail ID must be a valid email address'),

  body('m_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage('M.Date must be a valid date'),

  body('password')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('fixed_value')
    .optional({ nullable: true, checkFalsy: true })
    .isInt().withMessage('Fixed must be an integer'),

  body('regular_value')
    .optional({ nullable: true, checkFalsy: true })
    .isInt().withMessage('Regular must be an integer'),

  body('combo_value')
    .optional({ nullable: true, checkFalsy: true })
    .isInt().withMessage('Combo must be an integer'),

  body('arp')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat().withMessage('ARP must be a numeric value'),

  body('balance_coin')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat().withMessage('Balance Coin must be a numeric value'),

  body('withdraw_coin')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat().withMessage('Withdraw Coin must be a numeric value'),

  body('withdraw_fee')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat().withMessage('Withdraw Fee must be a numeric value'),

  body('net_coin')
    .optional({ nullable: true, checkFalsy: true })
    .isFloat().withMessage('Net Coin must be a numeric value'),
];

const customerUpdateValidators = [
  param('id').isUUID().withMessage('Invalid customer ID'),
  ...customerCreateValidators.map((v) => {
    // Make id_name not required on update, but still validate uniqueness if provided
    if (v.builder?.fields?.includes('id_name')) {
      return body('id_name')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('ID Name must be at most 100 characters');
    }
    return v;
  }),
];

const resetPasswordValidators = [
  param('id').isUUID().withMessage('Invalid customer ID'),
  body('new_password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = {
  customerCreateValidators,
  customerUpdateValidators,
  resetPasswordValidators,
  FIXED_VALUES,
  REGULAR_VALUES,
  COMBO_VALUES,
};

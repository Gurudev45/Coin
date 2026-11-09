const express = require('express');
const router = express.Router();
const { exportExcel, exportCsv } = require('../controllers/export.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticate, requireAdmin);
router.get('/excel', exportExcel);
router.get('/csv', exportCsv);

module.exports = router;

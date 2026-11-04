const express = require('express');
const router = express.Router();
const { exportExcel, exportCsv } = require('../controllers/export.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/excel', exportExcel);
router.get('/csv', exportCsv);

module.exports = router;

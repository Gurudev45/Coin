const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/report.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticate, requireAdmin);
router.get('/', getReports);

module.exports = router;

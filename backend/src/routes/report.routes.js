const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/', getReports);

module.exports = router;

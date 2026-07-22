const express = require('express');
const { getReports, downloadReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getReports);
router.get('/download/:fileName', downloadReport);

module.exports = router;

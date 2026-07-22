const express = require('express');
const { getCompliance } = require('../controllers/complianceController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getCompliance);

module.exports = router;

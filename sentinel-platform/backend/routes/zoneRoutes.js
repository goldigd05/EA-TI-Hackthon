const express = require('express');
const { getZoneRisk } = require('../controllers/zoneController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getZoneRisk);

module.exports = router;
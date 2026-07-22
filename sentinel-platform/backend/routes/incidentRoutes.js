const express = require('express');
const { getIncidents, createIncident } = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getIncidents);
router.post('/', protect, createIncident);

module.exports = router;

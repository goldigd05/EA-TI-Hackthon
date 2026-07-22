const express = require('express');
const { getSensors, createSensor } = require('../controllers/sensorController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getSensors);
router.post('/', protect, createSensor); // IoT devices post readings here

module.exports = router;

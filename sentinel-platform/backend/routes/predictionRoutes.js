const express = require('express');
const { predict } = require('../controllers/predictionController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/', protect, predict);

module.exports = router;

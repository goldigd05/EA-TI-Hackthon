const express = require('express');
const { getPermits, createPermit } = require('../controllers/permitController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.get('/', protect, getPermits);
router.post('/', protect, createPermit);

module.exports = router;

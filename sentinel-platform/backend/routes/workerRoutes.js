const express = require('express');
const { getWorkers, createWorker, updateWorker, deleteWorker } = require('../controllers/workerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getWorkers);
router.post('/', protect, authorize('admin', 'supervisor', 'safety_officer'), createWorker);
router.put('/:id', protect, authorize('admin', 'supervisor', 'safety_officer'), updateWorker);
router.delete('/:id', protect, authorize('admin'), deleteWorker);

module.exports = router;

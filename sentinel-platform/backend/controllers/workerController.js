const Worker = require('../models/Worker');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { evaluateWorker } = require('../services/workerAIService');
const { createNotification } = require('../services/notificationService');

const getWorkers = asyncHandler(async (req, res) => {
  const { zone, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;

  const workers = await Worker.find(filter).sort({ createdAt: -1 });
  return ApiResponse.success(res, workers);
});

const createWorker = asyncHandler(async (req, res) => {
  const evaluation = evaluateWorker(req.body);
  const worker = await Worker.create({ ...req.body, riskScore: evaluation.riskScore, status: evaluation.status });

  if (evaluation.status === 'critical') {
    await createNotification({
      title: 'Critical Worker Alert',
      message: evaluation.recommendation,
      priority: 'critical',
      zone: worker.zone,
    });
  }

  return ApiResponse.success(res, worker, 'Worker created', 201);
});

const updateWorker = asyncHandler(async (req, res) => {
  const evaluation = evaluateWorker({ ...req.body });
  const updated = await Worker.findByIdAndUpdate(
    req.params.id,
    { ...req.body, riskScore: evaluation.riskScore, status: evaluation.status },
    { new: true, runValidators: true }
  );

  if (!updated) return ApiResponse.error(res, 'Worker not found', 404);

  if (evaluation.status === 'critical') {
    await createNotification({
      title: 'Critical Worker Alert',
      message: evaluation.recommendation,
      priority: 'critical',
      zone: updated.zone,
    });
  }

  return ApiResponse.success(res, updated, 'Worker updated');
});

const deleteWorker = asyncHandler(async (req, res) => {
  const deleted = await Worker.findByIdAndDelete(req.params.id);
  if (!deleted) return ApiResponse.error(res, 'Worker not found', 404);
  return ApiResponse.success(res, {}, 'Worker deleted');
});

module.exports = { getWorkers, createWorker, updateWorker, deleteWorker };

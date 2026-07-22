const Permit = require('../models/Permit');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { validatePermit } = require('../services/permitAIService');
const { createNotification } = require('../services/notificationService');

const getPermits = asyncHandler(async (req, res) => {
  const { zone, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;

  const permits = await Permit.find(filter).populate('workerId', 'name employeeId').sort({ createdAt: -1 });
  return ApiResponse.success(res, permits);
});

const createPermit = asyncHandler(async (req, res) => {
  const { approved, reasons } = await validatePermit(req.body);

  const permit = await Permit.create({
    ...req.body,
    status: approved ? 'approved' : 'rejected',
    rejectionReason: approved ? null : reasons.join(' | '),
    approvedBy: approved ? req.user?._id : null,
  });

  if (!approved) {
    await createNotification({
      title: 'Permit Auto-Rejected by AI',
      message: `Permit ${permit.permitId} rejected: ${reasons.join(', ')}`,
      priority: 'high',
      zone: permit.zone,
    });
  }

  return ApiResponse.success(res, permit, approved ? 'Permit approved' : 'Permit rejected by AI safety check', 201);
});

module.exports = { getPermits, createPermit };

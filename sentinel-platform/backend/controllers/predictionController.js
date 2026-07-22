const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPrediction } = require('../services/predictionService');
const { createNotification } = require('../services/notificationService');

// @route POST /api/predict
// Body: { temperature, gas_level, humidity, pressure, smoke, worker_count,
//         maintenance, permit_status, equipment_health, shift, zone }
const predict = asyncHandler(async (req, res) => {
  const required = [
    'temperature', 'gas_level', 'humidity', 'pressure', 'smoke',
    'worker_count', 'maintenance', 'permit_status', 'equipment_health', 'shift', 'zone',
  ];
  const missing = required.filter((f) => req.body[f] === undefined);
  if (missing.length > 0) {
    return ApiResponse.error(res, `Missing required fields: ${missing.join(', ')}`, 400);
  }

  const prediction = await getPrediction(req.body);

  if (prediction.riskScore >= 60) {
    await createNotification({
      title: 'High-Risk Prediction — AI Alert',
      message: `${prediction.incident} predicted in ${prediction.zone} (risk ${prediction.riskScore}%). ${prediction.recommendation}`,
      priority: prediction.riskScore >= 80 ? 'critical' : 'high',
      zone: prediction.zone,
    });
  }

  return ApiResponse.success(res, prediction, 'Prediction generated');
});

module.exports = { predict };

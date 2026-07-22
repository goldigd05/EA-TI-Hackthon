const Sensor = require('../models/Sensor');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

const THRESHOLDS = {
  temperature: { warning: 50, critical: 65 },
  gas: { warning: 30, critical: 45 },
  smoke: { warning: 25, critical: 40 },
  pressure: { warning: 115, critical: 125 },
  humidity: { warning: 85, critical: 95 },
  vibration: { warning: 60, critical: 80 },
};

const computeStatus = (sensorType, value) => {
  const t = THRESHOLDS[sensorType];
  if (!t) return 'normal';
  if (value >= t.critical) return 'critical';
  if (value >= t.warning) return 'warning';
  return 'normal';
};

const getSensors = asyncHandler(async (req, res) => {
  const { zone, sensorType, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (sensorType) filter.sensorType = sensorType;
  if (status) filter.status = status;

  const sensors = await Sensor.find(filter).sort({ timestamp: -1 }).limit(500);
  return ApiResponse.success(res, sensors);
});

const createSensor = asyncHandler(async (req, res) => {
  const status = computeStatus(req.body.sensorType, req.body.value);
  const sensor = await Sensor.create({ ...req.body, status });

  if (status === 'critical') {
    await createNotification({
      title: `Critical ${req.body.sensorType} reading`,
      message: `Sensor ${sensor.sensorId} in ${sensor.zone} reported ${sensor.value}${sensor.unit}, exceeding critical threshold.`,
      priority: 'critical',
      zone: sensor.zone,
    });
  }

  return ApiResponse.success(res, sensor, 'Sensor reading recorded', 201);
});

module.exports = { getSensors, createSensor };

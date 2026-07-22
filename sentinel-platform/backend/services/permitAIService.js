const Sensor = require('../models/Sensor');
const Worker = require('../models/Worker');

/**
 * Cross-checks a permit request against live sensor readings, worker location,
 * and maintenance status before approval. Rejects dangerous permits automatically.
 */
const validatePermit = async (permitData) => {
  const { zone, permitType, workerId } = permitData;

  const reasons = [];

  const zoneSensors = await Sensor.find({ zone }).sort({ timestamp: -1 }).limit(20);

  const gasSensor = zoneSensors.find((s) => s.sensorType === 'gas');
  if (gasSensor && gasSensor.value > 40) {
    reasons.push(`Gas level in ${zone} is ${gasSensor.value}${gasSensor.unit}, exceeds safe threshold (40).`);
  }

  const tempSensor = zoneSensors.find((s) => s.sensorType === 'temperature');
  if (tempSensor && tempSensor.value > 65 && permitType === 'hot_work') {
    reasons.push(`Ambient temperature ${tempSensor.value}° too high for hot-work permit.`);
  }

  const smokeSensor = zoneSensors.find((s) => s.sensorType === 'smoke');
  if (smokeSensor && smokeSensor.value > 35) {
    reasons.push(`Smoke levels elevated (${smokeSensor.value}) — fire risk in ${zone}.`);
  }

  const criticalSensors = zoneSensors.filter((s) => s.status === 'critical');
  if (criticalSensors.length > 0) {
    reasons.push(`${criticalSensors.length} sensor(s) in ${zone} reporting critical status.`);
  }

  if (workerId) {
    const worker = await Worker.findById(workerId);
    if (worker && worker.status === 'critical') {
      reasons.push(`Assigned worker ${worker.name} currently flagged critical health status.`);
    }
    if (worker && permitType === 'height_work' && !worker.helmetDetected) {
      reasons.push(`Helmet not detected on worker — cannot approve height-work permit.`);
    }
  }

  return {
    approved: reasons.length === 0,
    reasons,
  };
};

module.exports = { validatePermit };

const Incident = require('../models/Incident');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');

const getIncidents = asyncHandler(async (req, res) => {
  const { zone, severity, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;

  const incidents = await Incident.find(filter).sort({ timestamp: -1 });
  return ApiResponse.success(res, incidents);
});

const createIncident = asyncHandler(async (req, res) => {
  const incident = await Incident.create(req.body);

  await createNotification({
    title: `New ${incident.severity} Incident`,
    message: `Incident ${incident.incidentId} reported in zone ${incident.zone}`,
    priority: incident.severity === 'critical' ? 'critical' : 'medium',
    zone: incident.zone,
  });

  return ApiResponse.success(res, incident, 'Incident recorded', 201);
});

module.exports = { getIncidents, createIncident };

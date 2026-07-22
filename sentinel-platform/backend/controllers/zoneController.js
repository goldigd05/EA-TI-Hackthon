const Sensor = require('../models/Sensor');
const Worker = require('../models/Worker');
const Prediction = require('../models/Prediction');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Aggregates live risk signals (sensors, worker vitals, latest AI predictions)
 * PER ZONE, so the frontend can render a real-time geospatial risk heatmap
 * over the plant layout — fusing multiple data sources into one risk picture,
 * rather than showing isolated single-sensor readings.
 */
const getZoneRisk = asyncHandler(async (req, res) => {
    const [sensors, workers, predictions] = await Promise.all([
        Sensor.find().sort({ timestamp: -1 }).limit(1000),
        Worker.find(),
        Prediction.find().sort({ createdAt: -1 }).limit(200),
    ]);

    const zoneNames = new Set([
        ...sensors.map((s) => s.zone),
        ...workers.map((w) => w.zone),
        ...predictions.map((p) => p.zone),
    ]);

    const zones = [...zoneNames].map((zoneName) => {
        const zoneSensors = sensors.filter((s) => s.zone === zoneName);
        const zoneWorkers = workers.filter((w) => w.zone === zoneName);
        const zonePredictions = predictions.filter((p) => p.zone === zoneName);

        const criticalSensors = zoneSensors.filter((s) => s.status === 'critical').length;
        const warningSensors = zoneSensors.filter((s) => s.status === 'warning').length;
        const criticalWorkers = zoneWorkers.filter((w) => w.status === 'critical').length;
        const latestPrediction = zonePredictions[0] || null;

        const sensorRisk = zoneSensors.length > 0 ? ((criticalSensors * 2 + warningSensors) / (zoneSensors.length * 2)) * 100 : 0;
        const workerRisk = zoneWorkers.length > 0 ? (criticalWorkers / zoneWorkers.length) * 100 : 0;
        const predictionRisk = latestPrediction ? latestPrediction.riskScore : 0;

        const fusedRisk = Math.round(Math.max(sensorRisk, workerRisk, predictionRisk));
        const riskLevel = fusedRisk >= 60 ? 'critical' : fusedRisk >= 30 ? 'warning' : 'safe';

        const activeSignals = [];
        if (criticalSensors > 0) activeSignals.push(`${criticalSensors} critical sensor(s)`);
        if (criticalWorkers > 0) activeSignals.push(`${criticalWorkers} worker(s) critical`);
        if (latestPrediction && latestPrediction.riskScore >= 35) {
            activeSignals.push(`AI predicted: ${latestPrediction.incident} (${latestPrediction.riskScore}%)`);
        }

        return {
            zone: zoneName,
            riskScore: fusedRisk,
            riskLevel,
            workerCount: zoneWorkers.length,
            criticalWorkers,
            sensorCount: zoneSensors.length,
            criticalSensors,
            warningSensors,
            latestPrediction: latestPrediction
                ? { incident: latestPrediction.incident, riskScore: latestPrediction.riskScore, recommendation: latestPrediction.recommendation }
                : null,
            compoundRiskActive: activeSignals.length >= 2,
            activeSignals,
        };
    });

    zones.sort((a, b) => b.riskScore - a.riskScore);

    return ApiResponse.success(res, zones);
});

module.exports = { getZoneRisk };
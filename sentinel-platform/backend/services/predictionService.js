const axios = require('axios');
const Prediction = require('../models/Prediction');
const logger = require('../utils/logger');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Calls the Python Flask ML microservice (predict.py) with sensor/permit/worker
 * derived features and returns a structured prediction. Persists the result too.
 */
const getPrediction = async (payload) => {
  try {
    const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, payload, {
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
    });

    const prediction = await Prediction.create({
      riskScore: data.riskScore,
      confidence: data.confidence,
      incident: data.predictedIncident,
      recommendation: data.recommendation,
      zone: data.zone,
      probability: data.probability,
      emergencyLevel: data.emergencyLevel,
      modelVersion: data.modelVersion,
      inputFeatures: payload,
      compoundRisk: data.compoundRisk || null,
    });

    // Mongoose document -> plain object, plus attach compoundRisk explicitly
    // in case the schema didn't have the field (keeps old DBs from breaking).
    const result = prediction.toObject();
    result.compoundRisk = data.compoundRisk || null;

    return result;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logger.error('ML service unreachable — is predict.py running on ' + ML_SERVICE_URL + '?');
      const err = new Error('AI prediction service is currently unavailable. Please ensure predict.py is running.');
      err.statusCode = 503;
      throw err;
    }
    throw error;
  }
};

module.exports = { getPrediction };
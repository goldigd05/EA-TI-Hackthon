const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    riskScore: { type: Number, required: true },
    confidence: { type: Number, required: true },
    incident: { type: String, required: true },
    recommendation: { type: String, required: true },
    zone: { type: String, required: true },
    probability: { type: Number, required: true },
    emergencyLevel: { type: String, enum: ['none', 'low', 'medium', 'high', 'critical'], default: 'none' },
    modelVersion: { type: String, default: 'v1.0-random-forest' },
    inputFeatures: { type: Object, default: {} },
    compoundRisk: { type: Object, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
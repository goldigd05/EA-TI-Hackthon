const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    heartRate: { type: Number, default: 75 },
    temperature: { type: Number, default: 36.6 },
    helmetDetected: { type: Boolean, default: true },
    oxygenLevel: { type: Number, default: 98 },
    riskScore: { type: Number, default: 0 },
    status: { type: String, enum: ['safe', 'warning', 'critical'], default: 'safe' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);

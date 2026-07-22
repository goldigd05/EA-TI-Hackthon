const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    prediction: { type: String, default: null },
    confidence: { type: Number, default: null },
    status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);

const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, unique: true },
    sensorType: {
      type: String,
      enum: ['temperature', 'gas', 'humidity', 'smoke', 'pressure', 'vibration'],
      required: true,
    },
    zone: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    status: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sensor', sensorSchema);

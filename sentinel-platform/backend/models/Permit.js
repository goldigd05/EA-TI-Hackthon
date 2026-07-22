const mongoose = require('mongoose');

const permitSchema = new mongoose.Schema(
  {
    permitId: { type: String, required: true, unique: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    permitType: {
      type: String,
      enum: ['hot_work', 'confined_space', 'height_work', 'electrical', 'excavation'],
      required: true,
    },
    zone: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending' },
    rejectionReason: { type: String, default: null },
    expiry: { type: Date, required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permit', permitSchema);

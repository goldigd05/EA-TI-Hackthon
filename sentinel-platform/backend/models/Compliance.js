const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true },
    checklistItem: { type: String, required: true },
    status: { type: String, enum: ['compliant', 'non_compliant', 'pending_review'], default: 'pending_review' },
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Compliance', complianceSchema);

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportType: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    filePath: { type: String, required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    summary: { type: Object, default: {} },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);

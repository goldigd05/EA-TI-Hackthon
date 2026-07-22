const path = require('path');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateReport } = require('../services/reportService');
const Report = require('../models/Report');

const getReports = asyncHandler(async (req, res) => {
  const type = req.query.type || 'daily';
  if (!['daily', 'weekly', 'monthly'].includes(type)) {
    return ApiResponse.error(res, 'Invalid report type. Use daily, weekly, or monthly.', 400);
  }

  const { filePath, fileName, summary, from, to } = await generateReport(type);

  await Report.create({
    reportType: type,
    filePath,
    generatedBy: req.user?._id,
    summary,
    dateFrom: from,
    dateTo: to,
  });

  return ApiResponse.success(res, {
    downloadUrl: `/api/reports/download/${fileName}`,
    summary,
  }, 'Report generated');
});

const downloadReport = asyncHandler(async (req, res) => {
  const filePath = path.join(__dirname, '../uploads/reports', req.params.fileName);
  res.download(filePath, (err) => {
    if (err) ApiResponse.error(res, 'Report file not found', 404);
  });
});

module.exports = { getReports, downloadReport };

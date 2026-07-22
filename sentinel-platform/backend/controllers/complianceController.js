const Compliance = require('../models/Compliance');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getCompliance = asyncHandler(async (req, res) => {
  const { zone, status } = req.query;
  const filter = {};
  if (zone) filter.zone = zone;
  if (status) filter.status = status;

  const records = await Compliance.find(filter).populate('inspector', 'name').sort({ date: -1 });

  const total = records.length;
  const compliant = records.filter((r) => r.status === 'compliant').length;
  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 100;

  return ApiResponse.success(res, { records, complianceRate });
});

module.exports = { getCompliance };

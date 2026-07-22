const ApiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  ApiResponse.error(res, `Route not found - ${req.originalUrl}`, 404);
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return ApiResponse.error(res, 'Validation Error', 400, errors);
  }

  if (err.code === 11000) {
    return ApiResponse.error(res, `Duplicate value for field: ${Object.keys(err.keyValue)}`, 400);
  }

  if (err.name === 'CastError') {
    return ApiResponse.error(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  return ApiResponse.error(res, err.message || 'Internal Server Error', err.statusCode || 500);
};

module.exports = { notFound, errorHandler };

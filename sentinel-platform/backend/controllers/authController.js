const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, zone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return ApiResponse.error(res, 'Email already registered', 400);

  const user = await User.create({ name, email, password, role: role || 'admin', zone });
  const token = generateToken(user._id);

  return ApiResponse.success(
    res,
    { token, user: { id: user._id, name: user.name, email: user.email, role: user.role, zone: user.zone } },
    'User registered successfully',
    201
  );
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return ApiResponse.error(res, 'Account is deactivated. Contact administrator.', 403);
  }

  const token = generateToken(user._id);

  return ApiResponse.success(res, {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, zone: user.zone },
  }, 'Login successful');
});

module.exports = { register, login };

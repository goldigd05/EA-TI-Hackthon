const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ read: false });
  return ApiResponse.success(res, { notifications, unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!updated) return ApiResponse.error(res, 'Notification not found', 404);
  return ApiResponse.success(res, updated, 'Marked as read');
});

module.exports = { getNotifications, markAsRead };

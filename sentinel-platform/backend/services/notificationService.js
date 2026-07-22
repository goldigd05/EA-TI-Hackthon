const Notification = require('../models/Notification');

const createNotification = async ({ title, message, priority = 'low', zone = 'ALL' }) => {
  return Notification.create({ title, message, priority, zone });
};

const getUnreadCount = async () => {
  return Notification.countDocuments({ read: false });
};

module.exports = { createNotification, getUnreadCount };

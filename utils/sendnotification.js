const Notification = require('../models/notification');

async function sendNotification(userId, message) {
  try {
    await Notification.create({ user: userId, message });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

module.exports = sendNotification;

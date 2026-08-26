const Notification = require('../models/notification');

exports.list = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    // mark as read
    await Notification.updateMany(
      { user: req.session.userId, read: false },
      { $set: { read: true } }
    );
    res.render('notifications', { notifications });
  } catch (err) {
    next(err);
  }
};

const HelpRequest = require('../models/HelpRequest');
const User = require('../models/user');
const Skill = require('../models/skill');
const sendNotification = require('../utils/sendnotification');

exports.list = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const received = await HelpRequest.find({ toUser: userId })
      .populate('fromUser', 'name')
      .populate('skill', 'name')
      .sort({ createdAt: -1 });
    const sent = await HelpRequest.find({ fromUser: userId })
      .populate('toUser', 'name')
      .populate('skill', 'name')
      .sort({ createdAt: -1 });
    res.render('requests', { received, sent });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const fromUserId = req.session.userId;
    const { toUserId, skillId, message } = req.body;
    if (!toUserId || !skillId || !message) {
      return res.status(400).send('Missing fields');
    }
    if (toUserId === fromUserId) {
      return res.status(400).send('Cannot request help from yourself');
    }
    const toUser = await User.findById(toUserId);
    const skill = await Skill.findById(skillId);
    if (!toUser || !skill) return res.status(404).send('User or skill not found');

    const reqDoc = await HelpRequest.create({
      fromUser: fromUserId,
      toUser: toUserId,
      skill: skillId,
      message: message.trim().slice(0, 500)
    });

    const fromUser = await User.findById(fromUserId);
    await sendNotification(
      toUserId,
      `${fromUser.name} requested help with ${skill.name}: "${message.trim().slice(0, 80)}${message.length > 80 ? '…' : ''}"`
    );

    res.redirect('/requests');
  } catch (err) {
    next(err);
  }
};

exports.respond = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const { action } = req.body;
    const request = await HelpRequest.findById(req.params.id)
      .populate('skill', 'name')
      .populate('fromUser', 'name');
    if (!request) return res.status(404).send('Request not found');
    if (request.toUser.toString() !== userId) {
      return res.status(403).send('Not authorized');
    }
    if (request.status !== 'Pending') {
      return res.redirect('/requests');
    }
    if (action === 'accept') {
      request.status = 'Accepted';
    } else if (action === 'decline') {
      request.status = 'Declined';
    } else {
      return res.status(400).send('Invalid action');
    }
    await request.save();

    const responder = await User.findById(userId);
    await sendNotification(
      request.fromUser._id || request.fromUser,
      `${responder.name} ${request.status.toLowerCase()} your request for help with ${request.skill.name}`
    );

    res.redirect('/requests');
  } catch (err) {
    next(err);
  }
};

const User = require('../models/user');
const Skill = require('../models/skill');
const UserSkill = require('../models/userskill');
const HelpRequest = require('../models/HelpRequest');
const { parseSkillList } = require('../Middleware/validate');

async function getUserSkills(userId) {
  const links = await UserSkill.find({ user: userId }).populate('skill');
  const canHelp = links.filter((l) => l.type === 'canHelp').map((l) => l.skill).filter(Boolean);
  const needHelp = links.filter((l) => l.type === 'needHelp').map((l) => l.skill).filter(Boolean);
  return { canHelp, needHelp };
}

async function syncSkills(userId, canHelpNames, needHelpNames) {
  await UserSkill.deleteMany({ user: userId });
  const allNames = [...new Set([...canHelpNames, ...needHelpNames])];
  for (const name of allNames) {
    let skill = await Skill.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!skill) skill = await Skill.create({ name });
    if (canHelpNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      await UserSkill.create({ user: userId, skill: skill._id, type: 'canHelp' });
    }
    if (needHelpNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
      await UserSkill.create({ user: userId, skill: skill._id, type: 'needHelp' });
    }
  }
}

exports.dashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth?mode=login');
    const { canHelp, needHelp } = await getUserSkills(user._id);

    const pendingReceived = await HelpRequest.find({ toUser: user._id, status: 'Pending' })
      .populate('fromUser', 'name')
      .populate('skill', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Suggest people who can help with skills the user needs
    let suggested = [];
    if (needHelp.length) {
      const needIds = needHelp.map((s) => s._id);
      const matches = await UserSkill.find({
        skill: { $in: needIds },
        type: 'canHelp',
        user: { $ne: user._id }
      })
        .populate('user', 'name title bio')
        .populate('skill', 'name')
        .limit(6);
      suggested = matches;
    }

    res.render('dashboard', {
      user,
      canHelp,
      needHelp,
      pendingReceived,
      suggested
    });
  } catch (err) {
    next(err);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth?mode=login');
    const { canHelp, needHelp } = await getUserSkills(user._id);
    res.render('profile', { user, canHelp, needHelp });
  } catch (err) {
    next(err);
  }
};

exports.editProfileForm = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth?mode=login');
    const { canHelp, needHelp } = await getUserSkills(user._id);
    res.render('edit-profile', {
      user,
      canHelpNames: canHelp.map((s) => s.name).join(', '),
      needHelpNames: needHelp.map((s) => s.name).join(', ')
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.redirect('/auth?mode=login');
    const { name, title, bio, avatarUrl, skillsCanHelp, skillsNeedHelp } = req.body;
    user.name = (name || user.name).trim();
    user.title = (title || '').trim();
    user.bio = (bio || '').slice(0, 400);
    user.avatarUrl = (avatarUrl || '').trim();
    await user.save();
    req.session.userName = user.name;

    await syncSkills(user._id, parseSkillList(skillsCanHelp), parseSkillList(skillsNeedHelp));
    res.redirect('/profile');
  } catch (err) {
    next(err);
  }
};

exports.userProfile = async (req, res, next) => {
  try {
    const profileUser = await User.findById(req.params.id);
    if (!profileUser) return res.status(404).send('User not found');
    const { canHelp, needHelp } = await getUserSkills(profileUser._id);
    const isOwn = req.session.userId === profileUser._id.toString();
    res.render('user-profile', {
      profileUser,
      canHelp,
      needHelp,
      isOwn
    });
  } catch (err) {
    next(err);
  }
};

exports.discover = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    let skill = null;
    let results = [];
    let popular = [];

    if (!q) {
      popular = await Skill.find().sort({ name: 1 }).limit(20);
    } else {
      skill = await Skill.findOne({ name: new RegExp(`^${q}$`, 'i') });
      if (!skill) {
        // try partial
        skill = await Skill.findOne({ name: new RegExp(q, 'i') });
      }
      if (skill) {
        const matches = await UserSkill.find({
          skill: skill._id,
          type: 'canHelp',
          user: { $ne: req.session.userId }
        })
          .populate('user', 'name title bio')
          .populate('skill', 'name')
          .limit(24);
        results = matches;
      }
    }

    res.render('discover', { q, skill, results, popular });
  } catch (err) {
    next(err);
  }
};

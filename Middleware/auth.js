function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth?mode=login');
  }
  next();
}

function guestOnly(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  next();
}

module.exports = { requireAuth, guestOnly };

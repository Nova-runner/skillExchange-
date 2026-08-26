const User = require('../models/user');

exports.showAuth = (req, res) => {
  const mode = req.query.mode === 'signup' ? 'signup' : 'login';
  res.render('auth', { mode, error: null });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.render('auth', { mode: 'signup', error: 'All fields are required.' });
    }
    if (password.length < 6) {
      return res.render('auth', { mode: 'signup', error: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.render('auth', { mode: 'signup', error: 'An account with that email already exists.' });
    }
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth', { mode: 'signup', error: 'Registration failed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('auth', { mode: 'login', error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth', { mode: 'login', error: 'Invalid email or password.' });
    }
    req.session.userId = user._id.toString();
    req.session.userName = user.name;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth', { mode: 'login', error: 'Login failed. Please try again.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

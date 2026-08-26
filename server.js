require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const connectDB = require('./config/db');
const errorHandler = require('./Middleware/error');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const requestRoutes = require('./routes/request');
const notificationRoutes = require('./routes/notification');

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'skillexchange_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
  })
);


app.use(async (req, res, next) => {
  res.locals.currentUserId = req.session.userId || null;
  res.locals.currentUserName = req.session.userName || null;
  next();
});

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('home', { user: null });
});

app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/', requestRoutes);
app.use('/', notificationRoutes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).send('Page not found — <a href="/">Go Home</a>');
});

app.listen(PORT, () => {
  console.log(`SkillExchange running on http://localhost:${PORT}`);
});

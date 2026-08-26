const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth');
const { guestOnly, requireAuth } = require('../Middleware/auth');

router.get('/', guestOnly, authCtrl.showAuth);
router.post('/register', guestOnly, authCtrl.register);
router.post('/login', guestOnly, authCtrl.login);
router.post('/logout', requireAuth, authCtrl.logout);
router.get('/logout', requireAuth, authCtrl.logout);

module.exports = router;

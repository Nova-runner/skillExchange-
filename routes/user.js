const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const { requireAuth } = require('../Middleware/auth');

router.get('/dashboard', requireAuth, userCtrl.dashboard);
router.get('/profile', requireAuth, userCtrl.profile);
router.get('/profile/edit', requireAuth, userCtrl.editProfileForm);
router.post('/profile', requireAuth, userCtrl.updateProfile);
router.get('/discover', requireAuth, userCtrl.discover);
router.get('/users/:id', requireAuth, userCtrl.userProfile);

module.exports = router;

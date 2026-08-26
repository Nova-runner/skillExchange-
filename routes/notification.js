const express = require('express');
const router = express.Router();
const notifCtrl = require('../controllers/notification');
const { requireAuth } = require('../Middleware/auth');

router.get('/notifications', requireAuth, notifCtrl.list);

module.exports = router;

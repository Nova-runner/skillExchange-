const express = require('express');
const router = express.Router();
const requestCtrl = require('../controllers/request');
const { requireAuth } = require('../Middleware/auth');

router.get('/requests', requireAuth, requestCtrl.list);
router.post('/requests', requireAuth, requestCtrl.create);
router.post('/requests/:id/respond', requireAuth, requestCtrl.respond);

module.exports = router;

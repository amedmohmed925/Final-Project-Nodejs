const express = require('express');
const router = express.Router();
const googleAuthController = require('../controllers/googleAuthController');

// تسجيل أو تسجيل دخول عبر جوجل
router.post('/google', googleAuthController.googleAuth);

module.exports = router;

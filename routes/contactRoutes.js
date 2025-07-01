// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// إرسال رسالة تواصل
router.post('/', contactController.sendContactMessage);

module.exports = router;

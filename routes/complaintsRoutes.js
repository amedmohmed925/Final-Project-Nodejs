const express = require('express');
const router = express.Router();
const complaintsController = require('../controllers/complaintsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// إرسال شكوى (طالب أو معلم)
router.post('/', authenticateToken, complaintsController.createComplaint);

module.exports = router;

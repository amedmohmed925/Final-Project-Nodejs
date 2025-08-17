// routes/student/liveSessionsStudentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken, isStudent } = require('../../middleware/authMiddleware');
const ctrl = require('../../controllers/student/liveSessionsStudentController');

// GET /api/v1/student/live-sessions
router.get('/', authenticateToken, isStudent, ctrl.myLiveSessions);

module.exports = router;

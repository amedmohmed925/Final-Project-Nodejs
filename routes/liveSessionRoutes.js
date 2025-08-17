// routes/liveSessionRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { isTeacher, isAdmin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/liveSessionController');

router.post('/', authenticateToken, isTeacher, ctrl.create);
router.patch('/:id', authenticateToken, isTeacher, ctrl.update);
router.patch('/:id/cancel', authenticateToken, isTeacher, ctrl.cancel);
router.get('/', authenticateToken, ctrl.list);
router.get('/:id', authenticateToken, ctrl.getOne);
router.post('/:id/start', authenticateToken, isTeacher, ctrl.start);
router.post('/:id/end', authenticateToken, isTeacher, ctrl.end);
router.get('/:id/ice', authenticateToken, ctrl.getIceServers);

module.exports = router;

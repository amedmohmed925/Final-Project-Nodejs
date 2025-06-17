// routes/teacher/progressTeacherRoutes.js
const express = require('express');
const router = express.Router();
const progressTeacherController = require('../../controllers/teacher/progressTeacherController');
const { isTeacher } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: TeacherProgress
 *   description: تتبع تقدم الطلاب في كورسات المعلم
 */

/**
 * @swagger
 * /v1/teacher/progress:
 *   get:
 *     summary: إحصائيات تقدم الطلاب في كورس
 *     tags: [TeacherProgress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: رقم الكورس
 *     responses:
 *       200:
 *         description: إحصائيات التقدم
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 */

// Get course progress stats
router.get('/', isTeacher, progressTeacherController.courseProgressStats);

module.exports = router;

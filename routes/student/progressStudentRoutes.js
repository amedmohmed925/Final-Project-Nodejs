// routes/student/progressStudentRoutes.js
const express = require('express');
const router = express.Router();
const progressStudentController = require('../../controllers/student/progressStudentController');
const { isStudent } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: StudentProgress
 *   description: تتبع التقدم في الكورسات للطالب
 */

/**
 * @swagger
 * /v1/student/progress:
 *   get:
 *     summary: عرض تقدم الطالب في كورس معين
 *     tags: [StudentProgress]
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
 *         description: تفاصيل التقدم
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 */

// Get my progress in a course
router.get('/', isStudent, progressStudentController.myCourseProgress);

module.exports = router;

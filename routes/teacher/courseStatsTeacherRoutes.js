// routes/teacher/courseStatsTeacherRoutes.js
const express = require('express');
const router = express.Router();
const courseStatsTeacherController = require('../../controllers/teacher/courseStatsTeacherController');
const { isTeacher } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: TeacherCourseStats
 *   description: إحصائيات الكورس للمعلم
 */

/**
 * @swagger
 * /v1/teacher/course-stats:
 *   get:
 *     summary: إحصائيات الكورس (عدد الطلاب، متوسط التقييم، نسبة الإنجاز)
 *     tags: [TeacherCourseStats]
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
 *         description: إحصائيات الكورس
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 */

// Get course statistics
router.get('/', isTeacher, courseStatsTeacherController.getCourseStats);

module.exports = router;

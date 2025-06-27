// routes/teacher/feedbackTeacherRoutes.js
const express = require('express');
const router = express.Router();
const feedbackTeacherController = require('../../controllers/teacher/feedbackTeacherController');
const { isTeacher } = require('../../middleware/roleMiddleware');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: TeacherFeedbacks
 *   description: إدارة تقييمات الطلاب وردود المعلم
 */

/**
 * @swagger
 * /v1/teacher/feedbacks:
 *   get:
 *     summary: عرض جميع تقييمات كورس للمعلم
 *     tags: [TeacherFeedbacks]
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
 *         description: قائمة التقييمات
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 *
 * /v1/teacher/feedbacks/{feedbackId}/reply:
 *   post:
 *     summary: رد المعلم على تقييم طالب
 *     tags: [TeacherFeedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reply:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم إضافة الرد
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: التقييم غير موجود
 *
 * /v1/teacher/feedbacks/{feedbackId}/toggle:
 *   patch:
 *     summary: إظهار/إخفاء تقييم طالب
 *     tags: [TeacherFeedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم التحديث
 *       404:
 *         description: التقييم غير موجود
 */

// List feedbacks for a course
router.get('/',authenticateToken,  isTeacher, feedbackTeacherController.listCourseFeedbacks);
// Reply to feedback
router.post('/:feedbackId/reply', authenticateToken, isTeacher, feedbackTeacherController.replyToFeedback);
// Toggle feedback visibility
router.patch('/:feedbackId/toggle', authenticateToken, isTeacher, feedbackTeacherController.toggleFeedbackVisibility);

module.exports = router;

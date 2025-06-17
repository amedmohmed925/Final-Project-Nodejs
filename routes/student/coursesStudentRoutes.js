// routes/student/coursesStudentRoutes.js
const express = require('express');
const router = express.Router();
const coursesStudentController = require('../../controllers/student/coursesStudentController');
const { isStudent } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: StudentCourses
 *   description: إدارة اشتراكات الطالب في الكورسات
 */

/**
 * @swagger
 * /v1/student/courses:
 *   get:
 *     summary: عرض جميع الكورسات المشترك بها الطالب
 *     tags: [StudentCourses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الكورسات
 *   delete:
 *     summary: إلغاء الاشتراك في كورس
 *     tags: [StudentCourses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم إلغاء الاشتراك
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 */

// Get my courses
router.get('/', isStudent, coursesStudentController.myCourses);
// Unsubscribe from a course
router.delete('/', isStudent, coursesStudentController.unsubscribe);

module.exports = router;

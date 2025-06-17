// routes/teacher/studentsTeacherRoutes.js
const express = require('express');
const router = express.Router();
const studentsTeacherController = require('../../controllers/teacher/studentsTeacherController');
const { isTeacher } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: TeacherStudents
 *   description: إدارة الطلاب في كورسات المعلم
 */

/**
 * @swagger
 * /v1/teacher/students:
 *   get:
 *     summary: عرض جميع الطلاب المسجلين في كورس للمعلم
 *     tags: [TeacherStudents]
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
 *         description: قائمة الطلاب
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 *   delete:
 *     summary: حذف طالب من الكورس
 *     tags: [TeacherStudents]
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
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم حذف الطالب
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس أو الطالب غير موجود
 *
 * /v1/teacher/students/progress:
 *   get:
 *     summary: عرض تقدم طالب في كورس
 *     tags: [TeacherStudents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تفاصيل التقدم
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس أو الطالب غير موجود
 */

// List students in a course
router.get('/', isTeacher, studentsTeacherController.listStudents);
// Remove student from course
router.delete('/', isTeacher, studentsTeacherController.removeStudent);
// Get student progress in course
router.get('/progress', isTeacher, studentsTeacherController.getStudentProgress);

module.exports = router;

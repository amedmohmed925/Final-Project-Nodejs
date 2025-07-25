// routes/teacher/resourcesTeacherRoutes.js
const express = require('express');
const router = express.Router();
const resourcesTeacherController = require('../../controllers/teacher/resourcesTeacherController');
const { isTeacher } = require('../../middleware/roleMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: TeacherResources
 *   description: إدارة المواد الإضافية (ملفات/روابط) للمعلم
 */

/**
 * @swagger
 * /v1/teacher/resources:
 *   post:
 *     summary: إضافة مادة إضافية (ملف أو رابط) للكورس
 *     tags: [TeacherResources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [file, link]
 *               url:
 *                 type: string
 *                 description: "مطلوب إذا كان النوع link"
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "مطلوب إذا كان النوع file"
 *     responses:
 *       201:
 *         description: تم إضافة المادة
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 *   get:
 *     summary: عرض جميع المواد الإضافية لكورس
 *     tags: [TeacherResources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: قائمة المواد
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود
 *
 * /v1/teacher/resources/{id}:
 *   delete:
 *     summary: حذف مادة إضافية
 *     tags: [TeacherResources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: تم الحذف بنجاح
 *       404:
 *         description: المادة غير موجودة
 */

// Add resource (file or link)
router.post('/', isTeacher, upload.single('file'), resourcesTeacherController.addResource);
// List resources for a course
router.get('/', isTeacher, resourcesTeacherController.listResources);
// Delete resource
router.delete('/:id', isTeacher, resourcesTeacherController.deleteResource);

module.exports = router;

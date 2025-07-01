// routes/student/favoritesStudentRoutes.js
const express = require('express');
const router = express.Router();
const favoritesStudentController = require('../../controllers/student/favoritesStudentController');
const { isStudent } = require('../../middleware/roleMiddleware');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: StudentFavorites
 *   description: إدارة المفضلة للطالب
 */

/**
 * @swagger
 * /v1/student/favorites:
 *   get:
 *     summary: عرض قائمة المفضلة
 *     tags: [StudentFavorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الكورسات المفضلة
 *   post:
 *     summary: إضافة كورس إلى المفضلة
 *     tags: [StudentFavorites]
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
 *       201:
 *         description: تم الإضافة للمفضلة
 *       400:
 *         description: خطأ في البيانات
 *       409:
 *         description: الكورس موجود بالفعل في المفضلة
 *   delete:
 *     summary: حذف كورس من المفضلة
 *     tags: [StudentFavorites]
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
 *         description: تم الحذف من المفضلة
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكورس غير موجود في المفضلة
 */

// List favorites
router.get('/',authenticateToken, isStudent, favoritesStudentController.listFavorites);
// Add to favorites
router.post('/',authenticateToken, isStudent, favoritesStudentController.addFavorite);
// Remove from favorites
router.delete('/',authenticateToken, isStudent, favoritesStudentController.removeFavorite);

module.exports = router;

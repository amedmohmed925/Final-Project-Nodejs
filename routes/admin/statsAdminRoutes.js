// routes/admin/statsAdminRoutes.js
const express = require('express');
const router = express.Router();
const statsAdminController = require('../../controllers/admin/statsAdminController');
const { isAdmin } = require('../../middleware/roleMiddleware');
const { authenticateToken } = require('../../middleware/authMiddleware');
/**
 * @swagger
 * tags:
 *   name: AdminStats
 *   description: إحصائيات لوحة تحكم الأدمن
 */

/**
 * @swagger
 * /v1/admin/stats/dashboard:
 *   get:
 *     summary: إحصائيات لوحة التحكم الرئيسية
 *     tags: [AdminStats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: إحصائيات النظام (مستخدمين، كورسات، إيرادات، شكاوى، كوبونات)
 */

// Dashboard statistics
router.get('/dashboard',authenticateToken, isAdmin, statsAdminController.getDashboardStats);
router.get('/pending-courses-count', authenticateToken, isAdmin, statsAdminController.getPendingCoursesCount); // Endpoint to fetch count of pending courses
router.get('/pending-course/:courseId', authenticateToken, isAdmin, statsAdminController.getPendingCourseById); // Endpoint to fetch a single pending course by ID

module.exports = router;

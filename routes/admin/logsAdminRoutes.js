// routes/admin/logsAdminRoutes.js
const express = require('express');
const router = express.Router();
const logsAdminController = require('../../controllers/admin/logsAdminController');
const { isAdmin } = require('../../middleware/roleMiddleware');
const { authenticateToken } = require('../../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: AdminLogs
 *   description: إدارة سجل النشاطات (Admin)
 */

/**
 * @swagger
 * /v1/admin/logs:
 *   get:
 *     summary: عرض/بحث سجل النشاطات
 *     tags: [AdminLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: بحث بالنص
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: رقم المستخدم
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: نوع الإجراء
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: عدد النتائج
 *     responses:
 *       200:
 *         description: قائمة السجلات
 *   delete:
 *     summary: حذف جميع السجلات
 *     tags: [AdminLogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم حذف جميع السجلات
 *
 * /v1/admin/logs/{id}:
 *   get:
 *     summary: عرض تفاصيل سجل
 *     tags: [AdminLogs]
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
 *         description: تفاصيل السجل
 *       404:
 *         description: السجل غير موجود
 *   delete:
 *     summary: حذف سجل محدد
 *     tags: [AdminLogs]
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
 *         description: السجل غير موجود
 */

// List/search logs
router.get('/',authenticateToken,  isAdmin, logsAdminController.listLogs);
// Get single log
router.get('/:id',authenticateToken,  isAdmin, logsAdminController.getLog);
// Delete single log
router.delete('/:id',authenticateToken,  isAdmin, logsAdminController.deleteLog);
// Clear all logs
router.delete('/',authenticateToken,  isAdmin, logsAdminController.clearLogs);

module.exports = router;

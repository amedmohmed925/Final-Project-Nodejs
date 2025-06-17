// routes/admin/complaintsAdminRoutes.js
const express = require('express');
const router = express.Router();
const complaintsAdminController = require('../../controllers/admin/complaintsAdminController');
const { isAdmin } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: AdminComplaints
 *   description: إدارة الشكاوى (Admin)
 */

/**
 * @swagger
 * /v1/admin/complaints:
 *   get:
 *     summary: عرض/بحث جميع الشكاوى
 *     tags: [AdminComplaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: بحث بالنص
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, closed]
 *         description: حالة الشكوى
 *     responses:
 *       200:
 *         description: قائمة الشكاوى
 *
 * /v1/admin/complaints/{id}:
 *   get:
 *     summary: عرض تفاصيل شكوى
 *     tags: [AdminComplaints]
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
 *         description: تفاصيل الشكوى
 *       404:
 *         description: الشكوى غير موجودة
 *   delete:
 *     summary: حذف شكوى
 *     tags: [AdminComplaints]
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
 *         description: الشكوى غير موجودة
 *
 * /v1/admin/complaints/{id}/status:
 *   patch:
 *     summary: تحديث حالة الشكوى
 *     tags: [AdminComplaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, closed]
 *     responses:
 *       200:
 *         description: تم التحديث بنجاح
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الشكوى غير موجودة
 */

// List/search complaints
router.get('/', isAdmin, complaintsAdminController.listComplaints);
// Get single complaint
router.get('/:id', isAdmin, complaintsAdminController.getComplaint);
// Update complaint status
router.patch('/:id/status', isAdmin, complaintsAdminController.updateStatus);
// Delete complaint
router.delete('/:id', isAdmin, complaintsAdminController.deleteComplaint);

module.exports = router;

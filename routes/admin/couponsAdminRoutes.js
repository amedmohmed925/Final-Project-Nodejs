// routes/admin/couponsAdminRoutes.js
const express = require('express');
const router = express.Router();
const couponsAdminController = require('../../controllers/admin/couponsAdminController');
const { isAdmin } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: AdminCoupons
 *   description: إدارة الكوبونات (Admin)
 */

/**
 * @swagger
 * /v1/admin/coupons:
 *   post:
 *     summary: إنشاء كوبون جديد
 *     tags: [AdminCoupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               usageLimit:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم إنشاء الكوبون
 *       400:
 *         description: خطأ في البيانات
 *       409:
 *         description: الكود مستخدم مسبقًا
 *   get:
 *     summary: عرض/بحث جميع الكوبونات
 *     tags: [AdminCoupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: بحث بالكود
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: حالة التفعيل
 *     responses:
 *       200:
 *         description: قائمة الكوبونات
 *
 * /v1/admin/coupons/{id}:
 *   get:
 *     summary: عرض كوبون محدد
 *     tags: [AdminCoupons]
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
 *         description: تفاصيل الكوبون
 *       404:
 *         description: الكوبون غير موجود
 *   put:
 *     summary: تعديل كوبون
 *     tags: [AdminCoupons]
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
 *               code:
 *                 type: string
 *               discount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               usageLimit:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم التعديل بنجاح
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الكوبون غير موجود
 *   delete:
 *     summary: حذف كوبون
 *     tags: [AdminCoupons]
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
 *         description: الكوبون غير موجود
 *
 * /v1/admin/coupons/{id}/toggle:
 *   patch:
 *     summary: تفعيل/تعطيل الكوبون
 *     tags: [AdminCoupons]
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
 *         description: تم التحديث بنجاح
 *       404:
 *         description: الكوبون غير موجود
 */

// Create coupon
router.post('/', isAdmin, couponsAdminController.createCoupon);
// Update coupon
router.put('/:id', isAdmin, couponsAdminController.updateCoupon);
// Delete coupon
router.delete('/:id', isAdmin, couponsAdminController.deleteCoupon);
// Get single coupon
router.get('/:id', isAdmin, couponsAdminController.getCoupon);
// List/search coupons
router.get('/', isAdmin, couponsAdminController.listCoupons);
// Toggle coupon status
router.patch('/:id/toggle', isAdmin, couponsAdminController.toggleCouponStatus);

module.exports = router;

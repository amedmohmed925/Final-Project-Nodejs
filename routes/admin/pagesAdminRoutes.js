// routes/admin/pagesAdminRoutes.js
const express = require('express');
const router = express.Router();
const pagesAdminController = require('../../controllers/admin/pagesAdminController');
const { isAdmin } = require('../../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: AdminPages
 *   description: إدارة الصفحات الثابتة (Admin)
 */

/**
 * @swagger
 * /v1/admin/pages:
 *   post:
 *     summary: إنشاء صفحة ثابتة جديدة
 *     tags: [AdminPages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: تم إنشاء الصفحة بنجاح
 *       400:
 *         description: خطأ في البيانات
 *       409:
 *         description: السلاج مستخدم مسبقًا
 *
 *   get:
 *     summary: عرض/بحث جميع الصفحات الثابتة
 *     tags: [AdminPages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: بحث بالعنوان
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: حالة التفعيل
 *     responses:
 *       200:
 *         description: قائمة الصفحات
 *
 * /v1/admin/pages/{id}:
 *   get:
 *     summary: عرض صفحة ثابتة محددة
 *     tags: [AdminPages]
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
 *         description: تفاصيل الصفحة
 *       404:
 *         description: الصفحة غير موجودة
 *
 *   put:
 *     summary: تعديل صفحة ثابتة
 *     tags: [AdminPages]
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
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: تم التعديل بنجاح
 *       400:
 *         description: خطأ في البيانات
 *       404:
 *         description: الصفحة غير موجودة
 *
 *   delete:
 *     summary: حذف صفحة ثابتة
 *     tags: [AdminPages]
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
 *         description: الصفحة غير موجودة
 */

// Create page
router.post('/', isAdmin, pagesAdminController.createPage);
// Update page
router.put('/:id', isAdmin, pagesAdminController.updatePage);
// Delete page
router.delete('/:id', isAdmin, pagesAdminController.deletePage);
// Get single page
router.get('/:id', isAdmin, pagesAdminController.getPage);
// List/search pages
router.get('/', isAdmin, pagesAdminController.listPages);

module.exports = router;

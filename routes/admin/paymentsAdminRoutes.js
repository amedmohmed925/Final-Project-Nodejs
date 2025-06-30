// routes/admin/paymentsAdminRoutes.js
const express = require('express');
const router = express.Router();
const paymentAdminController = require('../../controllers/admin/paymentAdminController');
const { isAdmin } = require('../../middleware/roleMiddleware');
const { authenticateToken } = require('../../middleware/authMiddleware');

// جلب جميع عمليات الدفع مع فلاتر بحث
router.get('/', authenticateToken, isAdmin, paymentAdminController.listPayments);

// جلب عملية دفع واحدة
router.get('/:id', authenticateToken, isAdmin, paymentAdminController.getPayment);

// حذف عملية دفع واحدة
router.delete('/:id', authenticateToken, isAdmin, paymentAdminController.deletePayment);

// حذف جميع عمليات الدفع
router.delete('/', authenticateToken, isAdmin, paymentAdminController.clearPayments);

module.exports = router;

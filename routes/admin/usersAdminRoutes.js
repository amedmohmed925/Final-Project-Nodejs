// routes/admin/usersAdminRoutes.js
const express = require('express');
const router = express.Router();
const userAdminController = require('../../controllers/admin/userAdminController');
const { isAdmin } = require('../../middleware/roleMiddleware');
const { authenticateToken } = require('../../middleware/authMiddleware');

// جلب جميع المعلمين
router.get('/teachers', authenticateToken, isAdmin, userAdminController.getAllTeachers);

// جلب جميع الطلاب
router.get('/students', authenticateToken, isAdmin, userAdminController.getAllStudents);

// تفعيل حساب مستخدم
router.patch('/activate/:id', authenticateToken, isAdmin, userAdminController.activateUser);

// تعطيل حساب مستخدم
router.patch('/deactivate/:id', authenticateToken, isAdmin, userAdminController.deactivateUser);

// تغيير دور مستخدم
router.patch('/role/:id', authenticateToken, isAdmin, userAdminController.changeUserRole);

// حذف مستخدم
router.delete('/:id', authenticateToken, isAdmin, userAdminController.deleteUserByAdmin);

// بحث متقدم عن المستخدمين
router.get('/search/advanced', authenticateToken, isAdmin, userAdminController.advancedUserSearch);


module.exports = router;

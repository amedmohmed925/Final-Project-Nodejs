// routes/student/certificatesStudentRoutes.js
const express = require("express");
const router = express.Router();
const certificatesStudentController = require("../../controllers/student/certificatesStudentController");
const { isStudent } = require("../../middleware/roleMiddleware");
const { authenticateToken } = require("../../middleware/authMiddleware");
/**
 * @swagger
 * tags:
 *   name: StudentCertificates
 *   description: إدارة الشهادات للطالب
 */

/**
 * @swagger
 * /v1/student/certificates:
 *   get:
 *     summary: عرض جميع الشهادات الخاصة بالطالب
 *     tags: [StudentCertificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة الشهادات
 *
 * /v1/student/certificates/{id}:
 *   get:
 *     summary: عرض شهادة محددة
 *     tags: [StudentCertificates]
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
 *         description: تفاصيل الشهادة
 *       404:
 *         description: الشهادة غير موجودة
 */

// List certificates
router.get(
  "/",
  authenticateToken,
  isStudent,
  certificatesStudentController.listCertificates
);
router.post(
  "/",
  authenticateToken,
  isStudent,
  certificatesStudentController.createCertificate
);
// Get single certificate
router.get(
  "/:id",
  authenticateToken,
  isStudent,
  certificatesStudentController.getCertificate
);

module.exports = router;

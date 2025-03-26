// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const { createNotification, getUserNotifications, markNotificationAsRead, deleteNotification } = require("../controllers/notificationController");

router.post("/create", authenticateToken, isAdmin, createNotification);
router.get("/my-notifications", authenticateToken, getUserNotifications);
router.put("/mark-read/:notificationId", authenticateToken, markNotificationAsRead);
router.delete("/delete/:notificationId", authenticateToken, deleteNotification); // مسار الحذف

module.exports = router;
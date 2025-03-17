// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { createPayment } = require("../controllers/paymentController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/create-payment", authenticateToken ,createPayment);

module.exports = router;
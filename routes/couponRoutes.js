const express = require("express");
const router = express.Router();
const { createCoupon, getAdvertiserCoupons, getAdminCouponReport } = require("../controllers/couponController");
const { authenticateToken } = require("../middleware/authMiddleware");


router.post("/create", authenticateToken, createCoupon);
router.get("/advertiser", authenticateToken, getAdvertiserCoupons);
router.get("/admin-report", authenticateToken, getAdminCouponReport);

module.exports = router;
// controllers/couponController.js
const Coupon = require("../models/Coupon");
const Cart = require("../models/Cart");
const mongoose = require("mongoose");

// إنشاء كوبون جديد
const createCoupon = async (req, res) => {
  const advertiserId = req.user.id; // من الـ JWT token

  try {
    // التحقق من أن المستخدم معلن
    if (req.user.role !== "advertiser") {
      return res.status(403).json({ message: "Only advertisers can create coupons" });
    }

    // التحقق من الحد الأقصى للكوبونات (3)
    const existingCoupons = await Coupon.countDocuments({ advertiserId });
    if (existingCoupons >= 3) {
      return res.status(400).json({ message: "Maximum limit of 3 coupons reached" });
    }

    // إنشاء كود فريد (مثال: ADV-1234)
    const randomCode = `ADV-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // أسبوع من الآن

    const coupon = new Coupon({
      code: randomCode,
      advertiserId,
      expiresAt,
    });

    await coupon.save();
    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to create coupon", error: error.message });
  }
};

// جلب كوبونات المعلن مع عدد الاستخدامات
const getAdvertiserCoupons = async (req, res) => {
  const advertiserId = req.user.id;

  try {
    if (req.user.role !== "advertiser") {
      return res.status(403).json({ message: "Only advertisers can view their coupons" });
    }

    const coupons = await Coupon.find({ advertiserId });
    const couponsWithUsage = await Promise.all(
      coupons.map(async (coupon) => {
        const usageCount = await Cart.countDocuments({ discount: { $gt: 0 }, "items.courseId": { $exists: true } });
        return { ...coupon._doc, usageCount };
      })
    );

    res.status(200).json(couponsWithUsage);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve coupons", error: error.message });
  }
};

// جلب تقرير للأدمن (كل المعلنين وكوبوناتهم وعمليات الشراء)
const getAdminCouponReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can view this report" });
    }

    const advertisers = await mongoose.model("User").find({ role: "advertiser" });
    const report = await Promise.all(
      advertisers.map(async (advertiser) => {
        const coupons = await Coupon.find({ advertiserId: advertiser._id });
        const couponDetails = await Promise.all(
          coupons.map(async (coupon) => {
            const usageCount = await Cart.countDocuments({ discount: { $gt: 0 }, "items.courseId": { $exists: true } });
            return { code: coupon.code, usageCount };
          })
        );
        const totalPurchases = couponDetails.reduce((sum, c) => sum + c.usageCount, 0);
        return {
          advertiser: { id: advertiser._id, username: advertiser.username },
          coupons: couponDetails,
          totalPurchases,
        };
      })
    );

    const totalAffiliatePurchases = report.reduce((sum, r) => sum + r.totalPurchases, 0);
    res.status(200).json({ report, totalAffiliatePurchases });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve report", error: error.message });
  }
};

module.exports = {
    createCoupon,
    getAdvertiserCoupons,
    getAdminCouponReport,
  };
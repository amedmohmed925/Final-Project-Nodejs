// models/CouponUsage.js
const mongoose = require("mongoose");

const couponUsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  couponCode: { type: String, required: true },
  usedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CouponUsage", couponUsageSchema);
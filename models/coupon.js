// models/Coupon.js
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // كود الخصم
  advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // المعلن المرتبط
  discount: { type: Number, default: 10 }, // نسبة الخصم 10% فقط
  usageCount: { type: Number, default: 0 }, // عدد مرات الاستخدام
  createdAt: { type: Date, default: Date.now }, // تاريخ الإنشاء
  expiresAt: { type: Date, required: true }, // تاريخ الانتهاء (أسبوع من الإنشاء)
});

module.exports = mongoose.model("Coupon", couponSchema);
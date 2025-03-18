const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // للمستخدم المحدد (اختياري)
  type: { type: String, enum: ["like", "comment", "group_invite", "new_post", "admin_broadcast"], required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID البوست أو التعليق أو المجموعة
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  broadcastTo: { type: String, enum: ["all", "students", "teachers"], default: "all" }, // للـ Admin
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipientType: {
    type: String,
    enum: ["all", "teachers", "students", "advertisers"],
    required: true,
  },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // لتحديد مستخدمين محددين إذا لزم
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // الأدمن الذي أرسل
  isRead: { type: Boolean, default: false },
  emailSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
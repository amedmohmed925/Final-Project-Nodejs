const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  reply: { type: String, default: '' }, // رد المعلم على التقييم
  visible: { type: Boolean, default: true }, // إظهار/إخفاء التقييم
});

module.exports = mongoose.model("Feedback", feedbackSchema);
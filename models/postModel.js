const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  media: { type: String }, // رابط لصورة أو فيديو
  type: { type: String, enum: ["question", "post", "resource"], default: "post" }, // نوع البوست
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // المستخدمين اللي عملوا لايك
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // لو البوست في مجموعة
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // ربط بالكورس
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
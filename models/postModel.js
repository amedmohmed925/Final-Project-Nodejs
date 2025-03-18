const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  media: { type: String },
  type: { type: String, enum: ["question", "post", "resource"], default: "post" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  isPinned: { type: Boolean, default: false }, // لتثبيت البوستات المهمة
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
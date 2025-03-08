const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
  completed: { type: Boolean, default: false },
  progressPercentage: { type: Number, default: 0 },
  lastAccessedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
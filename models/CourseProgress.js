const mongoose = require("mongoose");

const lessonProgressSchema = new mongoose.Schema({
  lessonIndex: { type: Number, required: true }, // مؤشر الدرس داخل القسم
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const sectionProgressSchema = new mongoose.Schema({
  sectionIndex: { type: Number, required: true }, // مؤشر القسم داخل الدورة
  lessons: [lessonProgressSchema],
});

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  sections: [sectionProgressSchema],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
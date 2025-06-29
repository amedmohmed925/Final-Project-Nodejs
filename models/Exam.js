const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  title: { type: String, required: true },
  // startTime/endTime removed: الامتحان يظهر حسب تقدم الطالب وليس حسب تاريخ محدد
  duration: { type: Number, required: true }, // بالدقائق
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Exam", examSchema);

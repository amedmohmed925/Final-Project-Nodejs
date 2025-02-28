//schema feedback
const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
}, { timestamps: true });
const Feedback = mongoose.model("Feedback", FeedbackSchema);

module.exports = {Feedback}

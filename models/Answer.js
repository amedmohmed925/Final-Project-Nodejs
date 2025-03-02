//schema answer
const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema({
  content: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  //questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  questionId: { type: String, ref: "Question", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Answer", AnswerSchema);

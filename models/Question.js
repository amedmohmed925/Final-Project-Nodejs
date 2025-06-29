const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  type: { type: String, enum: ['true_false', 'multiple_choice'], required: true },
  text: { type: String, required: true },
  options: [{ type: String }], // 4 خيارات لو اختيار متعدد
  // correctAnswer: نص الخيار الصحيح (وليس رقم الindex)
  correctAnswer: { type: String, required: true }
});

module.exports = mongoose.model('Question', questionSchema);
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  quizID: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Question', questionSchema);
const Question = require('../models/Question');


exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.addQuestion = async (req, res) => {
  const { content, quizID } = req.body;
  try {
    const newQuestion = new Question({ content, quizID });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.updateQuestion = async (req, res) => {
  const { content } = req.body;
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );
    if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(updatedQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
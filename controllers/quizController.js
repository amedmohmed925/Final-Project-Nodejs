const Quiz = require('../models/Quiz');


exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.id });
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
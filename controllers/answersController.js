
const { Answer } = require("../models/Answer");

const getAllAnswers = async (req, res) => {
  try {
    const answers = await Answer.find();
    res.status(200).json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAnswerById = async (req, res) => {
  try {
    const answer = await Answer.findOne({ _id: req.params._id });
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
};

const addAnswer = async (req, res) => {
  try {
    const { content, isCorrect, questionId } = req.body;
    if (!content || isCorrect === undefined || !questionId) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const answer = new Answer({ content, isCorrect, questionId });
    await answer.save();
    res.status(201).json(answer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    if (!_id) {
      return res.status(400).json({ error: "id is required" });
    }
    const answer = await Answer.findOneAndUpdate({ _id }, updateData, { new: true });
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.status(200).json(answer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ error: "id is required" });
    }
    const answer = await Answer.findOne({ _id });
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    await answer.deleteOne();
    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAnswers,
  getAnswerById,
  addAnswer,
  updateAnswer,
  deleteAnswer,
};
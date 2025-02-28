//feedback controller
const { Feedback } = require("../models/Feedback");

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ _id: req.params._id }); 
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addFeedback = async (req, res) => {
  try {
    const { userId, courseId, comment, rating } = req.body;

    if (!userId || !courseId || !comment || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (rating < 1 || rating > 10) {
      return res.json({ error: "Rating must be a number between 1 and 10" });
    }

    const feedback = new Feedback({ userId, courseId, comment, rating });
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.json({ error: err.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { _id, rating, ...updateData } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "id is required" });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 10" });
    }

    const feedback = await Feedback.findOneAndUpdate({ _id }, updateData, { new: true });
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    res.json(feedback);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ error: "id is required" });
    }

    const feedback = await Feedback.findOne({ _id });
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    await feedback.deleteOne();
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllFeedbacks,
  getFeedbackById,
  addFeedback,
  updateFeedback,
  deleteFeedback,
};

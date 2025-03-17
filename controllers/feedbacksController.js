
const  Feedback  = require("../models/Feedback");

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeedbacksByCourseId = async (req, res) => {
  try {
    console.log("Feedback model:", Feedback); // Debug: Check if Feedback is defined
    console.log("Course ID:", req.params.courseId);
    const feedbacks = await Feedback.find({ courseId: req.params.courseId }).populate("userId", "firstName lastName");
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
    const { courseId, comment, rating } = req.body;
    const userId = req.user?.id; // Use optional chaining to avoid errors if req.user is undefined

    console.log("Request Body:", req.body);
    console.log("req.user:", req.user);
    console.log("User ID:", userId);

    if (!userId || !courseId || !comment || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    const feedback = new Feedback({ userId, courseId, comment, rating });
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    console.error("Error in addFeedback:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body; // Only allow updating comment and rating
    const id = req.params.id; // Use params instead of body for ID
    console.log("Feedback ID:", id);
    console.log("User ID from token:", req.user.id);
    console.log("Body:", req.body);
    if (!id) {
      return res.status(400).json({ error: "Feedback ID is required" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5" });
    }

    // استخدم _id بدل id في الاستعلام
    const feedback = await Feedback.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Ensure only the owner can update, and use _id
      { comment, rating },
      { new: true }
    );
    console.log("Updated feedback:", feedback); // Debug: Check the returned document

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found or unauthorized" });
    }

    res.json(feedback);
  } catch (err) {
    console.error("Error in updateFeedback:", err);
    res.status(400).json({ error: err.message });
  }
};
const deleteFeedback = async (req, res) => {
  try {
    const _id = req.params._id; // Use params instead of body

    if (!_id) {
      return res.status(400).json({ error: "Feedback ID is required" });
    }

    const feedback = await Feedback.findOneAndDelete({ _id, userId: req.user._id }); // Ensure only owner can delete
    if (!feedback) return res.status(404).json({ message: "Feedback not found or unauthorized" });

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
  getFeedbacksByCourseId
};
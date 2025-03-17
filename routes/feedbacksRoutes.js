// Backend: routes/feedback.js
const express = require("express");
const router = express.Router();
const { getFeedbacksByCourseId, addFeedback, updateFeedback, deleteFeedback } = require("../controllers/feedbacksController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/course/:courseId", getFeedbacksByCourseId);
router.post("/", authenticateToken , addFeedback);
router.put("/:id", authenticateToken ,updateFeedback);
router.delete("/:_id",authenticateToken , deleteFeedback);

module.exports = router;
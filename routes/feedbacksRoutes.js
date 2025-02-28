//feedbacks routes
const express = require("express");
const router = express.Router();
const {getAllFeedbacks, getFeedbackById, addFeedback, updateFeedback, deleteFeedback} = require("../controllers/feedbacksController");

router.get("/", getAllFeedbacks);
router.get("/:_id", getFeedbackById);
router.post("/add", addFeedback);
router.put("/update", updateFeedback);
router.delete("/delete", deleteFeedback);

module.exports = router;

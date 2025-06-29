const express = require("express");
const router = express.Router();
const { getProgress, updateProgress, getAllProgress, getFirstUnwatchedLesson } = require("../controllers/courseProgressController");
const { authenticateToken, isStudent } = require("../middleware/authMiddleware");

router.post("/update/:courseId", authenticateToken, updateProgress);
router.get("/unwatched-lesson", authenticateToken, isStudent, getFirstUnwatchedLesson);
router.get("/:courseId", authenticateToken, getProgress);
router.get("/", authenticateToken, getAllProgress);

module.exports = router;
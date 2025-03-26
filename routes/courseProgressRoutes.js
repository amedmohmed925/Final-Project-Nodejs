const express = require("express");
const router = express.Router();
const { getProgress, updateProgress, getAllProgress } = require("../controllers/courseProgressController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/:courseId", authenticateToken, getProgress);
router.post("/update/:courseId", authenticateToken, updateProgress);
router.get("/", authenticateToken, getAllProgress);

module.exports = router;
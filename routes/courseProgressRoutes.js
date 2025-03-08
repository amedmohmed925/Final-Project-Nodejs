const express = require("express");
const courseProgressController = require("../controllers/courseProgressController");
const router = express.Router();


router.get("/", courseProgressController.getAllCourseProgresses);


router.get("/course/:courseId/lesson/:lessonId/user/:userId", courseProgressController.getCourseProgress);


router.post("/", courseProgressController.createCourseProgress);


router.put("/course/:courseId/lesson/:lessonId/user/:userId", courseProgressController.updateCourseProgress);


router.delete("/course/:courseId", courseProgressController.deleteCourseProgress);

module.exports = router;
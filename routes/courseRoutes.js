const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const feedbackController = require('../controllers/feedbacksController');
const quizController = require('../controllers/quizController');
const groupController = require('../controllers/groupController');
const resourceController = require('../controllers/resourceController');
const {isTeacher} = require('../middleware/authMiddleware')
const { authenticateToken } = require("../middleware/authMiddleware");


router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', authenticateToken, courseController.addCourse);
router.get("/teacher/:teacherId", authenticateToken, isTeacher , courseController.getCoursesByTeacher);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);


router.get('/:id/feedbacks', feedbackController.getAllFeedbacks);
router.get('/:id/quizzies', quizController.getAllQuizzes);
router.get('/:id/groups', groupController.getAllGroups);
router.get('/:id/resources', resourceController.getResources);

module.exports = router;
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const feedbackController = require('../controllers/feedbacksController');
const quizController = require('../controllers/quizController');
const groupController = require('../controllers/groupController');
const resourceController = require('../controllers/resourceController');

// Course routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.addCourse);
router.put('/:id', courseController.updateCourse);
router.delete('/:id', courseController.deleteCourse);

// Nested routes
router.get('/:id/feedbacks', feedbackController.getAllFeedbacks);
router.get('/:id/quizzies', quizController.getQuizzes);
router.get('/:id/groups', groupController.getGroups);
router.get('/:id/resources', resourceController.getResources);

module.exports = router;
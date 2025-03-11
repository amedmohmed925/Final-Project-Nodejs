const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const feedbackController = require('../controllers/feedbacksController');
const quizController = require('../controllers/quizController');
const groupController = require('../controllers/groupController');
const resourceController = require('../controllers/resourceController');
const { isTeacher } = require('../middleware/authMiddleware');
const { authenticateToken } = require("../middleware/authMiddleware");
const upload = require('../multerConfig'); 

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of all courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get('/:id', courseController.getCourseById);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course with image and video uploads
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *                 description: The featured image file (jpeg, jpg, png)
 *               lessons:
 *                 type: string
 *                 description: JSON string of lessons (e.g., [{"title": "Lesson 1"}, {"title": "Lesson 2"}])
 *               lessonVideos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Video files for lessons (mp4, mov)
 *               quizzes:
 *                 type: string
 *                 description: JSON string of quizzes
 *               resources:
 *                 type: string
 *                 description: JSON string of resources
 *               tags:
 *                 type: string
 *                 description: JSON string of tags
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request (e.g., invalid file type or JSON format)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post(
  '/',
  upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'lessonVideos' }, 
  ]),
  courseController.addCourse
);

/**
 * @swagger
 * /courses/teacher/{teacherId}:
 *   get:
 *     summary: Get all courses by a specific teacher
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: The teacher ID
 *     responses:
 *       200:
 *         description: A list of courses for the teacher
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: No courses found for this teacher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 */
router.get("/teacher/:teacherId", authenticateToken, isTeacher, courseController.getCoursesByTeacher);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       400:
 *         description: Bad request
 */
router.put('/:id', courseController.updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', courseController.deleteCourse);

/**
 * @swagger
 * /courses/{id}/feedbacks:
 *   get:
 *     summary: Get all feedbacks for a specific course
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: A list of feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/:id/feedbacks', feedbackController.getAllFeedbacks);

/**
 * @swagger
 * /courses/{id}/quizzies:
 *   get:
 *     summary: Get all quizzes for a specific course
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: A list of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/:id/quizzies', quizController.getAllQuizzes);

/**
 * @swagger
 * /courses/{id}/groups:
 *   get:
 *     summary: Get all groups for a specific course
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: A list of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/:id/groups', groupController.getAllGroups);

/**
 * @swagger
 * /courses/{id}/resources:
 *   get:
 *     summary: Get all resources for a specific course
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: A list of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/:id/resources', resourceController.getResources);

module.exports = router;
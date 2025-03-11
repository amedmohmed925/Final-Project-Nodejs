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
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the course
 *         title:
 *           type: string
 *           description: The title of the course
 *         description:
 *           type: string
 *           description: The description of the course
 *         featuredImage:
 *           type: string
 *           description: URL of the uploaded featured image
 *         lessons:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the lesson
 *               videoUrl:
 *                 type: string
 *                 description: URL of the uploaded lesson video (if provided)
 *         quizzes:
 *           type: array
 *           items:
 *             type: string
 *             description: List of quiz titles or IDs
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *             description: List of resource URLs or titles
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             description: List of course tags
 *         teacherId:
 *           type: string
 *           description: The ID of the teacher who created the course
 *         __v:
 *           type: integer
 *           description: Mongoose version key
 *       example:
 *         _id: "1234567890abcdef12345678"
 *         title: "Introduction to Web Development"
 *         description: "Learn the basics of web development with HTML, CSS, and JavaScript."
 *         featuredImage: "https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/courses/featured_images/xxxxxxxx.jpg"
 *         lessons: [{ title: "Lesson 1: HTML Basics", videoUrl: "https://res.cloudinary.com/your_cloud_name/video/upload/v1234567890/courses/lesson_videos/xxxxxxxx.mp4" }]
 *         quizzes: []
 *         resources: []
 *         tags: ["web", "html", "css"]
 *         teacherId: "abcdef1234567890abcdef12"
 *         __v: 0
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
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
router.get('/', authenticateToken, courseController.getAllCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
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
router.get('/:id', authenticateToken, courseController.getCourseById);

/**
 * @swagger
 * /courses/:
 *   post:
 *     summary: Create a new course with image and video uploads
 *     description: Create a new course by providing a title, description, lessons, quizzes, resources, tags, and optionally uploading a featured image and lesson videos. Requires teacher authentication and teacher role.
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
 *                 description: The title of the course
 *                 example: "Introduction to Web Development"
 *               description:
 *                 type: string
 *                 description: The description of the course
 *                 example: "Learn the basics of web development with HTML, CSS, and JavaScript."
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *                 description: The featured image file (jpeg, jpg, or png)
 *               lessons:
 *                 type: string
 *                 description: JSON string of lessons (e.g., [{"title": "Lesson 1"}, {"title": "Lesson 2"}])
 *                 example: '[{"title": "Lesson 1: HTML Basics"}, {"title": "Lesson 2: CSS Basics"}]'
 *               lessonVideos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Video files for lessons (mp4 or mov, max 30 files)
 *               quizzes:
 *                 type: string
 *                 description: JSON string of quizzes
 *                 example: '[]'
 *               resources:
 *                 type: string
 *                 description: JSON string of resources
 *                 example: '[]'
 *               tags:
 *                 type: string
 *                 description: JSON string of tags
 *                 example: '["web", "html", "css"]'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request (e.g., invalid data, exceeded video limit, or file type error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 message: "Maximum 30 lesson videos are allowed"
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 message: "Invalid token"
 *       403:
 *         description: Forbidden (user is not a teacher)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 message: "Access denied: Only teachers can create courses"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 message: "Something went wrong"
 */
router.post(
  '/',
  authenticateToken,
  isTeacher,
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
 *     description: Retrieve all courses created by a specific teacher. Only accessible to authenticated teachers.
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
 *       403:
 *         description: Forbidden (user is not a teacher or unauthorized)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Access denied: Only teachers can access this endpoint"
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
 *     security:
 *       - bearerAuth: []
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
 *             example:
 *               title: "Updated Course Title"
 *               description: "Updated course description"
 *               featuredImage: "https://new-image-url.com"
 *     responses:
 *       200:
 *         description: Course updated successfully
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
 *               example:
 *                 message: "Course not found"
 *       400:
 *         description: Bad request (e.g., invalid data)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Invalid data"
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, courseController.updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
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
 *               example:
 *                 message: "Course deleted successfully"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Course not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *               example:
 *                 message: "Something went wrong"
 */
router.delete('/:id', authenticateToken, courseController.deleteCourse);

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
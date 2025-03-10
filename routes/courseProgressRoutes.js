// routes/courseProgressRoutes.js
const express = require("express");
const courseProgressController = require("../controllers/courseProgressController");
const router = express.Router();

/**
 * @swagger
 * /course-progress:
 *   get:
 *     summary: Retrieve all course progresses
 *     tags: [CourseProgress]
 *     responses:
 *       200:
 *         description: A list of all course progresses with populated user, course, and lesson data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseProgress'
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
router.get("/", courseProgressController.getAllCourseProgresses);

/**
 * @swagger
 * /course-progress/course/{courseId}/lesson/{lessonId}/user/{userId}:
 *   get:
 *     summary: Get course progress for a specific user, course, and lesson
 *     tags: [CourseProgress]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Course progress details with populated user, course, and lesson data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseProgress'
 *       400:
 *         description: Invalid IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Progress not found
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
router.get("/course/:courseId/lesson/:lessonId/user/:userId", courseProgressController.getCourseProgress);

/**
 * @swagger
 * /course-progress:
 *   post:
 *     summary: Create a new course progress
 *     tags: [CourseProgress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *               - lessonId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               courseId:
 *                 type: string
 *                 description: The ID of the course
 *               lessonId:
 *                 type: string
 *                 description: The ID of the lesson
 *               completed:
 *                 type: boolean
 *                 description: Whether the lesson is completed (optional)
 *               progressPercentage:
 *                 type: number
 *                 description: Progress percentage (optional)
 *               lastAccessedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Last access time (optional)
 *     responses:
 *       201:
 *         description: Course progress created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 progress:
 *                   $ref: '#/components/schemas/CourseProgress'
 *       400:
 *         description: Missing required fields
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
router.post("/", courseProgressController.createCourseProgress);

/**
 * @swagger
 * /course-progress/course/{courseId}/lesson/{lessonId}/user/{userId}:
 *   put:
 *     summary: Update course progress for a specific user, course, and lesson
 *     tags: [CourseProgress]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *                 description: Whether the lesson is completed (optional)
 *               progressPercentage:
 *                 type: number
 *                 description: Progress percentage (optional)
 *               lastAccessedAt:
 *                 type: string
 *                 format: date-time
 *                 description: Last access time (optional)
 *     responses:
 *       200:
 *         description: Course progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 progress:
 *                   $ref: '#/components/schemas/CourseProgress'
 *       400:
 *         description: Invalid IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Progress not found
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
router.put("/course/:courseId/lesson/:lessonId/user/:userId", courseProgressController.updateCourseProgress);

/**
 * @swagger
 * /course-progress/course/{courseId}:
 *   delete:
 *     summary: Delete all progress for a specific course
 *     tags: [CourseProgress]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course progress deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid course ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: No progress found for this course
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
router.delete("/course/:courseId", courseProgressController.deleteCourseProgress);

module.exports = router;
const express = require("express");
const {
    getAllUsers,
    getUserById,
    getCoursesByUser,
    getUserFeedbacks,
    getUserForums,
    getUserNotifications,
    getUserActivities,
    editUserInfo,
    deleteUser
} = require("../controllers/usersControllers");

const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns user data
 *       404:
 *         description: User not found
 */
router.get("/:id", getUserById);

/**
 * @swagger
 * /users/{id}/courses:
 *   get:
 *     summary: Get all courses the user is enrolled in
 *     tags: [Users]
 */
router.get("/:id/courses", getCoursesByUser);

/**
 * @swagger
 * /users/{id}/feedbacks:
 *   get:
 *     summary: Get all feedbacks the user has given
 *     tags: [Users]
 */
router.get("/:id/feedbacks", getUserFeedbacks);

/**
 * @swagger
 * /users/{id}/forums:
 *   get:
 *     summary: Get all forums written by the user
 *     tags: [Users]
 */
router.get("/:id/forums", getUserForums);

/**
 * @swagger
 * /users/{id}/notifications:
 *   get:
 *     summary: Get all notifications for the user
 *     tags: [Users]
 */
router.get("/:id/notifications", getUserNotifications);

/**
 * @swagger
 * /users/{id}/activities:
 *   get:
 *     summary: Get all activities done by the user
 *     tags: [Users]
 */
router.get("/:id/activities", getUserActivities);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Edit user information (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authenticateToken, editUserInfo);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticateToken, deleteUser);

module.exports = router;

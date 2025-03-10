// routes/forumRoutes.js
const express = require("express");
const forumController = require("../controllers/forumController");
const router = express.Router();

/**
 * @swagger
 * /forums:
 *   get:
 *     summary: Retrieve all forums
 *     tags: [Forums]
 *     responses:
 *       200:
 *         description: A list of all forums with populated user data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Forum'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/", forumController.getAllForums);

/**
 * @swagger
 * /forums/{id}:
 *   get:
 *     summary: Get a forum by ID
 *     tags: [Forums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *     responses:
 *       200:
 *         description: Forum details with populated user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forum'
 *       400:
 *         description: Invalid forum ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Forum not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get("/:id", forumController.getForumById);

/**
 * @swagger
 * /forums:
 *   post:
 *     summary: Create a new forum
 *     tags: [Forums]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - content
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user creating the forum
 *               title:
 *                 type: string
 *                 description: The title of the forum
 *               content:
 *                 type: string
 *                 description: The content of the forum
 *     responses:
 *       201:
 *         description: Forum created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 forum:
 *                   $ref: '#/components/schemas/Forum'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post("/", forumController.createForum);

/**
 * @swagger
 * /forums/{id}:
 *   put:
 *     summary: Update a forum by ID
 *     tags: [Forums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the forum
 *     responses:
 *       200:
 *         description: Forum updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 forum:
 *                   $ref: '#/components/schemas/Forum'
 *       400:
 *         description: Invalid forum ID or missing content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Forum not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.put("/:id", forumController.updateForum);

/**
 * @swagger
 * /forums/{id}:
 *   delete:
 *     summary: Delete a forum by ID
 *     tags: [Forums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The forum ID
 *     responses:
 *       200:
 *         description: Forum deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid forum ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Forum not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.delete("/:id", forumController.deleteForum);

module.exports = router;
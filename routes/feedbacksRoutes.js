// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const { getAllFeedbacks, getFeedbackById, addFeedback, updateFeedback, deleteFeedback } = require("../controllers/feedbacksController");

/**
 * @swagger
 * /feedbacks:
 *   get:
 *     summary: Retrieve all feedbacks
 *     tags: [Feedbacks]
 *     responses:
 *       200:
 *         description: A list of all feedbacks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Feedback'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/", getAllFeedbacks);

/**
 * @swagger
 * /feedbacks/{_id}:
 *   get:
 *     summary: Get a feedback by ID
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: The feedback ID
 *     responses:
 *       200:
 *         description: Feedback details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       404:
 *         description: Feedback not found
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
 *                 error:
 *                   type: string
 */
router.get("/:_id", getFeedbackById);

/**
 * @swagger
 * /feedbacks/add:
 *   post:
 *     summary: Create a new feedback
 *     tags: [Feedbacks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *               - comment
 *               - rating
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user providing the feedback
 *               courseId:
 *                 type: string
 *                 description: The ID of the course being reviewed
 *               comment:
 *                 type: string
 *                 description: The feedback comment
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Rating between 1 and 10
 *     responses:
 *       200:
 *         description: Feedback created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Bad request (missing fields or invalid rating)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/add", addFeedback);

/**
 * @swagger
 * /feedbacks/update:
 *   put:
 *     summary: Update an existing feedback
 *     tags: [Feedbacks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The ID of the feedback to update
 *               comment:
 *                 type: string
 *                 description: Updated feedback comment (optional)
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Updated rating between 1 and 10 (optional)
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       400:
 *         description: Bad request (missing ID or invalid rating)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Feedback not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.put("/update", updateFeedback);

/**
 * @swagger
 * /feedbacks/delete:
 *   delete:
 *     summary: Delete a feedback
 *     tags: [Feedbacks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *             properties:
 *               _id:
 *                 type: string
 *                 description: The ID of the feedback to delete
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (missing ID)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Feedback not found
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
 *                 error:
 *                   type: string
 */
router.delete("/delete", deleteFeedback);

module.exports = router;
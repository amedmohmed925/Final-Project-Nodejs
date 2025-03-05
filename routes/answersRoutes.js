const express = require("express");
const router = express.Router();
const {
  getAllAnswers,
  getAnswerById,
  addAnswer,
  updateAnswer,
  deleteAnswer,
} = require("../controllers/answersController");

/**
 * @swagger
 * tags:
 *   name: Answers
 *   description: API for managing answers
 */

/**
 * @swagger
 * /answers:
 *   get:
 *     summary: Get all answers
 *     tags: [Answers]
 *     responses:
 *       200:
 *         description: A list of answers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Answer'
 */
router.get("/", getAllAnswers);

/**
 * @swagger
 * /answers/{id}:
 *   get:
 *     summary: Get an answer by ID
 *     tags: [Answers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The answer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Answer'
 *       404:
 *         description: Answer not found
 */
router.get("/:_id", getAnswerById);

/**
 * @swagger
 * /answers/add:
 *   post:
 *     summary: Add a new answer
 *     tags: [Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerInput'
 *     responses:
 *       201:
 *         description: The created answer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Invalid input
 */
router.post("/add", addAnswer);

/**
 * @swagger
 * /answers/update:
 *   put:
 *     summary: Update an answer
 *     tags: [Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnswerUpdate'
 *     responses:
 *       200:
 *         description: The updated answer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Answer'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Answer not found
 */
router.put("/update", updateAnswer);

/**
 * @swagger
 * /answers/delete:
 *   delete:
 *     summary: Delete an answer
 *     tags: [Answers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer deleted successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Answer not found
 */
router.delete("/delete", deleteAnswer);

/**
 * @swagger
 * components:
 *   schemas:
 *     Answer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         isCorrect:
 *           type: boolean
 *         questionId:
 *           type: string
 *       example:
 *         _id: 64f1b1e2b2c4f3a5d8e9f0a1
 *         content: "This is a sample answer"
 *         isCorrect: true
 *         questionId: "64f1b1e2b2c4f3a5d8e9f0a2"
 *     AnswerInput:
 *       type: object
 *       required:
 *         - content
 *         - isCorrect
 *         - questionId
 *       properties:
 *         content:
 *           type: string
 *         isCorrect:
 *           type: boolean
 *         questionId:
 *           type: string
 *       example:
 *         content: "This is a sample answer"
 *         isCorrect: true
 *         questionId: "64f1b1e2b2c4f3a5d8e9f0a2"
 *     AnswerUpdate:
 *       type: object
 *       required:
 *         - _id
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         isCorrect:
 *           type: boolean
 *       example:
 *         _id: "64f1b1e2b2c4f3a5d8e9f0a1"
 *         content: "Updated answer content"
 *         isCorrect: false
 */

module.exports = router;
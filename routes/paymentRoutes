const express = require("express");
const router = express.Router();
const  paymentController  = require("../controllers/paymentController");


/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: API for processing payments
 */

/**
 * @swagger
 * /payments/process:
 *   post:
 *     summary: Process a payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInput'
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input
 */
router.post("/process", paymentController);

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: ["pending", "completed", "failed"]
 *         userId:
 *           type: string
 *       example:
 *         _id: "64f1b1e2b2c4f3a5d8e9f0a1"
 *         amount: 100.50
 *         status: "completed"
 *         userId: "64f1b1e2b2c4f3a5d8e9f0a2"
 *     PaymentInput:
 *       type: object
 *       required:
 *         - amount
 *         - userId
 *       properties:
 *         amount:
 *           type: number
 *         userId:
 *           type: string
 *       example:
 *         amount: 50.75
 *         userId: "64f1b1e2b2c4f3a5d8e9f0a2"
 */

module.exports =  router ;

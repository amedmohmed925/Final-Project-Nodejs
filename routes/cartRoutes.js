const express = require("express");
const { addCart, removeCart, getCart, checkout, applyCoupon } = require("../controllers/cartControllers");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API endpoints for cart management
 */

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add a course to the cart
 *     description: Adds a course to the user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to add
 *     responses:
 *       200:
 *         description: Course added to cart successfully
 *       400:
 *         description: Invalid user ID or course ID
 */
router.post("/add", authenticateToken, addCart);

/**
 * @swagger
 * /cart/remove:
 *   post:
 *     summary: Remove a course from the cart
 *     description: Removes a course from the user's cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to remove
 *     responses:
 *       200:
 *         description: Course removed from cart successfully
 *       400:
 *         description: Invalid user ID or course ID
 */
router.post("/remove", authenticateToken, removeCart);

/**
 * @swagger
 * /cart/{userId}:
 *   get:
 *     summary: Get cart details for a user
 *     description: Retrieves the current cart contents for a user.
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart details retrieved successfully
 *       404:
 *         description: Cart not found for the given user
 */
router.get("/:userId", authenticateToken, getCart);

/**
 * @swagger
 * /cart/checkout:
 *   post:
 *     summary: Checkout and complete the purchase
 *     description: This endpoint finalizes the purchase, marks all cart items as purchased, and resets the cart.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user making the purchase
 *     responses:
 *       200:
 *         description: Checkout successful, cart is emptied
 *       400:
 *         description: Cart is empty or user not found
 *       500:
 *         description: Server error
 */
router.post("/checkout", authenticateToken, checkout);

/**
 * @swagger
 * /cart/apply-coupon:
 *   post:
 *     summary: Apply a discount coupon to the cart
 *     description: This endpoint applies a discount coupon based on the total price (not finalTotal). The discount is percentage-based.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user applying the coupon
 *               couponCode:
 *                 type: string
 *                 description: The coupon code to apply
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid coupon code or expired coupon
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
router.post("/apply-coupon", authenticateToken, applyCoupon);

module.exports = router;

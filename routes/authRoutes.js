const express = require("express");
const { register, login, verifyOTP, resendOTP,  refreshToken, logout, getCurrentUser, forgetPassword, resetPassword, } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

/**
 * @swagger
 * /v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       ### For Students
 *       - **Required:** username, password, confirm_password, email, firstName, lastName, dob, role
 *       - **Optional:** bio, socialMedia (facebook, twitter, linkedin, instagram)
 *       
 *       ### For Teachers
 *       - **Required:** username, password, confirm_password, email, firstName, lastName, dob, role, certificates, graduationYear, university, major
 *       - **Optional:** bio, socialMedia (facebook, twitter, linkedin, instagram)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - username
 *               - password
 *               - confirm_password
 *               - email
 *               - firstName
 *               - lastName
 *               - dob
 *               - role
 *             allOf:
 *               - if:
 *                   properties:
 *                     role:
 *                       const: teacher
 *                 then:
 *                   required:
 *                     - certificates
 *                     - graduationYear
 *                     - university
 *                     - major
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               role:
 *                 type: string
 *                 enum: [teacher, student, admin, advertiser]
 *               certificates:
 *                 type: array
 *                 items:
 *                   type: string
 *               graduationYear:
 *                 type: number
 *               university:
 *                 type: string
 *               major:
 *                 type: string
 *               bio:
 *                 type: string
 *               socialMedia:
 *                 type: object
 *                 properties:
 *                   facebook:
 *                     type: string
 *                   twitter:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *                   instagram:
 *                     type: string
 *     responses:
 *       201:
 *         description: User registered successfully. Please check your email for OTP.
 *       400:
 *         description: User already exists or passwords do not match or missing teacher fields
 */
router.post("/register", register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials or account not verified
 */
router.post("/login", login);


/**
 * @swagger
 * /verify-otp:
 *   post:
 *     summary: Verify OTP to activate account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified successfully. You can now login.
 *       400:
 *         description: Invalid OTP or missing fields or OTP expired
 *       404:
 *         description: User not found
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /resend-otp:
 *   post:
 *     summary: Resend OTP to the user's email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Invalid email or user not found
 *       500:
 *         description: Server error
 */
router.post("/resend-otp", resendOTP);


/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       403:
 *         description: Invalid refresh token
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Server error
 */
router.post("/logout", logout);

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user information
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticateToken, getCurrentUser);

/**
 * @swagger
 * /forget-password:
 *   post:
 *     summary: Request OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset link sent to your email.
 *       404:
 *         description: User not found
 */
router.post("/forget-password", forgetPassword);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset user password using OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token or weak password
 *       404:
 *         description: User not found
 */
router.post("/reset-password", resetPassword);

module.exports = router;
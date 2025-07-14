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
    deleteUser,
    getAllTeachers,
    updateProfileImage,
    getStudentsCount,
    getTeachersCount,
    getPurchasedCourses,
    getVerifiedTeachers,
    getTeacherDetails
} = require("../controllers/userController");

const { authenticateToken , isAdmin} = require("../middleware/authMiddleware");
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed'));
      }
    }
  });

const router = express.Router();


router.get('/students/count', getStudentsCount);
router.get('/teachers/count', getTeachersCount);

router.get("/teachers", getAllTeachers); // مسار جديد لجلب المعلمين
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
router.get("/",authenticateToken, isAdmin, getAllUsers);


/**
 * @swagger
 * /users/{id}/profile-image:
 *   put:
 *     summary: Update user profile image (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *       400:
 *         description: No image file provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put("/:id/profile-image", 
    authenticateToken, 
    upload.single('image'), 
    updateProfileImage
  );
  
  module.exports = router;


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
router.get("/:id",authenticateToken, getUserById);

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

/**
 * @swagger
 * /users/{id}/purchased-courses:
 *   get:
 *     summary: Get all purchased courses by the user
 *     tags: [Users]
 */
router.get('/:id/purchased-courses', authenticateToken, getPurchasedCourses);

/**
 * @swagger
 * /teachers/verified:
 *   get:
 *     summary: Get all verified teachers
 *     tags: [Users]
 */
router.get("/teachers/verified", getVerifiedTeachers);

/**
 * @swagger
 * /teacher/{id}/details:
 *   get:
 *     summary: Get teacher details excluding email and username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns teacher details
 *       404:
 *         description: Teacher not found
 */
router.get("/teacher/:id/details", getTeacherDetails);

module.exports = router;
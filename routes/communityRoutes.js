// communityRoutes.js
const express = require("express");
const router = express.Router();
const {
  createPost,
  getPosts,
  likePost,
  createComment,
  getComments,
  createGroup,
  getGroups,
  getNotifications,
} = require("../controllers/communityController");
const {authenticateToken} = require("../middleware/authMiddleware");

router.post("/posts", authenticateToken , createPost);
router.get("/posts" , getPosts);
router.post("/posts/:postId/like", authenticateToken , likePost);

router.post("/comments", authenticateToken , createComment);
router.get("/comments/:postId", authenticateToken , getComments);

router.post("/groups", authenticateToken , createGroup);
router.get("/groups", authenticateToken , getGroups);

router.get("/notifications", authenticateToken , getNotifications);

module.exports = router;
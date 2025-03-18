const express = require("express");
const router = express.Router();
const communityController = require("../controllers/communityController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/posts", authenticateToken, communityController.createPost);
router.get("/posts", communityController.getPosts);
router.post("/posts/:postId/like", authenticateToken, communityController.likePost);

router.post("/comments", authenticateToken, communityController.createComment);
router.get("/comments/:postId", authenticateToken, communityController.getComments);

router.post("/groups", authenticateToken, communityController.createGroup);
router.get("/groups", authenticateToken, communityController.getGroups);
router.post("/groups/:groupId/accept", authenticateToken, communityController.acceptGroupInvite);
router.post("/groups/:groupId/message", authenticateToken, communityController.sendGroupMessage);

router.post("/chatrooms", authenticateToken, communityController.createChatRoom);
router.get("/chatrooms", authenticateToken, communityController.getChatRooms);

router.post("/notifications/admin", authenticateToken, communityController.sendAdminNotification);
router.get("/notifications", authenticateToken, communityController.getNotifications);

router.get("/stats", authenticateToken, communityController.getActivityStats);

module.exports = router;
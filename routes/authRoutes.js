const express = require("express");
const { register, login, refreshToken, logout, getCurrentUser } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", authenticateToken, logout);
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;

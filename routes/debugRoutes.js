// Temporary endpoint to debug current user
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Course = require('../models/Course');

// GET /api/v1/debug/me - Check current authenticated user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('=== Current User Debug ===');
    console.log('User ID:', req.user.id);
    console.log('User object:', req.user);
    
    // Find courses this user purchased (enrolled in)
    const User = require('../models/User');
    const currentUser = await User.findById(req.user.id).populate('purchasedCourses', '_id title');
    console.log('Purchased courses:', currentUser?.purchasedCourses);
    
    // Also check if user is in any course's students array (alternative method)
    const enrolledCourses = await Course.find({ students: req.user.id }).select('_id title');
    console.log('Enrolled via students array:', enrolledCourses);
    
    res.json({
      user: req.user,
      purchasedCourses: currentUser?.purchasedCourses || [],
      enrolledCourses: enrolledCourses,
      message: 'Check console for debug info'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

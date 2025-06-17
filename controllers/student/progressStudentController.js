// controllers/student/progressStudentController.js
const CourseProgress = require('../../models/CourseProgress');
const Course = require('../../models/Course');

exports.myCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const progress = await CourseProgress.findOne({ user: userId, course: courseId });
    res.json(progress || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

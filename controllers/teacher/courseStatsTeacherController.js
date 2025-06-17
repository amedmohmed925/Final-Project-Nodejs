// controllers/teacher/courseStatsTeacherController.js
const Course = require('../../models/Course');
const Feedback = require('../../models/Feedback');
const CourseProgress = require('../../models/CourseProgress');

exports.getCourseStats = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacherId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    // عدد الطلاب
    const totalStudents = course.students ? course.students.length : 0;
    // متوسط التقييم
    const feedbacks = await Feedback.find({ courseId, visible: true });
    const avgRating = feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2) : 0;
    // نسبة الإنجاز
    const progresses = await CourseProgress.find({ course: courseId });
    const completedCount = progresses.filter(p => p.completed).length;
    const completionRate = totalStudents ? ((completedCount / totalStudents) * 100).toFixed(2) : 0;
    res.json({
      totalStudents,
      avgRating: Number(avgRating),
      feedbackCount: feedbacks.length,
      completionRate: Number(completionRate)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

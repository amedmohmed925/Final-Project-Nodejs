// controllers/teacher/progressTeacherController.js
const Course = require('../../models/Course');
const CourseProgress = require('../../models/CourseProgress');
const User = require('../../models/User');

exports.courseProgressStats = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    const progresses = await CourseProgress.find({ course: courseId });
    const students = await User.find({ _id: { $in: course.students } }, 'name email');
    const stats = students.map(student => {
      const progress = progresses.find(p => p.user.toString() === student._id.toString());
      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        progress: progress ? progress.progress : 0,
        completed: progress ? progress.completed : false
      };
    });
    const completedCount = stats.filter(s => s.completed).length;
    res.json({
      totalStudents: students.length,
      completedCount,
      students: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

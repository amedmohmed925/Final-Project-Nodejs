// controllers/student/coursesStudentController.js
const Course = require('../../models/Course');
const User = require('../../models/User');

exports.myCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await Course.find({ students: userId });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unsubscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    course.students = course.students.filter(id => id.toString() !== userId);
    await course.save();
    res.json({ message: 'Unsubscribed from course' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.myPurchasedCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: 'purchasedCourses',
      model: 'Course',
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.purchasedCourses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

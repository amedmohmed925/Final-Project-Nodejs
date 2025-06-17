// controllers/teacher/studentsTeacherController.js
const Course = require('../../models/Course');
const User = require('../../models/User');
const CourseProgress = require('../../models/CourseProgress');
const Joi = require('joi');

exports.listStudents = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    const students = await User.find({ _id: { $in: course.students } }, '-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    if (!courseId || !studentId) return res.status(400).json({ error: 'courseId and studentId are required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    course.students = course.students.filter(id => id.toString() !== studentId);
    await course.save();
    res.json({ message: 'Student removed from course' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const { courseId, studentId } = req.query;
    if (!courseId || !studentId) return res.status(400).json({ error: 'courseId and studentId are required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    const progress = await CourseProgress.findOne({ course: courseId, user: studentId });
    res.json(progress || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

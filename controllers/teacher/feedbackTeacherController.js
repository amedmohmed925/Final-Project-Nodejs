// controllers/teacher/feedbackTeacherController.js
const Feedback = require('../../models/Feedback');
const Course = require('../../models/Course');
const Joi = require('joi');

exports.listCourseFeedbacks = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.teacherId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    const feedbacks = await Feedback.find({ courseId }).populate('userId', 'firstName lastName profileImage').sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replyToFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'Reply is required' });
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    const course = await Course.findById(feedback.courseId);
    if (!course || course.teacherId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    feedback.reply = reply;
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleFeedbackVisibility = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    const course = await Course.findById(feedback.courseId);
    if (!course || course.teacherId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your course' });
    feedback.visible = !feedback.visible;
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

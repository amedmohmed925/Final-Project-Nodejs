const Course = require('../models/Course');

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addCourse = async (req, res) => {
  const { title, description, featuredImage, lessons, quizzes, resources, tags } = req.body;
  const teacherId = req.user.id;

  try {
    const newCourse = new Course({ title, description, featuredImage, lessons, quizzes, resources, tags, teacherId });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.getCoursesByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const courses = await Course.find({ teacherId });
    
    if (!courses.length) {
      return res.status(404).json({ message: "No courses found for this teacher" });
    }

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateCourse = async (req, res) => {
  const { title, description, featuredImage } = req.body;
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, featuredImage },
      { new: true }
    );
    if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
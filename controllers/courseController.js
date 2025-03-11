
const Course = require('../models/Course');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs'); 

exports.addCourse = async (req, res) => {
  const { title, description, lessons, quizzes, resources, tags } = req.body;
  const teacherId = req.user.id;

  try {

    const lessonVideos = req.files && req.files.lessonVideos ? req.files.lessonVideos : [];
    if (lessonVideos.length > 30) {
      return res.status(400).json({ message: 'Maximum 30 lesson videos are allowed' });
    }


    let featuredImageUrl = '';
    if (req.files && req.files.featuredImage) {
      const featuredImage = req.files.featuredImage[0];
      const result = await cloudinary.uploader.upload(featuredImage.path, {
        folder: 'courses/featured_images',
        resource_type: 'image',
      });
      featuredImageUrl = result.secure_url;
      fs.unlinkSync(featuredImage.path);
    }

    const parsedLessons = lessons ? JSON.parse(lessons) : [];

    const lessonsWithVideos = [];
for (let index = 0; index < parsedLessons.length; index++) {
  const lesson = parsedLessons[index];
  if (lessonVideos[index]) {
    const video = lessonVideos[index];
    const result = await cloudinary.uploader.upload(video.path, {
      folder: 'courses/lesson_videos',
      resource_type: 'video',
      chunk_size: 6000000,
    });
    fs.unlinkSync(video.path);
    lessonsWithVideos.push({ ...lesson, videoUrl: result.secure_url });
  } else {
    lessonsWithVideos.push(lesson);
  }
}

    const newCourse = new Course({
      title,
      description,
      featuredImage: featuredImageUrl,
      lessons: lessonsWithVideos,
      quizzes: quizzes ? JSON.parse(quizzes) : [],
      resources: resources ? JSON.parse(resources) : [],
      tags: tags ? JSON.parse(tags) : [],
      teacherId,
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    if (req.files) {
      if (req.files.featuredImage) {
        fs.unlinkSync(req.files.featuredImage[0].path);
      }
      if (req.files.lessonVideos) {
        req.files.lessonVideos.forEach((file) => fs.unlinkSync(file.path));
      }
    }
    res.status(400).json({ message: err.message });
  }
};

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
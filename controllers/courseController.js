const Course = require('../models/Course');
const Resource = require('../models/Resource');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs');

exports.addCourse = async (req, res) => {
  const { title, description, price, level, category, lessons, resources, tags } = req.body;
  const teacherId = req.user.id;

  try {
    const lessonVideos = req.files && req.files.lessonVideos ? req.files.lessonVideos : [];
    const lessonThumbnails = req.files && req.files.lessonThumbnails ? req.files.lessonThumbnails : [];
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
      if (fs.existsSync(featuredImage.path)) fs.unlinkSync(featuredImage.path); // التحقق قبل الحذف
    }

    // تحليل الدروس
    let parsedLessons = [];
    if (lessons) {
      if (Array.isArray(lessons)) {
        parsedLessons = lessons.map((lesson) => {
          try {
            return JSON.parse(lesson);
          } catch (e) {
            return { title: '', content: '', quiz: '' };
          }
        });
      } else {
        try {
          parsedLessons = JSON.parse(lessons);
          if (!Array.isArray(parsedLessons)) {
            parsedLessons = [parsedLessons];
          }
        } catch (e) {
          parsedLessons = [];
        }
      }
    }

    const lessonsWithFiles = parsedLessons.map((lesson, index) => ({
      ...lesson,
      videoUrl: lessonVideos[index] ? `pending:${lessonVideos[index].filename}` : '',
      thumbnailUrl: lessonThumbnails[index] ? `pending:${lessonThumbnails[index].filename}` : '',
    }));

    // إنشاء الكورس أولاً بدون الموارد
    const newCourse = new Course({
      title,
      description,
      featuredImage: featuredImageUrl,
      lessons: lessonsWithFiles,
      resources: [], // سنضيف الموارد لاحقًا
      tags: tags ? JSON.parse(tags) : [],
      teacherId,
      price: parseFloat(price),
      level,
      category,
    });

    await newCourse.save(); // حفظ الكورس للحصول على _id

    // تحليل وإنشاء الموارد مع إضافة courseId
    const parsedResources = resources ? JSON.parse(resources) : [];
    const resourceIds = await Promise.all(
      parsedResources.map(async (resource) => {
        const newResource = new Resource({
          ...resource,
          courseId: newCourse._id, // إضافة courseId
        });
        await newResource.save();
        return newResource._id;
      })
    );

    // تحديث الكورس بمعرفات الموارد
    newCourse.resources = resourceIds;
    await newCourse.save();

    res.status(201).json({
      ...newCourse._doc,
      message: 'Course created, videos and thumbnails are being uploaded in the background',
    });

    // رفع الفيديوهات والصور المصغرة في الخلفية
    if (lessonVideos.length > 0 || lessonThumbnails.length > 0) {
      lessonsWithFiles.forEach(async (lesson, index) => {
        try {
          if (lessonVideos[index]) {
            const videoResult = await cloudinary.uploader.upload(lessonVideos[index].path, {
              folder: 'courses/lesson_videos',
              resource_type: 'video',
              chunk_size: 6000000,
            });
            newCourse.lessons[index].videoUrl = videoResult.secure_url;
            if (fs.existsSync(lessonVideos[index].path)) fs.unlinkSync(lessonVideos[index].path);
          }

          if (lessonThumbnails[index]) {
            const thumbResult = await cloudinary.uploader.upload(lessonThumbnails[index].path, {
              folder: 'courses/lesson_thumbnails',
              resource_type: 'image',
            });
            newCourse.lessons[index].thumbnailUrl = thumbResult.secure_url;
            if (fs.existsSync(lessonThumbnails[index].path)) fs.unlinkSync(lessonThumbnails[index].path);
          }

          await newCourse.save();
        } catch (uploadErr) {
          console.log(`Failed to upload files for lesson ${index + 1}:`, uploadErr);
        }
      });
    }
  } catch (err) {
    console.log('Error in addCourse:', err);
    if (req.files) {
      if (req.files.featuredImage && fs.existsSync(req.files.featuredImage[0]?.path)) {
        fs.unlinkSync(req.files.featuredImage[0].path);
      }
      if (req.files.lessonVideos) {
        req.files.lessonVideos.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
      if (req.files.lessonThumbnails) {
        req.files.lessonThumbnails.forEach((file) => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
    }
    res.status(500).json({ message: err.message });
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
      return res.status(404).json({ message: 'No courses found for this teacher' });
    }
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { title, description, featuredImage, price, level } = req.body;
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        featuredImage,
        price: price ? parseFloat(price) : undefined, // تحديث السعر إذا تم تمريره
        level, // تحديث المستوى إذا تم تمريره
      },
      { new: true, runValidators: true } // تشغيل التحقق من الصحة
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
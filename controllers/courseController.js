
const Course = require('../models/Course');
const cloudinary = require('../cloudinaryConfig');
const fs = require('fs'); 


exports.addCourse = async (req, res) => {
  console.log('Inside addCourse, User:', req.user);
  const { title, description, lessons, quizzes, resources, tags } = req.body;
  const teacherId = req.user.id;

  try {
    console.log('Request Body:', req.body);
    console.log('Files:', req.files);

    const lessonVideos = req.files && req.files.lessonVideos ? req.files.lessonVideos : [];
    if (lessonVideos.length > 30) {
      return res.status(400).json({ message: 'Maximum 30 lesson videos are allowed' });
    }

    // رفع الصورة المميزة (Featured Image) بشكل متزامن لأنها صغيرة
    let featuredImageUrl = '';
    if (req.files && req.files.featuredImage) {
      console.log('Uploading featured image...');
      const featuredImage = req.files.featuredImage[0];
      const result = await cloudinary.uploader.upload(featuredImage.path, {
        folder: 'courses/featured_images',
        resource_type: 'image',
      });
      featuredImageUrl = result.secure_url;
      fs.unlinkSync(featuredImage.path);
      console.log('Featured Image Uploaded:', featuredImageUrl);
    }

    // تحليل الدروس وتحضيرها مع روابط مؤقتة للفيديوهات
    const parsedLessons = lessons ? JSON.parse(lessons) : [];
    const lessonsWithVideos = parsedLessons.map((lesson, index) => ({
      ...lesson,
      videoUrl: lessonVideos[index] ? `pending:${lessonVideos[index].filename}` : '', // رابط مؤقت
    }));

    // إنشاء الكورس وحفظه
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
    console.log('Course Saved Initially:', newCourse._id);

    // إرجاع الـ response فورًا
    res.status(201).json({
      ...newCourse._doc,
      message: 'Course created, videos are being uploaded in the background',
    });

    // رفع الفيديوهات في الخلفية
    if (lessonVideos.length > 0) {
      lessonVideos.forEach(async (video, index) => {
        try {
          console.log(`Starting background upload for video ${index + 1}...`);
          const result = await cloudinary.uploader.upload(video.path, {
            folder: 'courses/lesson_videos',
            resource_type: 'video',
            chunk_size: 6000000, // 6MB chunks للتعامل مع الأحجام الكبيرة
          });
          console.log(`Video ${index + 1} Uploaded:`, result.secure_url);

          // تحديث الدرس بالرابط الجديد
          newCourse.lessons[index].videoUrl = result.secure_url;
          await newCourse.save();
          console.log(`Course Updated with Video ${index + 1}`);

          // حذف الملف المؤقت بعد الرفع
          fs.unlinkSync(video.path);
        } catch (uploadErr) {
          console.log(`Failed to upload video ${index + 1}:`, uploadErr);
          // ممكن تضيف آلية لإعادة المحاولة أو تسجيل الفشل للمعالجة لاحقًا
        }
      });
    }
  } catch (err) {
    console.log('Error in addCourse:', err);
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